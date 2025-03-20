import { Headers } from "@nestjs/common";

export const WALLET_HEADER = "x-coredin-authenticated-wallet";

export const WalletParam = () => Headers(WALLET_HEADER);
