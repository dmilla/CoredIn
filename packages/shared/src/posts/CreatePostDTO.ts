import { DateString } from "@/common";
import { PostRequestType } from ".";
import { PostVisibility } from "./PostVisibility";
import { SkillTag } from "@/tags";

export type CreatePostDTO = {
  text: string;
  visibility: PostVisibility;
  recipientWallets?: string[];
  replyToPostId?: number;
  skillTags?: SkillTag[];
  requestType?: PostRequestType;
  requestExpiration?: DateString;
};
