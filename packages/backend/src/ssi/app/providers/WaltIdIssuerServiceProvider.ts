import { ConfigService } from "@nestjs/config";
import { WaltIdIssuerService } from "@/ssi/core/services";
import { SecretsService } from "@/secrets/SecretsService";

export const WaltIdIssuerServiceProvider = {
  provide: WaltIdIssuerService,
  useFactory: (config: ConfigService, secrets: SecretsService) => {
    const issuerApiUrl = config.get("issuer.api.url");
    const vaultApiUrl = config.get("vault.api.url");
    const vaultRoleId = secrets.get("vault_role_id");
    const vaultSecretId = secrets.get("vault_secret_id");
    return new WaltIdIssuerService(
      issuerApiUrl,
      vaultApiUrl,
      vaultRoleId,
      vaultSecretId
    );
  },
  inject: [ConfigService, SecretsService]
};
