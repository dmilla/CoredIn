use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, Coin, Decimal};

use crate::models::{post::PostInfo, profile_info::ProfileInfo};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub did_register_price: Option<Coin>,
    pub owner: Addr,
    pub subscription_fee: Decimal, // percentage from range [0.0, 1.0]
}
pub const CONFIG: Item<Config> = Item::new("config");

pub const DID_PROFILE_MAP: Map<String, ProfileInfo> = Map::new("didprofile");

pub const USERNAME_PROFILE_MAP: Map<String, ProfileInfo> = Map::new("usernameprofile");

pub const WALLET_PROFILE_MAP: Map<String, ProfileInfo> = Map::new("walletprofile");

pub const CREDENTIAL: Map<String, String> = Map::new("credential");

pub const POST: Map<String, PostInfo> = Map::new("post");
