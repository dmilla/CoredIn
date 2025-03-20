use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

// wrapper for a DID to ensure proper format
// used in conjuction with Addr for easier distinguishing and more robust code
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, Eq)]
pub struct DID {
    value: String,
}
use cw_storage_plus::{Key, KeyDeserialize, PrimaryKey};
use std::fmt;

impl DID {
    pub fn new(value: String) -> Result<Self, &'static str> {
        // Basic DID format validation
        // DID should start with "did:" followed by a method and a method-specific identifier
        if !value.starts_with("did:") {
            return Err("DID must start with 'did:'");
        }

        let parts: Vec<&str> = value.split(':').collect();
        if parts.len() < 3 {
            return Err(
                "DID must have at least three parts: 'did', method, and method-specific identifier",
            );
        }

        // Check if the method is not empty
        if parts[1].is_empty() {
            return Err("DID method cannot be empty");
        }

        // Check if the method-specific identifier is not empty
        if parts[2].is_empty() {
            return Err("DID method-specific identifier cannot be empty");
        }

        // Additional checks can be added here for specific DID methods if needed

        Ok(DID { value })
    }

    pub fn value(&self) -> &str {
        &self.value
    }

    // New getter method to read the value from outside
    pub fn get_value(&self) -> &String {
        &self.value
    }
}

impl Ord for DID {
    fn cmp(&self, other: &Self) -> Ordering {
        self.value.cmp(&other.value)
    }
}

impl PartialOrd for DID {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl fmt::Display for DID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.value)
    }
}

// needed so the DID can be used as a key in the contract state hash map
impl PrimaryKey<'_> for DID {
    type Prefix = ();
    type SubPrefix = ();
    type Suffix = Self;
    type SuperSuffix = Self;

    fn key(&self) -> Vec<Key> {
        vec![Key::Ref(self.value.as_bytes())]
    }
}

impl KeyDeserialize for DID {
    type Output = Self;

    fn from_vec(value: Vec<u8>) -> Result<Self::Output, cosmwasm_std::StdError> {
        String::from_utf8(value)
            .map_err(|_| cosmwasm_std::StdError::invalid_utf8("DID"))
            .and_then(|s| DID::new(s).map_err(|e| cosmwasm_std::StdError::generic_err(e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_did() {
        let did = DID::new("did:example:123456789abcdefghi".to_string());
        assert!(did.is_ok());
    }

    #[test]
    fn test_invalid_did_format() {
        let did = DID::new("invalid:did:format".to_string());
        assert!(did.is_err());
    }

    #[test]
    fn test_missing_method() {
        let did = DID::new("did::123456789abcdefghi".to_string());
        assert!(did.is_err());
    }

    #[test]
    fn test_missing_identifier() {
        let did = DID::new("did:example:".to_string());
        assert!(did.is_err());
    }

    // New test for the getter method
    #[test]
    fn test_get_value() {
        let did = DID::new("did:example:123456789abcdefghi".to_string()).unwrap();
        assert_eq!(did.get_value(), "did:example:123456789abcdefghi");
    }

    // New test for the Ord trait implementation
    #[test]
    fn test_did_comparison() {
        let did1 = DID::new("did:example:123".to_string()).unwrap();
        let did2 = DID::new("did:example:456".to_string()).unwrap();
        let did3 = DID::new("did:example:123".to_string()).unwrap();

        assert!(did1 < did2);
        assert!(did2 > did1);
        assert_eq!(did1, did3);
    }
}
