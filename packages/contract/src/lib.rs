// src/lib.rs

pub mod coin_helpers;
pub mod contract;
pub mod dao;
pub mod error;
pub mod merkle_tree;
pub mod msg;
pub mod state;
pub mod subscription;
pub mod tip;
pub mod migration; // TODO: Should this be pub? Check with Coreum team

pub mod models {
    pub mod did;
    pub mod post;
    pub mod profile_info;
    pub mod subscription_info;
}

#[cfg(test)]
mod subscription_tests;
#[cfg(test)]
mod test_helpers;
