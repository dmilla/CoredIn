import { feedService } from "@/dependencies";
import { CreatePostDTO } from "@coredin/shared";
import { BaseServerStateKeys } from "../constants";
import { Coin } from "@cosmjs/amino";

export const FEED_MUTATIONS = {
  publish: () => ({
    mutationKey: [BaseServerStateKeys.PUBLISH],
    mutationFn: ({ post }: { post: CreatePostDTO }) => feedService.publish(post)
  }),
  likePost: () => ({
    mutationKey: [BaseServerStateKeys.LIKE_POST],
    mutationFn: ({ postId, liked }: { postId: number; liked: boolean }) =>
      feedService.likePost(postId, liked)
  }),
  deletePost: () => ({
    mutationKey: [BaseServerStateKeys.DELETE_POST],
    mutationFn: ({ postId }: { postId: number }) =>
      feedService.deletePost(postId)
  }),
  hidePost: () => ({
    mutationKey: [BaseServerStateKeys.HIDE_POST],
    mutationFn: ({ postId }: { postId: number }) => feedService.hidePost(postId)
  }),
  tipPost: () => ({
    mutationKey: [BaseServerStateKeys.TIP_POST],
    mutationFn: ({
      postId,
      tip,
      txHash
    }: {
      postId: number;
      tip: Coin;
      txHash: string;
    }) => feedService.tipPost(postId, tip, txHash)
  }),
  clearBoosts: () => ({
    mutationKey: [BaseServerStateKeys.CLEAR_BOOSTS],
    mutationFn: () => feedService.clearBoosts()
  })
};
