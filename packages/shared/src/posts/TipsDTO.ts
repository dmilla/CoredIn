export type TipDTO = {
  id: number;
  postId: number;
  tipperWallet: string;
  tipperUsername: string;
  tipperAvatar: string;
  tipperAvatarFallbackColor: string;
  receiverWallet: string;
  receiverUsername: string;
  receiverAvatar: string;
  receiverAvatarFallbackColor: string;
  createdAt: string;
  amount: string;
  denom: string;
  isViewed: boolean;
};

export type TipsDTO = {
  receivedTips: TipDTO[];
  sentTips: TipDTO[];
};
