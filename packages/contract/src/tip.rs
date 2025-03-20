use coreum_wasm_sdk::core::CoreumMsg;
use cosmwasm_std::{
    to_json_binary, BankMsg, Binary, Coin, Decimal, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult, Uint128, Uint64,
};

use crate::{
    contract::FEE_DENOM,
    error::ContractError,
    models::post::PostInfo,
    state::{CONFIG, POST},
};

pub fn tip_post_author(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    post_info: PostInfo,
) -> Result<Response<CoreumMsg>, ContractError> {
    let key = post_info.id.clone();
    let post = POST.may_load(deps.storage, key.clone())?;

    // Ensure there's a payment sent
    if info.clone().funds.is_empty() {
        return Err(ContractError::NoFunds {});
    }

    let mut post_info = if let Some(post_info) = post {
        post_info
    } else {
        // If post is not found, create a new post on the chain
        // copy everything from the payload exept the vault - force that to 0
        let new_post_info = PostInfo {
            id: post_info.id,
            hash: post_info.hash, // Assuming a default hash for simplicity
            author: post_info.author,
            post_type: post_info.post_type,
            created_on: post_info.created_on,
            vault: Coin {
                denom: FEE_DENOM.to_string(),
                amount: Uint128::zero(),
            },
        };
        new_post_info
    };

    let author_wallet = post_info.author.clone();

    // Calculate 5% commission
    let mut author_tip_int = Uint128::zero();
    let mut commission = Uint128::zero();
    if info.funds[0].amount > Uint128::zero() {
        let commission_rate = Decimal::percent(5);
        let total_tip = info.funds[0].amount.clone(); // Assuming single coin type
        let author_tip = Decimal::from_atomics(total_tip, 0)
            .unwrap()
            .checked_div(Decimal::percent(100) + commission_rate)
            .unwrap();
        author_tip_int = author_tip.to_uint_floor();
        commission = total_tip - author_tip_int;
    }

    // Create bank messages for commission and author tip
    // get the contract admin address
    let admin_address = CONFIG.load(deps.storage)?.owner;
    let commission_msg = BankMsg::Send {
        to_address: admin_address.to_string(),
        amount: vec![Coin {
            denom: info.funds[0].denom.clone(),
            amount: commission,
        }],
    };

    // if the author is boosting their own post, send the tip to admin
    let tip_recipient = if author_wallet == info.sender {
        admin_address.to_string()
    } else {
        author_wallet.to_string()
    };

    let author_msg = BankMsg::Send {
        to_address: tip_recipient,
        amount: vec![Coin {
            denom: info.funds[0].denom.clone(),
            amount: author_tip_int,
        }],
    };

    post_info.vault.amount += author_tip_int;
    POST.save(deps.storage, key.clone(), &post_info)?;

    Ok(Response::new()
        .add_message(commission_msg)
        .add_message(author_msg)
        .add_attribute("action", "tip_post_author")
        .add_attribute("post_id", post_info.id)
        .add_attribute("recipient", author_wallet)
        .add_attribute("commission", commission.to_string())
        .add_attribute("author_tip", author_tip_int.to_string()))
}

pub fn get_post_tips(deps: Deps, post_id: Uint64) -> StdResult<Binary> {
    let post = POST.may_load(deps.storage, post_id.clone().to_string())?;

    if let Some(post) = post {
        Ok(to_json_binary(&post.vault.amount)?)
    } else {
        Err(StdError::not_found(format!(
            "Post with id {} not found",
            post_id
        )))
    }
}

#[cfg(test)]

mod tests {
    use crate::msg::{ExecuteMsg, InstantiateMsg};
    use crate::test_helpers::test_helpers::{get_balance, mock_register_account, with_test_tube};
    use coreum_test_tube::Account;
    use cosmwasm_std::{Coin, Decimal, Timestamp};

    use cosmwasm_std::{
        from_json,
        testing::{mock_dependencies, mock_env, mock_info},
        Addr, Uint128,
    };

    use super::*;
    use crate::models::post::{PostInfo, PostType};
    use crate::state::{Config, CONFIG};

    fn setup_config(deps: DepsMut) {
        let config = Config {
            owner: Addr::unchecked("admin"),
            did_register_price: None,
            subscription_fee: Decimal::percent(5),
        };
        CONFIG.save(deps.storage, &config).unwrap();
    }

    #[test]
    fn test_tip_post_author_no_funds() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let post_id = "test_post_2".to_string();
        let author = Addr::unchecked("author_address");
        let tipper = Addr::unchecked("tipper_address");

        // Setup a mock post
        let post_info = PostInfo {
            id: post_id.clone(),
            hash: "test_hash".to_string(),
            author: author.clone(),
            post_type: PostType::Microblog,
            created_on: env.block.time,
            vault: Coin {
                denom: FEE_DENOM.to_string(),
                amount: Uint128::zero(),
            },
        };
        POST.save(deps.as_mut().storage, post_id.clone(), &post_info)
            .unwrap();

