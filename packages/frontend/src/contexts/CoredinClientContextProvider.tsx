import { ReactNode } from "react";
import { GasPrice } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { useChain } from "@cosmos-kit/react";
import { CoredinClient } from "@coredin/shared";
import { CoredinClientContext } from "./CoredinClientContext";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { chainInfo } from "@/dependencies";

const CoredinClientContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  // const coreumRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  //   ...defaultRegistryTypes
  // ];

  // const registry = new Registry(coreumRegistryTypes);

  const [coredinClient, setCoredinClient] = useState<CoredinClient | null>(
    null
  );
  const chainContext = useChain(chainInfo.chainName);

  useEffect(() => {
    const initializeClient = async () => {
      const client = await SigningCosmWasmClient.connectWithSigner(
        chainInfo.rpcEndpoint,
        chainContext.getOfflineSigner(),
        {
          gasPrice: GasPrice.fromString(chainInfo.gasPrice)
        }
      );
      const newClient = new CoredinClient(
        client,
        chainContext.address || "",
        chainInfo.contractAddress
      );
      setCoredinClient(newClient);
    };
    if (chainContext.isWalletConnected) {
      initializeClient();
    }
  }, [chainContext.isWalletConnected]);

  return (
    <CoredinClientContext.Provider value={coredinClient}>
      {children}
    </CoredinClientContext.Provider>
  );
};

export default CoredinClientContextProvider;
