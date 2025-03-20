#[cfg(test)]
mod tests {
    use crate::contract::FEE_DENOM;
    use crate::models::did::DID;
    use crate::models::subscription_info::SubscriptionInfo;
    use crate::msg::{ExecuteMsg, GetSubscriptionListResponse, InstantiateMsg, QueryMsg};
    use crate::test_helpers::test_helpers::{
        get_balance, mock_register_account, with_test_tube, INITIAL_BALANCE,
    };
    use coreum_test_tube::{Account, Bank, CoreumTestApp, Module, SigningAccount, Wasm, NFT};
    use cosmwasm_std::{coins, Addr, Coin, Uint128, Uint64};

    #[test]
    fn subscribe_payout_owner() {
        with_test_tube(
            InstantiateMsg::zero(),
            &|accounts: Vec<SigningAccount>,
              contract_addr: String,
              wasm: Wasm<CoreumTestApp>,
              bank: Bank<CoreumTestApp>,
              _nft: NFT<CoreumTestApp>| {
                // register actors
                let alice = accounts.get(1).unwrap();
                let bob = accounts.get(2).unwrap();

                mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
                mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());

                // bob sets his subscription price, Alice leaves it at zero
                let bob_sub_price = Uint128::from(10_000_000_000u128);
                let set_sub_price_msg = ExecuteMsg::SetSubscription {
                    price: Coin::new(bob_sub_price.u128(), FEE_DENOM),
                    duration: Uint64::one(),
                };
                wasm.execute(&contract_addr, &set_sub_price_msg, &[], bob)
                    .unwrap();

                // now try "free" subscription (Bob subscribes to Alice)
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                };

                let alice_balance_before = get_balance(&bank, alice);
                let _ = wasm
                    .execute::<ExecuteMsg>(&contract_addr, &subscribe_msg, &[], bob)
                    .unwrap();

                // confirm Alice did not get paid (subscription is free)
                let alice_balance_after = get_balance(&bank, alice);
                assert_eq!(alice_balance_before, alice_balance_after);

                // now try "paid" subscription (Alice subscribes to Bob)
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:bobdid".to_string()).unwrap(),
                };

                let bob_balance_before = get_balance(&bank, bob);
                let _ = wasm
                    .execute::<ExecuteMsg>(
                        &contract_addr,
                        &subscribe_msg,
                        &coins(bob_sub_price.u128(), FEE_DENOM),
                        alice,
                    )
                    .unwrap();

