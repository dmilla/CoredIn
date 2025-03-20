import { CoredinContractService } from "@/coreum/services";
import { CoredinQueryClient } from "@coredin/shared";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ConfigService } from "@nestjs/config";

export const CoredinContractServiceProvider = {
  provide: CoredinContractService,
  useFactory: async (config: ConfigService) => {
    const rpcEndpoint = config.get("chain.rpc_endpoint");
    const contractAddress = config.get("chain.contract_address");
    if (!rpcEndpoint || !contractAddress) {
      throw new Error(
        "Missing required configuration for CoredinContractService"
      );
    }
    try {
      const client = await CosmWasmClient.connect(rpcEndpoint);
      return new CoredinContractService(
        new CoredinQueryClient(client, contractAddress)
      );
    } catch (err) {
      console.error(
        "Exception occurred while constructing CoredinContractServiceProvider",
        err
      );
      throw err;
    }
  },
  inject: [ConfigService]
};
