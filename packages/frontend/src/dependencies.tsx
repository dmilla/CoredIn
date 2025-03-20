import {
  AuthService,
  FeedService,
  HttpService,
  IssuerService,
  StorageService,
  FeatureFlagService
} from "@/services";
import { UserService } from "./modules/user/services";
import {
  MAINNET_CHAIN_ID,
  TESTNET_CHAIN_ID,
  MAINNET_CHAIN_RPC_ENDPOINT,
  TESTNET_CHAIN_RPC_ENDPOINT,
  MAINNET_CHAIN_BECH32_PREFIX,
  TESTNET_CHAIN_BECH32_PREFIX,
  MAINNET_GAS_PRICE,
  TESTNET_GAS_PRICE,
  TESTNET_FEE_DENOM,
  MAINNET_FEE_DENOM,
  MAINNET_CHAIN_NAME,
  TESTNET_CHAIN_NAME,
  MAINNET_CONTRACT_ADDRESS,
  TESTNET_CONTRACT_ADDRESS
} from "@coredin/shared";

interface customWindow extends Window {
  __API_URL__?: string;
  __CHAIN_ID__?: string;
}

declare const window: customWindow;
declare const __API_URL__: string;
declare const __CHAIN_ID__: string;

const apiUrl = window.__API_URL__ || __API_URL__ || "/api/";
const chainId = window.__CHAIN_ID__ || __CHAIN_ID__;

export const chainInfo =
  chainId === MAINNET_CHAIN_ID
    ? {
        chainId: MAINNET_CHAIN_ID,
        chainName: MAINNET_CHAIN_NAME,
        rpcEndpoint: MAINNET_CHAIN_RPC_ENDPOINT,
        bech32Prefix: MAINNET_CHAIN_BECH32_PREFIX,
        feeDenom: MAINNET_FEE_DENOM,
        gasPrice: MAINNET_GAS_PRICE,
        contractAddress: MAINNET_CONTRACT_ADDRESS
      }
    : {
        chainId: TESTNET_CHAIN_ID,
        chainName: TESTNET_CHAIN_NAME,
        rpcEndpoint: TESTNET_CHAIN_RPC_ENDPOINT,
        bech32Prefix: TESTNET_CHAIN_BECH32_PREFIX,
        feeDenom: TESTNET_FEE_DENOM,
        gasPrice: TESTNET_GAS_PRICE,
        contractAddress: TESTNET_CONTRACT_ADDRESS
      };

export const persistentStorageService = new StorageService();
export const authService = new AuthService(apiUrl);
export const featureFlagService = new FeatureFlagService(apiUrl);

const httpService = new HttpService(apiUrl);
export const userService = new UserService(httpService);
export const feedService = new FeedService(httpService);
export const issuerService = new IssuerService(httpService);