                // confirm Bob got paid
                let bob_balance_after = get_balance(&bank, bob);
                assert_eq!(bob_balance_before + bob_sub_price, bob_balance_after);
            },
        );
    }

    #[test]
    fn subscribe_mints_nft() {
        with_test_tube(
            InstantiateMsg::zero(),
            &|accounts: Vec<SigningAccount>,
              contract_addr: String,
              wasm: Wasm<CoreumTestApp>,
              _bank: Bank<CoreumTestApp>,
              _nft: NFT<CoreumTestApp>| {
                // register actors
                let alice = accounts.get(1).unwrap();
                let bob = accounts.get(2).unwrap();

                mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
                mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());

                // query the contract's is_subscriber function
                // which relies on the existence of the NFT
                let is_sub_msg = QueryMsg::IsSubscriber {
                    target_did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                    subscriber_wallet: Addr::unchecked(bob.address().to_string()),
                };

                let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);

                // expect that is_sub is false (still not subscribed)
                assert!(is_sub.is_ok() && !is_sub.unwrap());

                // Bob subscribes to Alice
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                };
                let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);

                let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
                // expect that is_sub is true after subscription
                assert!(is_sub.is_ok() && is_sub.unwrap());

                // Check subscription info
                let sub_info_msg = QueryMsg::GetSubscriptionInfo {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                    subscriber: Addr::unchecked(bob.address().to_string()),
                };

                let sub_info =
                    wasm.query::<QueryMsg, Option<SubscriptionInfo>>(&contract_addr, &sub_info_msg);

                assert!(sub_info.is_ok() && sub_info.unwrap().is_some());
            },
        );
    }

    #[test]
    fn subscription_expires() {
        // Create new Coreum appchain instance.
        let app = CoreumTestApp::new();

        // `Wasm` is the module we use to interact with cosmwasm related logic on the appchain
        let wasm = Wasm::new(&app);

        // init multiple accounts
        let accs = app
            .init_accounts(&coins(INITIAL_BALANCE, FEE_DENOM), 3)
            .unwrap();
        let admin = &accs[0];

        // Store compiled wasm code on the appchain and retrieve its code id
        let wasm_byte_code = std::fs::read("./artifacts/coredin.wasm").unwrap();
        let code_id = wasm
            .store_code(&wasm_byte_code, None, admin)
            .unwrap()
            .data
            .code_id;

        // Instantiate contract with initial admin (signer) account defined beforehand and make admin list mutable
        let contract_addr = wasm
            .instantiate(
                code_id,
                &InstantiateMsg::zero(),
                Some(admin.address().as_str()),
                Some("cored.in"),
                &[],
                admin,
            )
            .unwrap()
            .data
            .address;

        //// Bob subscribes to Alice

        // register actors
        let alice = &accs[1];
        let bob = &accs[2];

        mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
        mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());

        // query the contract's is_subscriber function
        // which relies on the existence of the NFT
        let is_sub_msg = QueryMsg::IsSubscriber {
            target_did: DID::new("did:cored:alicedid".to_string()).unwrap(),
            subscriber_wallet: Addr::unchecked(bob.address().to_string()),
        };

        // Bob subscribes to Alice
        let subscribe_msg = ExecuteMsg::Subscribe {
            did: DID::new("did:cored:alicedid".to_string()).unwrap(),
        };
        let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);

        let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
        // expect that is_sub is true after subscription
        assert!(is_sub.is_ok() && is_sub.unwrap());

        //// Move the time forward by 2 months
        app.increase_time(2 * 60 * 60 * 24 * 30);

        let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
        // expect that is_sub is false after subscription expires
        assert!(is_sub.is_ok() && !is_sub.unwrap());
    }

    #[test]
    fn subscriber_list_works() {
        with_test_tube(
            InstantiateMsg::zero(),
            &|accounts: Vec<SigningAccount>,
              contract_addr: String,
              wasm: Wasm<CoreumTestApp>,
              _bank: Bank<CoreumTestApp>,
              _nft: NFT<CoreumTestApp>| {
                // register actors
                let alice = accounts.get(1).unwrap();
                let bob = accounts.get(2).unwrap();
                let claire = accounts.get(3).unwrap();

                mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
                mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());
                mock_register_account(&wasm, &contract_addr, claire, "claire".to_string());

                let check_subs = |wallet: &SigningAccount,
                                  page: u64,
                                  page_size: u64,
                                  expected_subs: Vec<String>| {
                    let mut expected_subs = expected_subs.clone();
                    expected_subs.sort();
                    let sub_msg = QueryMsg::GetSubscribers {
                        wallet: Addr::unchecked(wallet.address().to_string()),
                        page: Uint64::from(page),
                        page_size: Uint64::from(page_size),
                    };
                    let mut subs = wasm
                        .query::<QueryMsg, GetSubscriptionListResponse>(&contract_addr, &sub_msg)
                        .unwrap()
                        .subscribers;
                    subs.sort();

                    // extract the subscriber addresses
                    let subs_dids = subs
                        .iter()
                        .map(|sub| sub.subscriber.to_string())
                        .collect::<Vec<String>>();

                    assert_eq!(subs_dids, expected_subs);
                };

                // Alice should not have any subscribers
                check_subs(alice, 0, 10, vec![]);
                check_subs(alice, 2, 10, vec![]);
                check_subs(alice, 0, 1, vec![]);
                check_subs(alice, 0, 1000, vec![]);

                // Bob subscribes to Alice
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                };
                let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);

                // Alice should have Bob as a subscriber
                check_subs(alice, 0, 10, vec!["did:cored:bobdid".to_string()]);
                check_subs(alice, 2, 10, vec![]); // Bob is on page 0
                check_subs(alice, 0, 1, vec!["did:cored:bobdid".to_string()]);
                check_subs(alice, 0, 1000, vec!["did:cored:bobdid".to_string()]);

                // Claire subscribes to Alice
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                };
                let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], claire);

                // Alice should have Bob and Claire as subscribers
                check_subs(
                    alice,
                    0,
                    10,
                    vec![
                        "did:cored:clairedid".to_string(),
                        "did:cored:bobdid".to_string(),
                    ],
                );

                // Check individual pages when page_size is 1
                let page_0 = wasm
                    .query::<QueryMsg, GetSubscriptionListResponse>(
                        &contract_addr,
                        &QueryMsg::GetSubscribers {
                            wallet: Addr::unchecked(alice.address().to_string()),
                            page: Uint64::from(0u64),
                            page_size: Uint64::from(1u64),
                        },
                    )
                    .unwrap()
                    .subscribers;
                let page_1 = wasm
                    .query::<QueryMsg, GetSubscriptionListResponse>(
                        &contract_addr,
                        &QueryMsg::GetSubscribers {
                            wallet: Addr::unchecked(alice.address().to_string()),
                            page: Uint64::from(1u64),
                            page_size: Uint64::from(1u64),
                        },
                    )
                    .unwrap()
                    .subscribers;

                assert_eq!(page_0.len(), 1);
                assert_eq!(page_1.len(), 1);
                assert_ne!(page_0[0].subscriber, page_1[0].subscriber);
                assert!(
                    page_0[0].subscriber.to_string() == "did:cored:bobdid"
                        || page_0[0].subscriber.to_string() == "did:cored:clairedid"
                );
                assert!(
                    page_1[0].subscriber.to_string() == "did:cored:bobdid"
                        || page_1[0].subscriber.to_string() == "did:cored:clairedid"
                );
            },
        );
    }

    #[test]
    fn subscription_list_works() {
        with_test_tube(
            InstantiateMsg::zero(),
            &|accounts: Vec<SigningAccount>,
              contract_addr: String,
              wasm: Wasm<CoreumTestApp>,
              _bank: Bank<CoreumTestApp>,
              _nft: NFT<CoreumTestApp>| {
                // register actors
                let alice = accounts.get(1).unwrap();
                let bob = accounts.get(2).unwrap();
                let claire = accounts.get(3).unwrap();

                mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
                mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());
                mock_register_account(&wasm, &contract_addr, claire, "claire".to_string());

                let check_subs = |wallet: &SigningAccount,
                                  page: u64,
                                  page_size: u64,
                                  expected_subs: Vec<String>| {
                    let mut expected_subs = expected_subs.clone();
                    expected_subs.sort();
                    let sub_msg = QueryMsg::GetSubscriptions {
                        wallet: Addr::unchecked(wallet.address().to_string()),
                        page: Uint64::from(page),
                        page_size: Uint64::from(page_size),
                    };
                    let mut subs = wasm
                        .query::<QueryMsg, GetSubscriptionListResponse>(&contract_addr, &sub_msg)
                        .unwrap()
                        .subscribers;
                    subs.sort();

                    // extract the subscriber addresses
                    let subs_dids = subs
                        .iter()
                        .map(|sub| sub.subscribed_to.to_string())
                        .collect::<Vec<String>>();

                    assert_eq!(subs_dids, expected_subs);
                };

                // Bob should not have any subscriptions
                check_subs(bob, 0, 10, vec![]);
                check_subs(bob, 2, 10, vec![]);
                check_subs(bob, 0, 1, vec![]);
                check_subs(bob, 0, 1000, vec![]);

                // test subscriber count
                let sub_count_msg = QueryMsg::GetSubscriberCount {
                    wallet: Addr::unchecked(claire.address().to_string()),
                };
                let sub_count = wasm.query::<QueryMsg, Uint64>(&contract_addr, &sub_count_msg);
                let count = sub_count.unwrap();
                assert_eq!(count, Uint64::from(0u64));

                // Bob subscribes to Alice
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:alicedid".to_string()).unwrap(),
                };
                let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);

                // Bob should have Alice as a subscription
                check_subs(bob, 0, 10, vec!["did:cored:alicedid".to_string()]);
                check_subs(bob, 2, 10, vec![]); // Alice is on page 0
                check_subs(bob, 0, 1, vec!["did:cored:alicedid".to_string()]);
                check_subs(bob, 0, 1000, vec!["did:cored:alicedid".to_string()]);

                // Bob subscribes to Claire
                let subscribe_msg = ExecuteMsg::Subscribe {
                    did: DID::new("did:cored:clairedid".to_string()).unwrap(),
                };
                let _ = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);

                // Bob should have Alice and Claire as subscriptions
                check_subs(
                    bob,
                    0,
                    10,
                    vec![
                        "did:cored:clairedid".to_string(),
                        "did:cored:alicedid".to_string(),
                    ],
                );

                // Claire should be on the second page when page_size is 1
                // TODO: commenting due to the undeterministic behavior of the order of subscribers
                check_subs(bob, 1, 1, vec!["did:cored:clairedid".to_string()]);
                check_subs(bob, 0, 1, vec!["did:cored:alicedid".to_string()]);

                //  Bob should have 2 subscriptions
                let sub_count_msg_bob = QueryMsg::GetSubscriptionCount {
                    wallet: Addr::unchecked(bob.address().to_string()),
                };
                let sub_count = wasm.query::<QueryMsg, Uint64>(&contract_addr, &sub_count_msg_bob);
                let count = sub_count.unwrap();

                assert_eq!(
                    count,
                    Uint64::from(2u64),
                    "Bob should have exactly 2 subscriptions (Alice and Claire)"
                );

                // Check Claire's subscriber count
                let sub_count_msg_claire = QueryMsg::GetSubscriberCount {
                    wallet: Addr::unchecked(claire.address().to_string()),
                };
                let sub_count =
                    wasm.query::<QueryMsg, Uint64>(&contract_addr, &sub_count_msg_claire);
                let count = sub_count.unwrap();

                assert_eq!(
                    count,
                    Uint64::from(1u64),
                    "Claire should have 1 subscriber (Bob)"
                );
            },
        );
    }

    #[test]
    fn resubscription_works() {
        // Create new Coreum appchain instance.
        let app = CoreumTestApp::new();

        // `Wasm` is the module we use to interact with cosmwasm releated logic on the appchain
        let wasm = Wasm::new(&app);

        // init multiple accounts
        let accs = app
            .init_accounts(&coins(INITIAL_BALANCE, FEE_DENOM), 3)
            .unwrap();
        let admin = &accs[0];

        // Store compiled wasm code on the appchain and retrieve its code id
        let wasm_byte_code = std::fs::read("./artifacts/coredin.wasm").unwrap();
        let code_id = wasm
            .store_code(&wasm_byte_code, None, admin)
            .unwrap()
            .data
            .code_id;

        // Instantiate contract with initial admin (signer) account defined beforehand and make admin list mutable
        let contract_addr = wasm
            .instantiate(
                code_id,
                &InstantiateMsg::zero(),
                Some(admin.address().as_str()),
                Some("cored.in"),
                &[],
                admin,
            )
            .unwrap()
            .data
            .address;

        //// Bob subscribes to Alice

        // register actors
        let alice = &accs[1];
        let bob = &accs[2];

        mock_register_account(&wasm, &contract_addr, alice, "alice".to_string());
        mock_register_account(&wasm, &contract_addr, bob, "bob".to_string());

        // query the contract's is_subscriber function
        // which relies on the existance of the NFT
        let is_sub_msg = QueryMsg::IsSubscriber {
            target_did: DID::new("did:cored:alicedid".to_string()).unwrap(),
            subscriber_wallet: Addr::unchecked(bob.address().to_string()),
        };

        // Bob subscribes to Alice twice in a row
        let subscribe_msg = ExecuteMsg::Subscribe {
            did: DID::new("did:cored:alicedid".to_string()).unwrap(),
        };
        let sub_1 = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);
        let sub_2 = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);
        // expect no errors
        assert!(sub_1.is_ok() && sub_2.is_ok());

        let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
        // expect that is_sub is true after the second subscription
        assert!(is_sub.is_ok() && is_sub.unwrap());

        //// Move the time forward by 2 months
        app.increase_time(2 * 60 * 60 * 24 * 30);

        let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
        // expect that is_sub is false after subscription expires
        assert!(is_sub.is_ok() && !is_sub.unwrap());

        // subscribe again
        let sub_3 = wasm.execute(&contract_addr, &subscribe_msg, &[], bob);
        // expect that is_sub is true after the third subscription
        let is_sub = wasm.query::<QueryMsg, bool>(&contract_addr, &is_sub_msg);
        assert!(sub_3.is_ok() && is_sub.is_ok() && is_sub.unwrap());
    }
}
