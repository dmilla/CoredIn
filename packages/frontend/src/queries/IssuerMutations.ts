import { issuerService } from "@/dependencies";
import { CredentialDTO } from "@coredin/shared";
import { BaseServerStateKeys } from "../constants";

export const ISSUER_MUTATIONS = {
  requestCredential: () => ({
    mutationKey: [BaseServerStateKeys.REQUEST_CREDENTIAL],
    mutationFn: ({
      request,
      issuerDid
    }: {
      request: CredentialDTO;
      issuerDid: string;
    }) => issuerService.requestIssuance(request, issuerDid)
  }),
  acceptRequest: (id: string) => ({
    mutationKey: [BaseServerStateKeys.REJECT_CREDENTIAL, id],
    mutationFn: ({ daysValid }: { daysValid: number }) =>
      issuerService.acceptRequest(id, daysValid)
  }),
  rejectRequest: (id: string) => ({
    mutationKey: [BaseServerStateKeys.REJECT_CREDENTIAL, id],
    mutationFn: () => issuerService.rejectRequest(id)
  }),
  revokeRequest: (id: string) => ({
    mutationKey: [BaseServerStateKeys.REVOKE_CREDENTIAL, id],
    mutationFn: () => issuerService.revokeRequest(id)
  })
};
