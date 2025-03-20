use std::collections::LinkedList;

use cosmwasm_std::{Addr, Coin, Uint64};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use super::{did::DID, subscription_info::SubscriptionInfo};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProfileInfo {
    pub wallet: Addr,
    pub did: DID,
    pub username: String,

    pub subscription_price: Option<Coin>, // multiplier, if not set, defaults to zero
    pub subscription_duration_days: Option<Uint64>, // number of days the subscription is valid for the price, defaults to 7
    pub top_subscribers: LinkedList<SubscriptionInfo>, // max 10 subscribers due to the gas limits
    pub subscriber_count: Uint64, // future proof to accommodate estimeted user base :)
}
