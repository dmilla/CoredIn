import { DID } from "@/coreum/contract-ts";
import { CredentialType } from "./CredentialTypes";

export type CredentialDTO = {
  id: string;
  subjectDid: string;
  type: CredentialType;
  title: string;
  establishment: string;
  startDate: string;
  endDate?: string;
  verified: boolean;
  issuer: string;
  issuerWallet: string;
  issuerUsername: string;
};
