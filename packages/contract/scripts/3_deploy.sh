#!/bin/bash

# Builds and deploys the contract to the $COREUM_CHAIN_ID_ARGS (should be testnet-1 for development)
# Assumes a funded wallet called "my_local_dev_wallet" has been imported to the CLI using:
# cored keys add my_local_dev_wallet --recover --chain-id=$CHAIN_ID

# Ask for user confirmation
echo "WARNING: This script will deploy a fresh contract on the chain."
echo "If there's already a version of the contract you care about, you should use the 2_migrate.sh script instead."
echo "Only continue if this is the first time you're deploying this contract on the chain."
read -p "Are you sure you want to proceed with deploying a new contract? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

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

echo "Deploying the contract to $COREUM_CHAIN_ID_ARGS..."
RES=$(cored tx wasm store artifacts/coredin.wasm \
    --from my_local_dev_wallet --gas auto --gas-adjustment 1.5 -y -b block --output json $COREUM_NODE_ARGS $COREUM_CHAIN_ID_ARGS)

if [ $? -ne 0 ]; then
    echo "Error: Contract deployment failed." >&2
    exit 1
fi
echo "Response: $RES"

CODE_ID=$(echo $RES | jq -r '.logs[0].events[-1].attributes[-1].value')
if [ -z "$CODE_ID" ] || [ "$CODE_ID" == "null" ]; then
    echo "Error: Failed to extract code ID from deployment response." >&2
    exit 1
fi
echo "Success! The new contract code ID is: $CODE_ID"

# At this point, the contract still has no address, it will get it after initializing
echo "Initializing the contract..."
INIT="{\"purchase_price\":{\"amount\":\"0\",\"denom\":\"$COREUM_DENOM\"}, \"subscription_fee\": \"0\"}"
INIT_RES=$(cored tx wasm instantiate $CODE_ID "$INIT" --from my_local_dev_wallet --gas auto --gas-adjustment 1.5  --label "cored.in" -b block -y --admin my_local_dev_wallet --output json  $COREUM_NODE_ARGS $COREUM_CHAIN_ID_ARGS)

if [ $? -ne 0 ]; then
    echo "Error: Contract initialization failed." >&2
    exit 1
fi
echo "Initialization response: $INIT_RES"
echo "Contract initialization done."

CONTRACT_ADDR=$(echo $INIT_RES | jq -r '.logs[0].events[] | select(.type == "instantiate") | .attributes[] | select(.key == "_contract_address").value')
if [ -z "$CONTRACT_ADDR" ] || [ "$CONTRACT_ADDR" == "null" ]; then
    echo "Error: Failed to extract contract address from initialization response." >&2
    exit 1
fi
echo "The contract address is: $CONTRACT_ADDR"

echo "export const CONTRACT_ADDRESS=\"$CONTRACT_ADDR\";" > ../shared/src/coreum/contract_address.ts
echo "Contract address saved successfully."
