use std::str::FromStr;

use crate::coin_helpers::{assert_sent_sufficient_coin, generate_nft_class_id, generate_nft_id};
use crate::contract::{FEE_DENOM, NFT_CLASS_PREFIX, NFT_CLASS_SUFFIX_PROFILE};
use crate::error::ContractError;
use crate::models::did::DID;
use crate::models::subscription_info::SubscriptionInfo;
use crate::msg::GetSubscriptionListResponse;
use crate::state::{CONFIG, DID_PROFILE_MAP, USERNAME_PROFILE_MAP, WALLET_PROFILE_MAP};
use coreum_wasm_sdk::core::{CoreumMsg, CoreumQueries};
use coreum_wasm_sdk::nft::{self, BalanceResponse, NFTsResponse};
use coreum_wasm_sdk::pagination::PageRequest;
// use coreum_wasm_sdk::shim::Any;
use coreum_wasm_sdk::types::coreum::asset::nft::v1::{
    DataDynamic, DataDynamicIndexedItem, DataDynamicItem, DataEditor, MsgMint, MsgUpdateData,
};
use cosmwasm_std::{
    coin, coins, from_json, to_json_binary, Addr, BankMsg, Binary, Coin, CosmosMsg, Decimal, Deps,
    DepsMut, Env, MessageInfo, QueryRequest, Response, StdError, StdResult, Uint128, Uint64,
};

// hash function used to map an arbitrary length string (i.e. DID) into a base64 string of length n
// needed for using DID as part of the NFT id
pub fn hash_did(s: &str, n: usize) -> String {
    let mut ret = base64::encode(s);

    // match the string to this regex before returning it: ^[a-zA-Z][a-zA-Z0-9/:._-]{2,100}$
    // replacing all characters which don't match with an empty string
    // and keep the length of the string to n

    ret = ret
        .chars()
        .filter(|c| {
            c.is_alphanumeric() || *c == '/' || *c == ':' || *c == '.' || *c == '_' || *c == '-'
        })
        .collect();

    // return the first n characters
    ret.chars().take(n).collect()
}

