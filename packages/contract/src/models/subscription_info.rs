use std::fmt::Display;

use coreum_wasm_sdk::{nft::NFT, types::coreum::asset::nft::v1::DataDynamic};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{from_json, Addr, Coin, Timestamp};
use prost::Message;

use super::did::DID;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, Eq)]
pub struct SubscriptionInfo {
    pub subscriber_wallet: Addr,
    pub subscribed_to_wallet: Addr,
    pub subscriber: DID,    // subscriber's DID
    pub subscribed_to: DID, // DID of the profile subscribed to
    pub valid_until: Timestamp,
    pub cost: Coin,
}

impl Ord for SubscriptionInfo {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // order by subscriber, break ties with subscribed_to
        self.subscriber
            .cmp(&other.subscriber)
            .then_with(|| self.subscribed_to.cmp(&other.subscribed_to))
    }
}

impl PartialOrd for SubscriptionInfo {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

// helper trait imlementation to convert NFTResponse to SubscriptionInfo rapidly
impl From<NFT> for SubscriptionInfo {
    fn from(nft: NFT) -> Self {
        let sub_info = DataDynamic::decode(nft.data.unwrap().as_slice()).unwrap();
        let sub_info = from_json::<SubscriptionInfo>(&sub_info.items[0].data).unwrap();
        sub_info
    }
}

impl Display for SubscriptionInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let _ = f.write_str(format!("{:?}", self).as_str());
        Ok(())
    }
}
