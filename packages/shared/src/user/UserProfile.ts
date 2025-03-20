import { tags } from "typia";
import { CredentialDTO, DID, HexColor, PhotoUrl, ShortString } from "..";
import { SkillTag } from "@/tags";

export interface PublicUserProfile {
  wallet: string;
  username: ShortString;
  skillTags: SkillTag[];
  avatarUrl?: PhotoUrl;
  avatarFallbackColor?: HexColor;
  backgroundColor?: HexColor;
  bio?: string & tags.MaxLength<250>;
  issuerDid?: string;
}

export interface UserProfile extends PublicUserProfile {
  did?: DID;
  likedPosts: number[];
  credentials: CredentialDTO[];
  // credentialsMerkleRoot: string;
}
