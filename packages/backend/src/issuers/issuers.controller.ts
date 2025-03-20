import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { LoggedIn } from "../authentication/guard";
import { UserService } from "@/user/user.service";
import {
  CredentialDTO,
  CredentialRequestDTO,
  CredentialRequestStatus
} from "@coredin/shared";
import { AuthenticatedRequest } from "@/authentication";
import { TypedBody, TypedQuery } from "@nestia/core";
import { IssuersService } from "./issuers.service";
import { IssuanceRequest } from "./issuance_request.entity";

@Controller("issuers")
@UseGuards(LoggedIn)
export class IssuersController {
  constructor(
    private readonly userService: UserService,
    private readonly issuersService: IssuersService
  ) {}

  @Get()
  async getAll() {
    return this.userService.getIssuers();
  }

  @Post("request")
  async createRequest(
    @Req() req: AuthenticatedRequest,
    @TypedBody()
    { request, issuerDid }: { request: CredentialDTO; issuerDid: string }
  ) {
    return this.issuersService.createRequest(req.wallet, issuerDid, request);
  }

  @Post("request/accept")
  async acceptRequest(
    @Req() req: AuthenticatedRequest,
    @TypedBody()
    { requestId, daysValid }: { requestId: string; daysValid: number }
  ) {
    return this.issuersService.accept(
      req.wallet,
      parseInt(requestId),
      daysValid
    );
  }

  @Post("request/reject")
  async rejectRequest(
    @Req() req: AuthenticatedRequest,
    @TypedBody()
    { requestId }: { requestId: string }
  ) {
    return this.issuersService.reject(req.wallet, parseInt(requestId));
  }

  @Post("request/revoke")
  async revokeRequest(
    @Req() req: AuthenticatedRequest,
    @TypedBody()
    { requestId }: { requestId: string }
  ) {
    return this.issuersService.revoke(req.wallet, parseInt(requestId));
  }

  @Get("requests")
  async getRequests(
    @Req() req: AuthenticatedRequest,
    @TypedQuery() { status }: { status: CredentialRequestStatus }
  ): Promise<CredentialRequestDTO[]> {
    return (await this.issuersService.getRequests(req.wallet, status)).map(
      (req) => this.getCredentialRequestDTO(req)
    );
  }

  private getCredentialRequestDTO(req: IssuanceRequest): CredentialRequestDTO {
    return {
      id: req.id.toString(),
      credential: req.request,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      requester: {
        username: req.user.username,
        avatarUrl: req.user.avatarUrl,
        avatarFallbackColor: req.user.avatarFallbackColor,
        backgroundColor: req.user.backgroundColor,
        bio: req.user.bio
      }
    };
  }
}
