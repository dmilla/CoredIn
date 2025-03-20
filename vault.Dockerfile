FROM openbao/openbao:2.0.2

RUN apk update && \
    apk add --no-cache \
    aws-cli \
    curl \
    bash

RUN curl -sSL -o /usr/local/bin/jq "https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64" \
    && chmod +x /usr/local/bin/jq

EXPOSE 8200

ENV BAO_ADDR=http://0.0.0.0:8200

VOLUME /vault/data

COPY packages/backend/vault/prod/config /vault/config

COPY packages/backend/vault/initialise_vault.sh /vault/initialise_vault.sh
COPY packages/backend/vault/initialise_vault_bash.sh /vault/initialise_vault_bash.sh

RUN dos2unix /vault/initialise_vault.sh
RUN dos2unix /vault/initialise_vault_bash.sh

RUN chmod +x /vault/initialise_vault.sh
RUN chmod +x /vault/initialise_vault_bash.sh

CMD ["bash", "-c", "chmod -R 777 /vault && bao server -config /vault/config/bao_config.json & /vault/initialise_vault_bash.sh && wait"]
