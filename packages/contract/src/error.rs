use cosmwasm_std::Coin;
use cosmwasm_std::StdError;
use thiserror::Error;

use crate::models::subscription_info::SubscriptionInfo;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Insufficient funds sent")]
    InsufficientFundsSend {
        sent: Option<Coin>,
        expected: Option<Coin>,
    },

    #[error("Name does not exist (name {name})")]
    NameNotExists { name: String },

    #[error("Name has been taken (name {name})")]
    NameTaken { name: String },

    #[error("Name too short (length {length} min_length {min_length})")]
    NameTooShort { length: u64, min_length: u64 },

    #[error("Name too long (length {length} min_length {max_length})")]
    NameTooLong { length: u64, max_length: u64 },

    #[error("Invalid character(char {c}")]
    InvalidCharacter { c: char },

    #[error("Saving profile for DID {did} failed")]
    ProfileSaveFailed { did: String },

    #[error("Subscription failed - error minting NFT")]
    SubscriptionNFTMintingError {},

    #[error("A valid subscription exists: {subscription_info}")]
    ExistingSubscriptionFound { subscription_info: SubscriptionInfo },

    #[error("No funds sent")]
    NoFunds {},

    #[error("Post not found (id {id})")]
    PostNotFound { id: String },
}
