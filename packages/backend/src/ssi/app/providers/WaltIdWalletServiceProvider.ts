import { ConfigService } from "@nestjs/config";
import { WaltIdWalletService } from "@/ssi/core/services";
import { SecretsService } from "@/secrets/SecretsService";

export const WaltIdWalletServiceProvider = {
  provide: WaltIdWalletService,
  useFactory: (config: ConfigService, secrets: SecretsService) => {
    const walletApiUrl = config.get("wallet.api.url");
    const vaultApiUrl = config.get("vault.api.url");
    const vaultRoleId = secrets.get("vault_role_id");
    const vaultSecretId = secrets.get("vault_secret_id");
    return new WaltIdWalletService(
      walletApiUrl,
      vaultApiUrl,
      vaultRoleId,
      vaultSecretId
    );
  },
  inject: [ConfigService, SecretsService]
};