pub fn subscribe(
    deps: DepsMut<CoreumQueries>,
    env: Env,
    info: MessageInfo,
    subscribe_to: DID,
) -> Result<Response<CoreumMsg>, ContractError> {
    // check if request has sufficient amount of coins attached
    let price: Coin = from_json(get_subscription_price(
        deps.as_ref(),
        subscribe_to.get_value().clone(),
    )?)?;
    deps.api
        .debug(format!("sub price: {}", price.amount).as_str());
    assert_sent_sufficient_coin(&info.funds, Some(price.clone()))?;

    let mut response = Response::default();

    // compute the refund
    if price.amount != Uint128::zero() {
        // returns error if 0 or 2+ coins are sent
        let mut coins_sent: Option<&Coin> = None;
        if !info.funds.is_empty() && info.funds.len() < 2 {
            coins_sent = Some(info.funds.get(0).unwrap())
        };

        if coins_sent.is_none() {
            return Err(ContractError::InsufficientFundsSend {
                sent: Some(coin(0u128, price.denom.clone())),
                expected: Some(price.clone()),
            });
        } else {
            // if yes, refund the surplus
            let refund_amount = coins_sent
                .unwrap()
                .amount
                .checked_sub(price.amount)
                .map_err(|_| StdError::generic_err("Overflow error"))?;
            let mut refund = Coin {
                denom: price.denom.clone(),
                amount: refund_amount,
            };

            if refund.amount.is_zero() {
                refund = Coin {
                    denom: FEE_DENOM.to_owned(),
                    amount: 0u128.into(),
                };
            }

            response = response.add_attribute("refund", refund.to_string());
        }
    }

    // convert the sender wallet to DID
    let subscriber_profile = WALLET_PROFILE_MAP
        .may_load(deps.storage, info.sender.clone().to_string())?
        .ok_or(StdError::generic_err(format!(
            "Couldn't find the subscriber's DID for wallet {} in the contract registry",
            info.sender
        )))?;

    // convert the subscribed_to DID into a wallet
    let subscribed_to_wallet = DID_PROFILE_MAP
        .may_load(deps.storage, subscribe_to.to_string().clone())?
        .ok_or(StdError::generic_err(format!(
            "Couldn't fetch the wallet info from the registry for the DID subscribing to: {}",
            subscribe_to
        )))?;

    // get the profile info for the subscribed_to DID
    let profile_info = DID_PROFILE_MAP
        .may_load(deps.storage, subscribe_to.to_string().clone())?
        .unwrap();

    // mint the subscription NFT
    // doc ref:         https://docs.coreum.dev/docs/modules/coreum-non-fungible-token#interaction-with-nft-module-introducing-wnft-module
    // example ref:     https://github.com/CoreumFoundation/coreum/blob/f349a68ed04a3fa6e1cf7fcd0430a46949e30f6f/integration-tests/contracts/modules/nft/src/contract.rs
    let nft_class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    let nft_id = generate_nft_id(
        env.clone(),
        info.sender.clone(),
        subscribed_to_wallet.wallet.clone(),
    ); // info.sender.to_string(); // try getting existing subscription first
    response = response.add_attribute("nft_id", nft_id.to_string());

    let existing_subscription_res = get_subscription_info(
        deps.as_ref(),
        env.clone(),
        subscribe_to.clone(),
        subscriber_profile.wallet.clone(),
    )?;
    let existing_subscription_res =
        from_json::<Option<SubscriptionInfo>>(&existing_subscription_res)?;
    if let Some(existing_subscription_res) = existing_subscription_res {
        // existing subscription found, update the validity date
        let mut existing_subscription: SubscriptionInfo = existing_subscription_res.clone();

        existing_subscription.valid_until = env
            .block
            .time
            .plus_days(profile_info.subscription_duration_days.unwrap().u64());

        let modify_data = MsgUpdateData {
            sender: env.contract.address.to_string(),
            class_id: nft_class_id.clone(),
            id: nft_id.clone(),
            items: [DataDynamicIndexedItem {
                index: 0,
                data: to_json_binary(&existing_subscription).unwrap().to_vec(),
            }]
            .to_vec(),
        };
        response = response.add_message(modify_data);

        // TODO: add updating of the other NFT here (the one for the target wallet)
    } else {
        // mint a new mutable subscription NFT
        let subscription = SubscriptionInfo {
            subscriber_wallet: subscriber_profile.wallet.clone(),
            subscribed_to_wallet: subscribed_to_wallet.wallet.clone(),
            subscriber: subscriber_profile.did.clone(),
            subscribed_to: subscribe_to.clone(),
            valid_until: env
                .clone()
                .block
                .time
                .plus_days(profile_info.subscription_duration_days.unwrap().u64()),
            cost: price.clone(),
        };

        let data = to_json_binary(&subscription).unwrap();
        let nft_data = Some(
            DataDynamic {
                items: [DataDynamicItem {
                    editors: [DataEditor::Admin as i32, DataEditor::Owner as i32].to_vec(),
                    data: data.to_vec(),
                }]
                .to_vec(),
            }
            .to_any(),
        );

        let mint = MsgMint {
            sender: env.contract.address.to_string(),
            class_id: nft_class_id.clone(),
            id: nft_id.clone(),
            uri: String::new(),
            uri_hash: String::new(),
            data: nft_data.clone(),
            recipient: subscriber_profile.wallet.to_string(),
        };
        let mint_bytes = mint.to_proto_bytes();
        let msg = CosmosMsg::Stargate {
            type_url: mint.to_any().type_url,
            value: Binary::from(mint_bytes),
        };

        // mint the NFT for the subscribed_to wallet
        let nft_class_id_profile = generate_nft_class_id(
            env.clone(),
            NFT_CLASS_PREFIX.to_string(),
            Some(NFT_CLASS_SUFFIX_PROFILE.to_string()),
        );
        let mint_profile = MsgMint {
            sender: env.contract.address.to_string(),
            class_id: nft_class_id_profile.clone(),
            id: nft_id.clone(),
            uri: String::new(),
            uri_hash: String::new(),
            data: nft_data,
            recipient: subscribed_to_wallet.wallet.to_string(),
        };
        let mint_bytes = mint_profile.to_proto_bytes();
        let msg_profile = CosmosMsg::Stargate {
            type_url: mint_profile.to_any().type_url,
            value: Binary::from(mint_bytes),
        };

        response = response
            .add_attribute("valid_until", subscription.valid_until.to_string())
            .add_message(msg)
            .add_message(msg_profile);
    }

    response = response
        .add_attribute("action", "subscribe")
        .add_attribute(
            "subscribed_to_did",
            subscribed_to_wallet.did.get_value().clone(),
        )
        .add_attribute("subscribed_to_wallet", subscribed_to_wallet.wallet.clone())
        .add_attribute("subscriber", info.sender.to_string())
        .add_attribute("nft_class_id", nft_class_id)
        .add_attribute("nft_id", nft_id);

    // payout
    // deps.api.debug("Trying to pay the subscriber...");
    let contract_config = CONFIG.load(deps.storage).unwrap();
    let sub_fee_percentage = contract_config.subscription_fee;

    let cored_in_commission = sub_fee_percentage
        .checked_mul(Decimal::from_str(price.amount.to_string().as_str())?)
        .unwrap()
        .floor()
        .to_uint_floor();
    let owner_payout = price.amount.checked_sub(cored_in_commission).unwrap();
    // deps.api.debug(format!("Subscriber payment {}, cored.in commission {}", owner_payout, cored_in_commission).as_str());

    if owner_payout != Uint128::zero() {
        // deps.api.debug(format!("Trying to pay {}...", subscribed_to_wallet.wallet.to_string()).as_str());
        let pay_owner_msg = BankMsg::Send {
            to_address: subscribed_to_wallet.wallet.to_string(),
            amount: coins(owner_payout.u128(), FEE_DENOM),
        };

        response = response.add_message(pay_owner_msg)
    }

    Ok(response)
}

