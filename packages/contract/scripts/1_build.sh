#!/bin/bash

# set these in your .bashrc or .zshrc according to: https://docs.coreum.dev/docs/tutorials/get-started/setup-cli

# export COREUM_CHAIN_ID="coreum-testnet-1"
# export COREUM_DENOM="utestcore"
# export COREUM_NODE="https://full-node.testnet-1.coreum.dev:26657"
# export COREUM_VERSION="v3.0.3"

# export CORED_NODE=https://full-node.testnet-1.coreum.dev:26657
# export CHAIN_ID="coreum-testnet-1"

# export COREUM_CHAIN_ID_ARGS="--chain-id=$COREUM_CHAIN_ID"
# export COREUM_NODE_ARGS="--node=$COREUM_NODE"

# export COREUM_HOME=$HOME/.core/"$COREUM_CHAIN_ID"

# export COREUM_BINARY_NAME=$(arch | sed s/aarch64/cored-linux-arm64/ | sed s/x86_64/cored-linux-amd64/)

# builds the contract code inside of the container
# this can take a looong time!
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/optimizer:0.16.1
# result are is in ./artefacts/coredin.wasm