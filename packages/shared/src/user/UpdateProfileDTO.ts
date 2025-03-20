import { tags } from "typia";
import { HexColor, PhotoUrl } from "..";
import { SkillTag } from "@/tags";

export interface UpdateProfileDTO {
  avatarUrl?: PhotoUrl | "";
  avatarFallbackColor?: HexColor;
  backgroundColor?: HexColor;
  skillTags?: SkillTag[];
  bio?: string & tags.MaxLength<250>;
}