pub fn is_subscriber(
    deps: Deps<CoreumQueries>,
    env: Env,
    target_did: DID,
    subscriber_wallet: Addr,
) -> StdResult<Binary> {
    let target_profile = DID_PROFILE_MAP
        .may_load(deps.storage, target_did.get_value().clone())?
        .ok_or(StdError::generic_err(format!(
            "Couldn't find the subscriber's DID for wallet {} in the contract registry",
            subscriber_wallet
        )))?;

    // the new way - check NFT ownership
    // doc ref: https://github.com/CoreumFoundation/coreum-wasm-sdk/blob/main/src/nft.rs
    let class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    // let nft_id = subscriber_wallet.clone();
    let nft_id = generate_nft_id(
        env.clone(),
        subscriber_wallet.clone(),
        target_profile.wallet,
    );
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::Owner {
        class_id: class_id.clone(),
        id: nft_id.clone(),
    })
    .into();

    let res = deps.querier.query::<nft::OwnerResponse>(&request);
    let owner_correct = match res {
        Ok(nft) => {
            // NFT found, check if it's owned by the subscriber
            nft.owner == subscriber_wallet
        }
        // when NFT is not found query returns "{}"
        // which can't be deserialized to OwnerResponse struct
        Err(_) => false,
    };

    if !owner_correct {
        return to_json_binary(&false);
    }

    // check NFT expiration
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::NFT {
        class_id,
        id: nft_id,
    })
    .into();

    let res = deps.querier.query::<nft::NFTResponse>(&request);
    let expiration_is_ok = match res {
        Ok(nft_response) => {
            // // NFT found, check the expiration date
            let sub_info: SubscriptionInfo = nft_response.nft.into();
            let is_valid_sub = sub_info.valid_until.seconds() >= env.block.time.seconds();
            is_valid_sub
        }
        // when NFT is not found query returns "{}"
        // which can't be deserialized to NFTResponse struct
        Err(_) => false,
    };

    return to_json_binary(&expiration_is_ok);
}

