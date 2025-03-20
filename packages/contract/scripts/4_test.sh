# ./scripts/1_build.sh

# OPTION 1:

# build  binary for build speed
# docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/optimizer:0.15.0


# OPTION 2:

# arm version of the Docker optimizer image
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/optimizer-arm64:0.16.0
# ^--- issue with this:
# thread 'tests::subscription::tests::subscribe_payout_owner_tube' panicked at src/tests/subscription.rs:598:18:
# called `Result::unwrap()` on an `Err` value: ExecuteError { msg: "failed to execute message; message index: 0: dispatch: submessages: : invalid coins" }

# OPTION 3:

# build raw
# cargo build --target wasm32-unknown-unknown --lib --out-dir ./artifacts -Z unstable-options --release
# ^--- issue with this:
# thread 'tests::subscription::tests::subscribe_payout_owner_tube' panicked at src/tests/common.rs:122:22:
# called `Result::unwrap()` on an `Err` value: ExecuteError { msg: "tx gas limit 172677938 exceeds block max gas 50000000: invalid gas limit" }
# 172677938 - gas needed to deploy the contract with --release build
# 499321018 - gas needed to deploy the contract WITHOUT --release flag during build (makes sense debug build needs more gas to deploy)



# run tests
RUST_BACKTRACE=1 cargo test -- --nocapture