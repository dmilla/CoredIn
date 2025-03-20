#!/bin/bash

SECRET_NAME_PREFIX="coredin-vault/"

update_secret() {
    local secret_name="$1"
    local secret_value="$2"

    aws secretsmanager get-secret-value --region "$AWS_REGION" --secret-id "$SECRET_NAME_PREFIX$secret_name" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        aws secretsmanager put-secret-value \
            --region "$AWS_REGION" \
            --secret-id "$SECRET_NAME_PREFIX$secret_name" \
            --secret-string "$secret_value"
        echo "Updated $SECRET_NAME_PREFIX$secret_name in AWS Secrets Manager"
    else
        echo "Secret $SECRET_NAME_PREFIX$secret_name not found in AWS Secrets Manager!"
        exit 1
    fi
}

sleep 10

echo "Starting vault, checking for volumes..."
echo "Checking for config..."
echo | ls -lh /vault/config
echo "Checking for data..."
echo | ls -lh /vault/data || echo "No data directory"

VAULT_STATUS_OUTPUT=$(bao status -format=json)
echo $VAULT_STATUS_OUTPUT

initialized=$(echo "$VAULT_STATUS_OUTPUT" | jq -r ".initialized")
echo "initialized" $initialized

if [ "$initialized" = false ] ; then
    echo "Initialising vault..."
    VAULT_INIT_OUTPUT=$(bao operator init -format=json)

    # echo "$VAULT_INIT_OUTPUT"

    echo "Enabling transit..."
    initial_root_token=$(echo "$VAULT_INIT_OUTPUT" | jq -r ".root_token")
    bao login "$initial_root_token"
    bao secrets enable transit

    echo "Vault server successfully initialised. Writing secrets to AWS..."

    update_secret "root-token" "$initial_root_token"
fi

secret_name="root-token"
root_token=$(aws secretsmanager get-secret-value --region "$AWS_REGION" --secret-id "$SECRET_NAME_PREFIX$secret_name" | jq -r ".SecretString")
bao login "$root_token"

VAULT_AUTH_LIST_OUTPUT=$(bao auth list -format=json)
echo $VAULT_AUTH_LIST_OUTPUT

app_role_enabled=$(echo "$VAULT_AUTH_LIST_OUTPUT" | jq -r '.["approle/"]')
echo "app_role_enabled" $app_role_enabled

if [ "$app_role_enabled" = null ] ; then
    echo "Enabling approle..."
    bao auth enable approle
fi

APP_ROLE="TEST"
EXISTING_ROLE_ID=$(bao read auth/approle/role/$APP_ROLE/role-id -format=json | jq -r ".data.role_id")

if ["$EXISTING_ROLE_ID" = ""] ; then
    echo 'path "transit/*" {
        capabilities = ["create", "update", "read", "delete", "list"]
    }' > transit-policy.hcl
    bao policy write transit-policy transit-policy.hcl
    bao write auth/approle/role/$APP_ROLE token_type=batch token_policies="transit-policy"
    VAULT_ROLE_ID=$(bao read auth/approle/role/$APP_ROLE/role-id -format=json | jq -r ".data.role_id")
    VAULT_SECRET_ID=$(bao write -f auth/approle/role/$APP_ROLE/secret-id -format=json | jq -r ".data.secret_id")
    # echo "Role ID: $VAULT_ROLE_ID"
    # echo "Secret ID: $VAULT_SECRET_ID"
    update_secret "role-id" "$VAULT_ROLE_ID"
    update_secret "secret-id" "$VAULT_SECRET_ID"
fi


echo "Vault setup complete."