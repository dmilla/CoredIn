#!/bin/bash

# Migrates the contract to a new version on the $COREUM_CHAIN_ID_ARGS (should be testnet-1 for development)
# Assumes a funded wallet called "my_local_dev_wallet" has been imported to the CLI using:
# cored keys add my_local_dev_wallet --recover --chain-id=$CHAIN_ID
# It also assumes it is the same wallet used for the initial deployment, since it is set as contract admin

# Ensure that the wallet "my_local_dev_wallet" exists before proceeding
echo "Checking for existence of 'my_local_dev_wallet'..."
if ! cored keys list --chain-id=$CHAIN_ID | grep -q "my_local_dev_wallet"; then
    echo "Error: Wallet 'my_local_dev_wallet' not found." >&2
    echo "Please import the wallet using the following command and rerun the script:"
    echo "cored keys add my_local_dev_wallet --recover --chain-id=\$CHAIN_ID"
    exit 1
fi

echo "Building the contract..."
chmod +x ./scripts/1_build.sh
if ./scripts/1_build.sh; then
    echo "Success! Contract build complete."
else
    echo "Error: Contract build failed." >&2
    exit 1
fi

echo "Uploading new contract code to $COREUM_CHAIN_ID_ARGS..."
RES=$(cored tx wasm store artifacts/coredin.wasm \
    --from my_local_dev_wallet --gas auto --gas-adjustment 1.5 -y -b block --output json $COREUM_NODE_ARGS $COREUM_CHAIN_ID_ARGS)

if [ $? -ne 0 ]; then
    echo "Error: Contract code upload failed." >&2
    exit 1
fi
echo "Response: $RES"

NEW_CODE_ID=$(echo $RES | jq -r '.logs[0].events[-1].attributes[-1].value')
if [ -z "$NEW_CODE_ID" ] || [ "$NEW_CODE_ID" == "null" ]; then
    echo "Error: Failed to extract new code ID from upload response." >&2
    exit 1
fi
echo "Success! The new contract code ID is: $NEW_CODE_ID"

# Retrieve the current contract address
CONTRACT_ADDR=$(cat ../shared/src/coreum/contract_address.ts | grep -o '"[^"]*"' | sed 's/"//g')
if [ -z "$CONTRACT_ADDR" ] || [ "$CONTRACT_ADDR" == "null" ]; then
    echo "Error: Failed to retrieve current contract address." >&2
    exit 1
fi
echo "Current contract address is: $CONTRACT_ADDR"

# Perform the migration
echo "Migrating the contract..."
MIGRATE_MSG="{}"  # Add migration parameters if needed
MIGRATE_RES=$(cored tx wasm migrate $CONTRACT_ADDR $NEW_CODE_ID "$MIGRATE_MSG" \
    --from my_local_dev_wallet --gas auto --gas-adjustment 1.5 -y -b block --output json $COREUM_NODE_ARGS $COREUM_CHAIN_ID_ARGS)

if [ $? -ne 0 ]; then
    echo "Error: Contract migration failed." >&2
    exit 1
fi
echo "Migration response: $MIGRATE_RES"
echo "Contract migration completed successfully."

echo "The contract address remains: $CONTRACT_ADDR"
echo "The new code ID is: $NEW_CODE_ID"
