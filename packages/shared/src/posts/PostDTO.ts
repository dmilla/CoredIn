import { PublicUserProfile } from "@/user";
import { DateString } from "@/common";
import { PostVisibility, PostRequestType } from ".";
import { SkillTag } from "@/tags";

export type PostDTO = {
  id: number;
  creatorWallet: string;
  creatorUsername: string;
  creatorAvatar: string;
  creatorAvatarFallbackColor: string;
  visibility: PostVisibility;
  text: string;
  createdAt: string;
  likes: number;
  skillTags: SkillTag[];
  replyToPostId?: number;
  recipients?: PublicUserProfile[];
  unread?: boolean;
  lastReplyDate?: string;
  tips: number; // assume the coin is the native CORE coin
  requestType?: PostRequestType;
  requestExpiration?: DateString;
  boostedUntil?: DateString;
};
