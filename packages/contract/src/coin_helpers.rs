use crate::error::ContractError;
use cosmwasm_std::{Addr, Coin, Env};

pub fn generate_nft_symbol(_env: Env, raw_string: &String, suffix: Option<String>) -> String {
    // concat the suffix if it exists
    let mut symbol = raw_string.clone();
    if let Some(suffix) = suffix {
        symbol.push_str(&suffix);
    }

    // Filter out invalid characters that don't match [a-zA-Z0-9/:._]
    let filtered_symbol: String = symbol
        .chars()
        .filter(|c| c.is_alphanumeric() || ['/', ':', '.', '_'].contains(c))
        .collect();

    // Prepend a letter if the first character is not alphabetic
    let mut symbol = if !filtered_symbol
        .chars()
        .next()
        .unwrap_or('0')
        .is_alphabetic()
    {
        format!("A{}", filtered_symbol)
    } else {
        filtered_symbol
    };

    // Ensure the length is 30 characters max
    symbol = symbol.chars().take(30).collect::<String>();

    symbol
}

pub fn generate_nft_class_id(env: Env, prefix: String, suffix: Option<String>) -> String {
    // classID must match format [symbol]-[issuer-address]
    //      and must match this regex:
    // symbol in classID should be lowercase and must be unique in the contract
    //      and should match this regex: ^[a-zA-Z][a-zA-Z0-9/:._]{0,30}$
    // issuer-address in classID should be the address of the contract
    let mut class_id = String::new();

    // Concatenate the remaining parts of the address and wallet, filtering for valid characters
    let filtered_part = format!(
        "{}-{}",
        generate_nft_symbol(env.clone(), &prefix, suffix),
        env.contract.address.to_string()
    )
    .chars()
    .filter(|c| c.is_alphanumeric() || [':', '/', '.', '_', '-'].contains(c))
    .collect::<String>();

    // Append the filtered part to the class ID
    class_id.push_str(&filtered_part);

    class_id
}

pub fn generate_nft_id(_env: Env, subscriber_wallet: Addr, subscribe_to_wallet: Addr) -> String {
    let mut nft_id = String::new();

    // Concatenate characters from the input strings to form the rest of the NFT ID
    nft_id.push_str(&format!(
        "{}{}",
        subscriber_wallet.to_string(),
        subscribe_to_wallet.to_string()
    ));

    // Filter out any characters not allowed by the regex
    nft_id = nft_id
        .chars()
        .filter(|c| c.is_alphanumeric() || [':', '/', '.', '_', '-'].contains(c))
        .collect();

    // Ensure the length of the ID is between 3 and 101 characters
    if nft_id.len() < 3 {
        nft_id.push_str(
            &std::iter::repeat_with(|| '0')
                .take(3 - nft_id.len())
                .collect::<String>(),
        );
    } else if nft_id.len() > 100 {
        nft_id.truncate(100);
    }

    nft_id
}

pub fn assert_sent_sufficient_coin(
    sent: &[Coin],
    required: Option<Coin>,
) -> Result<(), ContractError> {
    if let Some(required_coin) = required {
        let required_amount = required_coin.amount.u128();
        if required_amount > 0 {
            let required_sent = sent.iter().find(|x| x.denom == required_coin.denom);
            match required_sent {
                None => {
                    return Err(ContractError::InsufficientFundsSend {
                        sent: required_sent.cloned(),
                        expected: Some(required_coin.clone()),
                    })
                }
                Some(x) => {
                    if x.amount < required_coin.amount {
                        return Err(ContractError::InsufficientFundsSend {
                            sent: required_sent.cloned(),
                            expected: Some(required_coin.clone()),
                        });
                    }
                }
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;
    use cosmwasm_std::{coin, coins};

    #[test]
    fn assert_sent_sufficient_coin_works() {
        match assert_sent_sufficient_coin(&[], Some(coin(0, "token"))) {
            Ok(()) => {}
            Err(e) => panic!("Unexpected error: {:?}", e),
        };

        match assert_sent_sufficient_coin(&[], Some(coin(5, "token"))) {
            Ok(()) => panic!("Should have raised insufficient funds error"),
            Err(ContractError::InsufficientFundsSend {
                sent: _,
                expected: _,
            }) => {}
            Err(e) => panic!("Unexpected error: {:?}", e),
        };

        match assert_sent_sufficient_coin(&coins(10, "smokin"), Some(coin(5, "token"))) {
            Ok(()) => panic!("Should have raised insufficient funds error"),
            Err(ContractError::InsufficientFundsSend {
                sent: _,
                expected: _,
            }) => {}
            Err(e) => panic!("Unexpected error: {:?}", e),
        };

        match assert_sent_sufficient_coin(&coins(10, "token"), Some(coin(5, "token"))) {
            Ok(()) => {}
            Err(e) => panic!("Unexpected error: {:?}", e),
        };

        let sent_coins = vec![coin(2, "smokin"), coin(5, "token"), coin(1, "earth")];
        match assert_sent_sufficient_coin(&sent_coins, Some(coin(5, "token"))) {
            Ok(()) => {}
            Err(e) => panic!("Unexpected error: {:?}", e),
        };
    }
}
