import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { wallets as leapWallets } from "@cosmos-kit/leap-extension";
import { wallets as leapMobileWallets } from "@cosmos-kit/leap-mobile";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as capsuleWallets } from "@cosmos-kit/leap-capsule-social-login";
import {
  assets as testnetAssets,
  chain as testnetChain
} from "chain-registry/testnet/coreumtestnet";
import {
  assets as mainnetAssets,
  chain as mainnetChain
} from "chain-registry/mainnet/coreum";
import CoredinClientContextProvider from "./contexts/CoredinClientContextProvider";
import { MainWalletBase } from "@cosmos-kit/core";
import { MAINNET_CHAIN_ID } from "@coredin/shared";
import { chainInfo } from "./dependencies";
import { Decimal } from "@cosmjs/math";
import "@interchain-ui/react/styles";

function App() {
  const queryClient = new QueryClient();

  const wallets: MainWalletBase[] = [
    ...capsuleWallets,
    ...keplrWallets,
    ...leapWallets,
    ...leapMobileWallets,
    ...cosmostationWallets.filter(
      (wallet) => !wallet.walletInfo.name.includes("mobile")
    )
  ];
  // const [wallets, setWallets] = useState<MainWalletBase[]>(defaultWallets);
  // const [loadingWallets, setLoadingWallet] = useState<boolean>(false);

  // useEffect(() => {
  //   setLoadingWallet(true);
  //   import("@cosmos-kit/leap-capsule-social-login")
  //     .then((CapsuleModule) => {
  //       return CapsuleModule.wallets;
  //     })
  //     .then((leapSocialLogin) => {
  //       setWallets([...defaultWallets, ...leapSocialLogin]);
  //       setLoadingWallet(false);
  //     });
  // }, []);

  // if (loadingWallets) {
  //   return <Spinner />;
  // }

  const [chain, assets] =
    chainInfo.chainId === MAINNET_CHAIN_ID
      ? [mainnetChain, mainnetAssets]
      : [testnetChain, testnetAssets];

  return (
    <>
      <ChainProvider
        chains={[chain]}
        assetLists={[assets]}
        wallets={wallets}
        logLevel={"DEBUG"}
        // disableIframe={false}
        walletConnectOptions={{
          signClient: {
            projectId: "3c93ae7c4ce89a1de5995c26859dbfbc",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "cored.in",
              description: "cored.in main site",
              url: "https://cored.in",
              icons: []
            }
          }
        }}
        signerOptions={
          {
            signingCosmwasm: () => ({
              gasPrice: {
                denom: chainInfo.feeDenom,
                amount: Decimal.fromUserInput("0.0625", 6)
              }
            }),
            signingStargate: () => ({
              gasPrice: {
                denom: chainInfo.feeDenom,
                amount: Decimal.fromUserInput("0.0625", 6)
              }
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
        throwErrors={false}
        subscribeConnectEvents={true}
        defaultNameService={"stargaze"}
        endpointOptions={{
          isLazy: true,
          endpoints: {
            cosmoshub: {
              rpc: [
                {
                  url: "https://rpc.cosmos.directory/cosmoshub",
                  headers: {}
                }
              ]
            }
          }
        }}
      >
        <QueryClientProvider client={queryClient}>
          <CoredinClientContextProvider>
            <RouterProvider router={router} />
          </CoredinClientContextProvider>
        </QueryClientProvider>
      </ChainProvider>
    </>
  );
}

export default App;

// const LeapSocialLogin = lazy(() =>
//   import("@leapwallet/cosmos-social-login-capsule-provider-ui").then((m) => ({
//     default: m.CustomCapsuleModalView
//   }))
// );

// export function CustomCapsuleModalViewX() {
//   const [showCapsuleModal, setShowCapsuleModal] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         await capsuleProvider.enable();
//         setIsAuthenticated(true);
//         console.log({
//           title: "Authentication Status",
//           description: "You are already authenticated."
//         });
//       } catch (error) {
//         console.log("Not authenticated:", error);
//         console.log({
//           title: "Authentication Status",
//           description: "You are not authenticated.",
//           variant: "destructive"
//         });
//       }
//     };
//     checkAuthStatus();
//   }, []);

// useEffect(() => {
//   window.openCapsuleModal = () => {
//     setShowCapsuleModal(true);
//   };
// }, []);
//   console.log(import.meta.env.VITE_CAPSULE_API_KEY);

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <LeapSocialLogin
//         capsule={capsuleProvider.getClient()}
//         showCapsuleModal={showCapsuleModal}
//         setShowCapsuleModal={setShowCapsuleModal}
//         appName="cored.in"
//         logoUrl="https://www.shutterstock.com/image-vector/lorem-ipsum-logo-design-consept-260nw-1456986776.jpg"
//         oAuthMethods={[
//           OAuthMethod.APPLE,
//           OAuthMethod.DISCORD,
//           OAuthMethod.FACEBOOK,
//           OAuthMethod.GOOGLE,
//           OAuthMethod.TWITTER
//         ]}
//         onAfterLoginSuccessful={() => {
//           window.successFromCapsuleModal();
//         }}
//         onLoginFailure={() => {
//           window.failureFromCapsuleModal();
//         }}
//       />
//     </Suspense>
//   );
// }
