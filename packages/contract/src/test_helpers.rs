// src/tests/common.rs

#[cfg(test)]
pub mod test_helpers {

    use coreum_wasm_sdk::types::cosmos::bank::v1beta1::QueryBalanceRequest;
    use cosmwasm_std::{coins, Uint128};

    use crate::contract::FEE_DENOM;
    use crate::models::did::DID;
    use crate::msg::{ExecuteMsg, InstantiateMsg};
    use std::cmp::Ordering;
    use std::str::FromStr;

    use coreum_test_tube::{Account, Bank, CoreumTestApp, Module, SigningAccount, Wasm, NFT};

    // initial balance of all accounts in test tube
    pub const INITIAL_BALANCE: u128 = 100_000_000_000;

    // Create a new account with initial funds and one without initial funds
    // use coreum_test_tube::runner::app::FEE_DENOM;

    // function pointer is invoked when mock env is set to execute test defined in the injected function
    // signature: (app, accounts, contract_addr, code_id, wasm)
    pub fn with_test_tube(
        intantiate_msg: InstantiateMsg,
        f: &dyn Fn(
            Vec<SigningAccount>,
            String,
            Wasm<CoreumTestApp>,
            Bank<CoreumTestApp>,
            NFT<CoreumTestApp>,
        ),
    ) {
        // Create new Coreum appchain instance.
        let app = CoreumTestApp::new();

        // `Wasm` is the module we use to interact with cosmwasm releated logic on the appchain
        let wasm = Wasm::new(&app);

        // init wrapper modules
        let bank = Bank::new(&app);
        let nft = NFT::new(&app);

        // init multiple accounts
        let mut accs = app
            .init_accounts(&coins(INITIAL_BALANCE, FEE_DENOM.to_string()), 5)
            .unwrap();
        // sort accounts by address in ascending order, so the test-tube accounts are deterministic in NFT logic
        accs.sort_by(
            |a, b| match a.address().to_string() < b.address().to_string() {
                true => Ordering::Greater,
                false => {
                    if a.address().to_string() > b.address().to_string() {
                        Ordering::Less
                    } else {
                        Ordering::Equal
                    }
                }
            },
        );
        let admin = &accs.get(0).unwrap();

        // Store compiled wasm code on the appchain and retrieve its code id
        let wasm_byte_code = std::fs::read("./artifacts/coredin.wasm").unwrap();
        let code_id = wasm
            .store_code(&wasm_byte_code, None, &admin)
            .unwrap()
            .data
            .code_id;

        // Instantiate contract with initial admin (signer) account defined beforehand and make admin list mutable
        let contract_addr = wasm
            .instantiate(
                code_id,
                &intantiate_msg,
                Some(admin.address().as_str()),
                "cored.in".into(),
                // &coins(100_000_000_000, FEE_DENOM.to_string()),
                &[],
                &admin,
            )
            .unwrap()
            .data
            .address;

        f(accs, contract_addr, wasm, bank, nft);
    }

    pub fn mock_register_account(
        wasm: &Wasm<CoreumTestApp>,
        contract_addr: &String,
        account: &SigningAccount,
        username: String,
    ) {
        let register_did_msg = ExecuteMsg::Register {
            did: DID::new(format!("did:cored:{}did", username).to_string()).unwrap(),
            username: username,
        };
        wasm.execute::<ExecuteMsg>(
            &contract_addr,
            &register_did_msg,
            // &coins(10_000_000_000, FEE_DENOM),
            &[], // no attached coins
            &account,
        )
        .unwrap();
    }

    // helper function to check the current balance of an account
    pub fn get_balance(bank: &Bank<CoreumTestApp>, account: &SigningAccount) -> Uint128 {
        let balance_msg = QueryBalanceRequest {
            address: account.address().to_string(),
            denom: FEE_DENOM.to_string(),
        };

        let balance_response = bank.query_balance(&balance_msg).unwrap();
        Uint128::from_str(balance_response.balance.unwrap().amount.as_str()).unwrap()
    }
}
