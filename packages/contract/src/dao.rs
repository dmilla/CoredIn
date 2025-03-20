use crate::error::ContractError;
use coreum_wasm_sdk::core::CoreumMsg;
use cosmwasm_std::{DepsMut, MessageInfo, Response};

// an account invoking this will collect all of the accumulated subscription commissions from the contract
// TODO: replace by DAO-like voting by admins
pub fn collect_fees(
    _deps: DepsMut,
    _info: MessageInfo,
) -> Result<Response<CoreumMsg>, ContractError> {
    
    // TODO: implement

    Ok(Response::<CoreumMsg>::default())
}
