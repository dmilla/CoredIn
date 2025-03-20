import { issuerService } from "@/dependencies";
import { BaseServerStateKeys } from "../constants";
import { CredentialRequestStatus } from "@coredin/shared";

export const ISSUER_QUERIES = {
  getIssuers: () => ({
    queryKey: [BaseServerStateKeys.ISSUERS],
    queryFn: () => issuerService.getIssuers()
  }),
  getRequests: (status: CredentialRequestStatus) => ({
    queryKey: [BaseServerStateKeys.CREDENTIAL_REQUESTS, status],
    queryFn: () => issuerService.getRequests(status)
  })
};
