import { CredentialType } from "@coredin/shared";

export type VerifiableCredential = {
  id: string;
  document: string;
  // disclosures: null;
  addedOn: string;
  // deletedOn: null;
  parsedDocument: {
    type: "VerifiableCredential" & CredentialType[];
    issuer: {
      id: string;
    };
    issuanceDate: string; //"2024-06-13T10:38:31.080318598Z";
    credentialSubject: {
      id: string; //"did:...";
      title: string;
      establishment: string;
      startDate: string; // "2023-12-13";
      endDate?: string; // "2023-12-13";
    };
    id: string; //"urn:uuid:1223..879";
    expirationDate: string; // "2025-06-13T10:38:31.080400807Z";
  };
};
