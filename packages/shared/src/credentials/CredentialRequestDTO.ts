import { PublicUserProfile } from "@/user";
import { CredentialDTO } from "./CredentialDTO";
import { CredentialRequestStatus } from "./CredentialRequestStatus";

export type CredentialRequestDTO = {
  id: string;
  credential: CredentialDTO;
  requester: PublicUserProfile;
  createdAt: string;
  status: CredentialRequestStatus;
};
