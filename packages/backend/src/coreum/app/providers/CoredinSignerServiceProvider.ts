import { CoredinSignerService } from "@/coreum/services";
import { SecretsService } from "@/secrets/SecretsService";
import { CoredinClient } from "@coredin/shared";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { ConfigService } from "@nestjs/config";

export const CoredinSignerServiceProvider = {
  provide: CoredinSignerService,
  useFactory: async (config: ConfigService, secretsService: SecretsService) => {
    try {
      const pKey = secretsService.get("signer_pkey");
      const rpcEndpoint = config.get("chain.rpc_endpoint");
      const bech32Prefix = config.get("chain.bech32_prefix");
      const gasPrice = config.get("chain.gas_price");
      const contractAddress = config.get("chain.contract_address");
      if (!rpcEndpoint || !bech32Prefix || !gasPrice || !contractAddress) {
        throw new Error(
          "Missing required configuration for CoredinSignerService"
        );
      }
      const signer = await DirectSecp256k1Wallet.fromKey(
        Uint8Array.from(Buffer.from(pKey, "hex")),
        bech32Prefix
      );
      const client = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        signer,
        {
          gasPrice: GasPrice.fromString(gasPrice)
        }
      );
      const sender = (await signer.getAccounts())[0].address;
      console.log("Providing CoredinSignerService from sender ", sender);
      return new CoredinSignerService(
        new CoredinClient(client, sender, contractAddress)
      );
    } catch (err) {
      console.error(
        "Exception occurred while constructing CoredinSignerServiceProvider",
        err
      );
      throw err;
    }
  },
  inject: [ConfigService, SecretsService]
};