pub fn get_subscribers(
    deps: Deps<CoreumQueries>,
    env: Env,
    _wallet: Addr,
    page: Uint64,
    page_size: Uint64,
) -> StdResult<Binary> {
    let class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::NFTs {
        class_id: Some(class_id),
        owner: None,
        pagination: Some(PageRequest {
            key: None,
            offset: Some(page.u64() * page_size.u64()),
            limit: Some(page_size.u64()),
            count_total: None,
            reverse: Some(true),
        }),
    })
    .into();
    // TODO - this will actually send all subs for anyone!

    let res = deps.querier.query::<NFTsResponse>(&request);
    match res {
        Ok(nfts) => {
            let subscribers: Vec<SubscriptionInfo> = nfts
                .nfts
                .iter()
                .map(|nft| {
                    let sub_info: SubscriptionInfo = nft.clone().into();
                    return sub_info;
                })
                .collect();
            return to_json_binary(&GetSubscriptionListResponse {
                subscribers: subscribers,
            });
        }
        Err(_) => {
            return to_json_binary(&GetSubscriptionListResponse {
                subscribers: Vec::<SubscriptionInfo>::new(),
            })
        }
    }
}

pub fn get_subscriptions(
    deps: Deps<CoreumQueries>,
    env: Env,
    wallet: Addr,
    page: Uint64,
    page_size: Uint64,
) -> StdResult<Binary> {
    let class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::NFTs {
        class_id: Some(class_id),
        owner: Some(wallet.to_string()),
        pagination: Some(PageRequest {
            key: None,
            offset: Some(page.u64() * page_size.u64()),
            limit: Some(page_size.u64()),
            count_total: None,
            reverse: Some(true),
        }),
    })
    .into();

    let res = deps.querier.query::<NFTsResponse>(&request);
    match res {
        Ok(nfts) => {
            let subscriptions: Vec<SubscriptionInfo> = nfts
                .nfts
                .iter()
                .map(|nft| {
                    let sub_info: SubscriptionInfo = nft.clone().into();
                    return sub_info;
                })
                .collect();
            return to_json_binary(&GetSubscriptionListResponse {
                subscribers: subscriptions,
            });
        }
        Err(_) => {
            return to_json_binary(&GetSubscriptionListResponse {
                subscribers: Vec::<SubscriptionInfo>::new(),
            })
        }
    }
}

// how many profiles have subscribed to the wallet
pub fn get_subscriber_count(
    deps: Deps<CoreumQueries>,
    env: Env,
    wallet: Addr,
) -> StdResult<Binary> {
    // https://full-node.testnet-1.coreum.dev:1317/#/Query/GithubComCoreumFoundationCoreumV4XNftBalance
    let class_id = generate_nft_class_id(
        env.clone(),
        NFT_CLASS_PREFIX.to_string(),
        Some(NFT_CLASS_SUFFIX_PROFILE.to_string()),
    );
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::Balance {
        class_id,
        owner: wallet.to_string(),
    })
    .into();

    let res = deps.querier.query::<BalanceResponse>(&request);
    // return to_json_binary(&res.unwrap().pagination.total);

    match res {
        Ok(balance) => {
            let total_count: Uint64 = balance.amount.into();
            return to_json_binary(&total_count);
        }
        Err(_) => {
            return to_json_binary(&Uint64::zero());
        }
    }
}

// how many profiles is the wallet subscribed to
pub fn get_subscription_count(
    deps: Deps<CoreumQueries>,
    env: Env,
    wallet: Addr,
) -> StdResult<Binary> {
    // https://full-node.testnet-1.coreum.dev:1317/#/Query/GithubComCoreumFoundationCoreumV4XNftBalance
    let class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::Balance {
        class_id,
        owner: wallet.to_string(),
    })
    .into();

    let res = deps.querier.query::<BalanceResponse>(&request);
    // return to_json_binary(&res.unwrap().pagination.total);

    match res {
        Ok(balance) => {
            let total_count: Uint64 = balance.amount.into();
            return to_json_binary(&total_count);
        }
        Err(_) => {
            return to_json_binary(&Uint64::zero());
        }
    }
}

