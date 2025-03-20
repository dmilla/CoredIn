extern crate sha3;

use sha3::{Digest, Keccak256};

pub struct MerkleTree {
    credentials: Vec<String>,
    root: String,
}

impl MerkleTree {
    // Create a new MerkleTree
    pub fn new() -> MerkleTree {
        MerkleTree {
            credentials: Vec::new(),
            root: String::new(),
        }
    }

    // Helper function to hash a hex encoded string using Keccak256
    pub fn hash(data: &str) -> String {
        let mut hasher = Keccak256::new();
        let decoded = hex::decode(data).expect("Decoding failed");
        hasher.update(decoded);
        format!("{:x}", hasher.finalize())
    }

    // Add a credential to the Merkle tree
    pub fn add_credential(&mut self, raw_credential: String) {
        let encoded = hex::encode(raw_credential);
        self.credentials.push(Self::hash(&encoded.to_string()));
        self.credentials.sort();
        self.root = self.compute_root();
    }

    // Compute the Merkle root of the tree
    fn compute_root(&self) -> String {
        let mut hashes: Vec<String> = self.credentials.clone();

        while hashes.len() > 1 {
            hashes = self.pair_hashes(hashes);
        }

        hashes.first().cloned().unwrap_or_default()
    }

    // Helper function to pair hashes
    fn pair_hashes(&self, hashes: Vec<String>) -> Vec<String> {
        let mut paired_hashes = Vec::new();
        let mut i = 0;

        while i < hashes.len() {
            let left = &hashes[i];
            let right = if i + 1 < hashes.len() {
                Some(&hashes[i + 1])
            } else {
                None
            };
            match right {
                Some(right_val) => {
                    if left < right_val {
                        paired_hashes.push(Self::hash(&(left.clone() + right_val)));
                    } else {
                        paired_hashes.push(Self::hash(&(right_val.clone() + &left)));
                    }
                }
                None => {
                    paired_hashes.push(left.clone());
                }
            }
            i += 2;
        }

        paired_hashes
    }

    // Get the Merkle root
    pub fn get_root(&self) -> String {
        self.root.clone()
    }
    // Generate proof for a given credential (not hashed)
    pub fn generate_proof(&self, raw_credential: &String) -> Option<Vec<String>> {
        let hashed_credential = Self::hash(hex::encode(raw_credential).as_ref());

        let mut index = self
            .credentials
            .iter()
            .position(|x| *x == hashed_credential)?;

        let mut proof = Vec::new();
        let mut level_hashes: Vec<String> = self.credentials.clone();

        while level_hashes.len() > 1 {
            let sibling_index = if index % 2 == 0 { index + 1 } else { index - 1 };
            if sibling_index < level_hashes.len() {
                proof.push(level_hashes[sibling_index].clone());
            }

            index /= 2;
            level_hashes = self.pair_hashes(level_hashes);
        }

        Some(proof)
    }

    // Verify a proof for a given credential and a root (static method)
    pub fn verify_proof_for_root(root: &String, leaf: &String, proof: Vec<String>) -> bool {
        let mut current_hash = leaf.clone();
        for sibling_hash in proof {
            if current_hash < sibling_hash {
                current_hash = Self::hash(&(current_hash + &sibling_hash));
            } else {
                current_hash = Self::hash(&(sibling_hash + &current_hash));
            }
        }
        current_hash == *root
    }

    // Verify a proof for a given credential and locally stored credentials
    pub fn verify_proof(&self, leaf: &String, proof: Vec<String>) -> bool {
        Self::verify_proof_for_root(&self.root, leaf, proof)
    }
}

#[cfg(test)]
mod tests {
    use crate::merkle_tree::MerkleTree;
    use hex;

    #[test]
    fn test_static_verify() {
        // Sample values generated from cored.in backend
        let root = "343b781460b1484625b8dc47d69d8af0d9fe2eb5a6dc4aea114b50aa8d204a64".to_string();
        let leaf = "5b88eec706f39fec172b7328f57839dcdeec893bfda5e763e55a424c28022642".to_string();
        let proof = vec![
            "57b62ddde8cc706659e5c1db6c2d5096fac49e477e8bf9f5992967c6cb305acd".to_string(),
            "e4962589fd26724a71cb7609475e7260b8e92e55fb33753369ef0c964ecee50d".to_string(),
            "ad358cb5c113b643d6c452791d03a62db1589b49f9f8920e18a32e72e7aa81a4".to_string(),
        ];

        let res = MerkleTree::verify_proof_for_root(&root, &leaf, proof);
        assert!(res, "Invalid proof");
    }

    #[test]
    fn test_merkle_tree_logic() {
        // Random set of credentials
        let credentials = vec![
            "urn:uuid:73740255-eded-46dc-88f9-830ba0971b16".to_string(),
            "urn:uuid:a332dac8-b5e3-4f00-8ed6-e32ea5077f0e".to_string(),
            "urn:uuid:8be48d9f-70c9-4ffa-8379-b3e68772e7cc".to_string(),
            "urn:uuid:f242fa1b-ea51-4e35-8c85-4588abed0491".to_string(),
            "urn:uuid:c9a4033b-1aa6-450e-bc66-725acfae7b88".to_string(),
        ];

        // Create a new Merkle tree from credentials
        let mut merkle_tree = MerkleTree::new();
        for cred in credentials {
            merkle_tree.add_credential(cred.to_string());
        }

        // Pick a credential and generate proofs for it
        let target_credential = "urn:uuid:73740255-eded-46dc-88f9-830ba0971b16".to_string();
        let proofs = merkle_tree.generate_proof(&target_credential).unwrap();

        // Verify the root using the generated proofs
        let target_credential_hashed = MerkleTree::hash(hex::encode(target_credential).as_ref());
        let verification_result =
            merkle_tree.verify_proof(&target_credential_hashed, proofs.clone());

        // Check if the verification result matches the original root
        assert!(verification_result, "Merkle root verification failed");

        // Negative case: Verify a non-existent credential
        let non_existent_credential =
            MerkleTree::hash(hex::encode("non_existent_credential").as_ref());
        let non_existent_verification_result =
            merkle_tree.verify_proof(&non_existent_credential, proofs);

        // The verification result should not match the original root
        assert!(
            !non_existent_verification_result,
            "Non-existent credential verification should fail"
        );
    }
}
