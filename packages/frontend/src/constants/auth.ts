export const ConnectedWalletKey = "connectedWallet";

export enum EventTypes {
  UNAUTHORIZED_API_REQUEST = "UnauthorizedAPIRequest"
}

export const makeUnauthorizedAPIRequestEvent = (args?: Record<string, any>) => {
  return new CustomEvent(EventTypes.UNAUTHORIZED_API_REQUEST, {
    detail: args ?? {}
  });
};

export const getAuthKey = (walletAddress: string): string => {
  return `wallet:${walletAddress.toLowerCase()}-auth`;
};
