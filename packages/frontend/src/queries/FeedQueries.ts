import { feedService } from "@/dependencies";
import { BaseServerStateKeys } from "../constants";

export const FEED_QUERIES = {
  get: (postId: number, creator: string) => ({
    queryKey: [BaseServerStateKeys.POST, postId.toString(), creator],
    queryFn: () => feedService.get(postId, creator)
  }),
  getFeed: () => ({
    queryKey: [BaseServerStateKeys.FEED],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      feedService.getFeed(pageParam)
  }),
  getUserFeed: (user: string) => ({
    queryKey: [BaseServerStateKeys.USER_FEED, user],
    queryFn: () => feedService.getUserFeed(user)
  }),
  getMessages: () => ({
    queryKey: [BaseServerStateKeys.MESSAGES_FEED],
    queryFn: () => feedService.getMessageFeed()
  })
};
