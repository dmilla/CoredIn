use crate::error::ContractError;

use coreum_wasm_sdk::core::CoreumQueries;
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    DepsMut, Env, Response
};

// use cw2::set_contract_version;
// const CONTRACT_NAME: &str = env!("CARGO_PKG_NAME");
// const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

use crate::msg::MigrateMsg;

#[entry_point]
pub fn migrate(_deps: DepsMut<CoreumQueries>, _env: Env, _msg: MigrateMsg) -> Result<Response, ContractError> {

    // Example migration #1: https://github.com/CoreumFoundation/coreumbridge-xrpl/blob/master/contract/src/migration.rs
    // let ver = cw2::get_contract_version(deps.storage).unwrap();
    // if ver.contract != CONTRACT_NAME {
    //     return Err(StdError::generic_err("Can only upgrade from same contract type").into());
    // }
    // // TODO Add migration logic, and version validation
    // set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION).unwrap();


    // Example migration #2: https://docs.cosmwasm.com/core/entrypoints/migrate

    // // Check if the state version is older than the current one and update it
    // cw2::ensure_from_older_version(deps.storage, CONTRACT_NAME, STATE_VERSION)?;
    
    // // Load the old data
    // let Some(old_data) = deps.storage.get(b"persisted_data") else {
    // return Err(StdError::generic_err("Data not found"));
    // };
    // // Deserialize it from the old format
    // let old_data: OldData = cosmwasm_std::from_json(&old_data)?;

    // // Transform it
    // let new_data = transform(old_data);

    // // Serialize the new data
    // let new_data = cosmwasm_std::to_json_vec(&new_data)?;
    // // Store the new data
    // deps.storage.set(b"persisted_data", &new_data);

    Ok(Response::default())
}