        // Setup the tip with no funds
        let info = mock_info(tipper.as_str(), &[]);

        // Execute the tip
        let err = tip_post_author(deps.as_mut(), env.clone(), info, post_info.clone()).unwrap_err();

        // Check the error
        assert!(matches!(err, ContractError::NoFunds {}));
    }

    #[test]
    fn test_tip_post_author_post_not_found() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let post_id = "non_existent_post".to_string();
        let tipper = Addr::unchecked("tipper_address");

        // Setup the tip
        let tip_amount = Uint128::new(100);
        let info = mock_info(
            tipper.as_str(),
            &[Coin {
                denom: FEE_DENOM.to_string(),
                amount: tip_amount,
            }],
        );

        // Execute the tip
        let res = tip_post_author(
            deps.as_mut(),
            env.clone(),
            info,
            PostInfo {
                id: post_id.clone(),
                hash: "test_hash".to_string(),
                author: Addr::unchecked("author_address"),
                post_type: PostType::Microblog,
                created_on: env.block.time,
                vault: Coin {
                    denom: FEE_DENOM.to_string(),
                    amount: Uint128::zero(),
                },
            },
        )
        .unwrap();

        // Check the response
        assert_eq!(res.messages.len(), 2); // One for commission, one for author tip
        assert_eq!(res.attributes.len(), 5); // action, post_id, recipient, commission, author_tip
    }

    #[test]
    fn test_tip_post_author_post_exists() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let post_id = "existing_post".to_string();
        let tipper = Addr::unchecked("tipper_address");

        // Setup a mock post
        let post_info = PostInfo {
            id: post_id.clone(),
            hash: "test_hash".to_string(),
            author: Addr::unchecked("author_address"),
            post_type: PostType::Microblog,
            created_on: env.block.time,
            vault: Coin {
                denom: FEE_DENOM.to_string(),
                amount: Uint128::zero(),
            },
        };
        POST.save(deps.as_mut().storage, post_id.clone(), &post_info)
            .unwrap();

        // Setup the tip
        let tip_amount = Uint128::new(100);
        let info = mock_info(
            tipper.as_str(),
            &[Coin {
                denom: FEE_DENOM.to_string(),
                amount: tip_amount,
            }],
        );

        // Execute the tip
        let res = tip_post_author(deps.as_mut(), env.clone(), info, post_info.clone()).unwrap();

        // Check the response
        assert_eq!(res.messages.len(), 2); // One for commission, one for author tip
        assert_eq!(res.attributes.len(), 5); // action, post_id, recipient, commission, author_tip
    }

    #[test]
    fn test_tip_post_author_post_doesnt_exist() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let post_id = "non_existent_post".to_string();
        let tipper = Addr::unchecked("tipper_address");

        // Setup the tip
        let tip_amount = Uint128::new(100);
        let info = mock_info(
            tipper.as_str(),
            &[Coin {
                denom: FEE_DENOM.to_string(),
                amount: tip_amount,
            }],
        );

        // Execute the tip
        let res = tip_post_author(
            deps.as_mut(),
            env.clone(),
            info,
            PostInfo {
                id: post_id.clone(),
                hash: "test_hash".to_string(),
                author: Addr::unchecked("author_address"),
                post_type: PostType::Microblog,
                created_on: env.block.time,
                vault: Coin {
                    denom: FEE_DENOM.to_string(),
                    amount: Uint128::zero(),
                },
            },
        )
        .unwrap();

        // Check the response
        assert_eq!(res.messages.len(), 2); // One for commission, one for author tip
        assert_eq!(res.attributes.len(), 5); // action, post_id, recipient, commission, author_tip
    }

    #[test]
    fn test_get_post_tips() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let post_id = Uint64::new(1);

        // Setup a mock post with tips
        let post_info = PostInfo {
            id: post_id.to_string(),
            hash: "test_hash".to_string(),
            author: Addr::unchecked("author_address"),
            post_type: PostType::Microblog,
            created_on: env.block.time,
            vault: Coin {
                denom: FEE_DENOM.to_string(),
                amount: Uint128::new(100), // Assuming 100 ucore as the tip amount
            },
        };
        POST.save(deps.as_mut().storage, post_id.to_string(), &post_info)
            .unwrap();

        // Test getting tips for an existing post
        let tips = get_post_tips(deps.as_ref(), post_id).unwrap();
        let tips_amount: Uint128 = from_json::<Uint128>(tips).unwrap();
        assert_eq!(tips_amount, Uint128::new(100));

        // Test getting tips for a non-existing post
        let non_existent_post_id = Uint64::new(999);
        let err = get_post_tips(deps.as_ref(), non_existent_post_id).unwrap_err();
        assert!(matches!(err, StdError::NotFound { .. }));
    }

    #[test]
    fn test_get_post_tips_with_commission() {
        let mut deps = mock_dependencies();
        setup_config(deps.as_mut());
        let env = mock_env();
        let info = mock_info("tipper", &[]);
        let post_id = Uint64::new(2);

        // Setup a mock post without initial tips
        let post_info = PostInfo {
            id: post_id.to_string(),
            hash: "test_hash".to_string(),
            author: Addr::unchecked("author_address"),
            post_type: PostType::Microblog,
            created_on: env.block.time,
            vault: Coin {
                denom: FEE_DENOM.to_string(),
                amount: Uint128::zero(),
            },
        };
        POST.save(deps.as_mut().storage, post_id.to_string(), &post_info)
            .unwrap();

        // Simulate tipping process using the tip_post_author function
        let tip_amount = Uint128::new(10500000); // 10 CORE + 0.5 commission
        let tip_info = MessageInfo {
            sender: info.sender,
            funds: vec![Coin {
                denom: FEE_DENOM.to_string(),
                amount: tip_amount,
            }],
        };

        let tip_res =
            tip_post_author(deps.as_mut(), env.clone(), tip_info, post_info.clone()).unwrap();
        println!("{:?}", tip_res);

        let tip_raw = get_post_tips(deps.as_ref(), post_id).unwrap();
        let tip_result: Uint128 = from_json::<Uint128>(tip_raw).unwrap();

        // The total tips should be the tip amount minus the 5% commission
        // let expected_tip = Decimal::new(tip_result).checked_div(Decimal::from_str("1.05").unwrap()).unwrap();
        assert_eq!(tip_result, Uint128::from(10000000u128)); // expected to get 10_000_000 ucore
    }

    #[test]
    fn test_admin_commission_from_tips() {
        let instantiate_msg = InstantiateMsg {
            subscription_fee: Decimal::percent(5),
            did_register_price: None,
        };

        with_test_tube(instantiate_msg, &|accs, contract_addr, wasm, bank, _nft| {
            let admin = &accs[0];
            let author = &accs[1];
            let tipper = &accs[2];

            // Register the author
            mock_register_account(&wasm, &contract_addr, &author, "author".to_string());

            let initial_admin_balance = get_balance(&bank, &admin);
            let initial_author_balance = get_balance(&bank, &author);

            // Create a post
            let post_id = Uint64::new(3);
            let post_info = PostInfo {
                id: post_id.to_string(),
                hash: "test_hash".to_string(),
                author: Addr::unchecked(author.address()),
                post_type: PostType::Microblog,
                created_on: Timestamp::from_seconds(0), // irrelevant for this test
                vault: Coin {
                    denom: FEE_DENOM.to_string(),
                    amount: Uint128::zero(),
                },
            };

            // Tip the post
            let tip_amount = Uint128::new(105_000_000); // 100 CORE tip + 5% commission
            let tip_msg = ExecuteMsg::TipPostAuthor {
                post_info: post_info.clone(),
            };
            wasm.execute(
                &contract_addr,
                &tip_msg,
                &[Coin {
                    denom: FEE_DENOM.to_string(),
                    amount: tip_amount,
                }],
                &tipper,
            )
            .unwrap();

            // Check admin balance (should have received 5% commission)
            let expected_commission = Uint128::new(initial_admin_balance.u128() + 5_000_000); // 5% of 100 CORE
            let admin_balance = get_balance(&bank, &admin);
            assert_eq!(
                admin_balance, expected_commission,
                "Admin should receive 5% commission"
            );

            // Check author balance (should have received 95% of the tip)
            let expected_author_tip = Uint128::new(initial_author_balance.u128() + 100_000_000); // 100% of 100 CORE
            let author_balance = get_balance(&bank, &author);
            assert_eq!(
                author_balance, expected_author_tip,
                "Author should receive 95% of the tip"
            );

            // Check if the admin gets paid for author tipping their own post
            let initial_admin_balance = get_balance(&bank, &admin);
            let self_tip_msg = ExecuteMsg::TipPostAuthor {
                post_info: post_info.clone(),
            };
            wasm.execute(
                &contract_addr,
                &self_tip_msg,
                &[Coin {
                    denom: FEE_DENOM.to_string(),
                    amount: tip_amount,
                }],
                &author,
            )
            .unwrap();

            // Check admin balance (should have received the entire tip)
            let expected_admin_balance =
                Uint128::new(initial_admin_balance.u128() + tip_amount.u128());
            let admin_balance_after_self_tip = get_balance(&bank, &admin);
            assert_eq!(
                admin_balance_after_self_tip, expected_admin_balance,
                "Admin should receive the entire tip when author tips their own post"
            );
        });
    }
}