// returns NFT with the subscription info or None if the subscription is not found
// ignores the expiration date, meaning it will return the subscription even if it's expired
pub fn get_subscription_info(
    deps: Deps<CoreumQueries>,
    env: Env,
    target_did: DID,
    subscriber_wallet: Addr,
) -> StdResult<Binary> {
    let target_profile = DID_PROFILE_MAP
        .may_load(deps.storage, target_did.to_string().clone())?
        .ok_or(StdError::generic_err(format!(
            "Couldn't find the subscriber's DID for wallet {} in the contract registry",
            subscriber_wallet
        )))?;

    // the new way - check NFT ownership
    // doc ref: https://github.com/CoreumFoundation/coreum-wasm-sdk/blob/main/src/nft.rs
    let class_id = generate_nft_class_id(env.clone(), NFT_CLASS_PREFIX.to_string(), None);
    // let nft_id = subscriber_wallet.clone();
    let nft_id = generate_nft_id(
        env.clone(),
        subscriber_wallet.clone(),
        target_profile.wallet,
    );
    let request: QueryRequest<CoreumQueries> = CoreumQueries::NFT(nft::Query::NFT {
        class_id: class_id,
        id: nft_id,
    })
    .into();
    let res = deps.querier.query::<nft::NFTResponse>(&request);
    match res {
        Ok(nft_response) => {
            // NFT found
            let sub_info: SubscriptionInfo = nft_response.nft.into();
            return to_json_binary(&sub_info);
        }
        // when NFT is not found query returns "{}"
        // which can't be deserialized to NFTResponse struct
        Err(_) => to_json_binary(&None::<Binary>),
    }
}

// gets current subscription cost
pub fn get_subscription_price(deps: Deps<CoreumQueries>, did: String) -> StdResult<Binary> {
    let profile_info = DID_PROFILE_MAP.load(deps.storage, did);

    match profile_info {
        Err(e) => return Err(e),
        Ok(profile) => {
            let mut subscriber_price: Option<Coin> = profile.subscription_price;
            if subscriber_price.is_some() {
                let mut scaled_price = subscriber_price.unwrap();
                scaled_price.amount *= Uint128::from(profile.subscriber_count + Uint64::one());
                subscriber_price = Some(scaled_price);
            }

            return to_json_binary(&subscriber_price);
        }
    }
}

pub fn get_subscription_duration(deps: Deps<CoreumQueries>, did: String) -> StdResult<Binary> {
    let profile_info = DID_PROFILE_MAP.load(deps.storage, did);

    match profile_info {
        Err(e) => return Err(e),
        Ok(profile) => {
            let subscription_duration_days = profile.subscription_duration_days;

            return to_json_binary(&subscription_duration_days);
        }
    }
}

pub fn set_subscription(
    deps: DepsMut,
    info: MessageInfo,
    price: Coin,
    duration: Uint64,
) -> Result<Response<CoreumMsg>, ContractError> {
    let did_info = WALLET_PROFILE_MAP
        .may_load(deps.storage, info.sender.to_string())
        .expect("No DID registerred with the current wallet");
    println!("Set sub price: {:?}", did_info);
    let did_info_unwrapped = did_info.unwrap();
    println!("Set sub price UNWRAPPED: {:?}", did_info_unwrapped);

    let mut profile_info = DID_PROFILE_MAP
        .may_load(deps.storage, did_info_unwrapped.did.to_string().clone())
        .expect("Profile info for DID not found")
        .expect("Stored profile info is empty");
    profile_info.subscription_price = Some(price.clone());
    profile_info.subscription_duration_days = Some(duration.clone());

    // TODO: update in all 3 places, suboptimal?
    USERNAME_PROFILE_MAP
        .save(deps.storage, did_info_unwrapped.username, &profile_info)
        .expect("Error storing the new subscription price");

    DID_PROFILE_MAP
        .save(
            deps.storage,
            did_info_unwrapped.did.to_string(),
            &profile_info,
        )
        .expect("Error storing the new subscription price");

    WALLET_PROFILE_MAP
        .save(
            deps.storage,
            did_info_unwrapped.wallet.to_string(),
            &profile_info,
        )
        .expect("Error storing the new subscription price");

    Ok(Response::<CoreumMsg>::default())
}
