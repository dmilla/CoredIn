use std::collections::LinkedList;

use cosmwasm_schema::QueryResponses;
use cosmwasm_std::{Addr, Coin, Decimal, Uint64};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{
    models::{
        did::DID, post::PostInfo, profile_info::ProfileInfo, subscription_info::SubscriptionInfo,
    },
    state::Config,
};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub did_register_price: Option<Coin>,
    pub subscription_fee: Decimal, // percentage from range [0.0, 1.0]
}

impl InstantiateMsg {
    pub fn zero() -> Self {
        InstantiateMsg {
            subscription_fee: Decimal::zero(),
            did_register_price: None,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // register DID and username with the sender's account
    Register { did: DID, username: String },
    // remove the registered DID/username from the signing wallet
    // TODO: remove this before going public?
    RemoveDID { did: DID, username: String },
    // register DID and username with the sender's account
    UpdateCredentialMerkleRoot { did: DID, root: String },
    // set subscription price for a DID
    // this sets only the multiplierfor, final price = number of subscribers * multiplier
    // defualt value = 1
    SetSubscription { price: Coin, duration: Uint64 },
    // subscribe to a DID
    Subscribe { did: DID },

    // tip the author of a post
    TipPostAuthor { post_info: PostInfo },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, QueryResponses)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    #[returns(Config)]
    Config {},

    #[returns(GetDIDResponse)]
    GetWalletDID { wallet: Addr },
    #[returns(GetDIDResponse)]
    GetUsernameDID { username: String },
    #[returns(GetDIDResponse)]
    GetDID { did: DID },
    #[returns(GetMerkleRootResponse)]
    GetMerkleRoot { did: DID },

    // verify if the the provided credential is in the set of VCs for given DID
    #[returns(bool)]
    VerifyCredential {
        did: DID,
        credential_hash: String,
        merkle_proofs: LinkedList<String>,
    },

    // check if the user is a subscriber to the DID
    #[returns(bool)]
    IsSubscriber {
        target_did: DID,
        subscriber_wallet: Addr,
    },

    // returns the subscription price for a profile
    #[returns(Coin)]
    GetSubscriptionPrice { did: DID },

    // returns the subscription price for a profile
    #[returns(Uint64)]
    GetSubscriptionDuration { did: DID },

    // returns subscription info
    #[returns(Option<SubscriptionInfo>)]
    GetSubscriptionInfo { did: DID, subscriber: Addr },

    // return the list of subscribers
    #[returns(GetSubscriptionListResponse)]
    GetSubscribers {
        wallet: Addr,
        page: Uint64,
        page_size: Uint64,
    },

    // return the list of subscriptions
    #[returns(GetSubscriptionListResponse)]
    GetSubscriptions {
        wallet: Addr,
        page: Uint64,
        page_size: Uint64,
    },

    // return the number of subscribers for a profile
    #[returns(Uint64)]
    GetSubscriberCount { wallet: Addr },

    // return the number of profiles a wallet is subscribed to
    #[returns(Uint64)]
    GetSubscriptionCount { wallet: Addr },

    // return the total amount of tips for a post
    #[returns(Uint64)]
    GetPostTips { post_id: Uint64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct MigrateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GetDIDResponse {
    pub did_info: Option<ProfileInfo>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GetMerkleRootResponse {
    pub root: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GetSubscriptionInfoResponse {
    pub info: Option<SubscriptionInfo>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct GetSubscriptionListResponse {
    pub subscribers: Vec<SubscriptionInfo>, // list of subscriber's DIDs
}
