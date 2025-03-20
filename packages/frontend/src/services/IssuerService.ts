import { HttpService } from "@/services";
import {
  CredentialDTO,
  CredentialRequestDTO,
  CredentialRequestStatus,
  UserProfile
} from "@coredin/shared";

export class IssuerService {
  constructor(private readonly http: HttpService) {}

  async getIssuers(): Promise<UserProfile[]> {
    return this.http.get("issuers");
  }

  async getRequests(
    status: CredentialRequestStatus
  ): Promise<CredentialRequestDTO[]> {
    return this.http.get("issuers/requests?status=" + status);
  }

  async requestIssuance(request: CredentialDTO, issuerDid: string) {
    return this.http.post("issuers/request", { request, issuerDid });
  }

  async acceptRequest(requestId: string, daysValid: number) {
    return this.http.post("issuers/request/accept", { requestId, daysValid });
  }

  async rejectRequest(requestId: string) {
    return this.http.post("issuers/request/reject", { requestId });
  }

  async revokeRequest(requestId: string) {
    return this.http.post("issuers/request/revoke", { requestId });
  }
}
