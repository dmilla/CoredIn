import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { IssuanceRequest } from "./issuance_request.entity";
import { CredentialDTO, CredentialRequestStatus } from "@coredin/shared";
import { WaltIdIssuerService, WaltIdWalletService } from "@/ssi/core/services";
import { CoredinContractService } from "@/coreum/services";

@Injectable()
export class IssuersService {
  constructor(
    @InjectRepository(IssuanceRequest)
    private readonly requestsRepo: Repository<IssuanceRequest>,
    @Inject(CoredinContractService)
    private readonly coredinContract: CoredinContractService,
    @Inject(WaltIdWalletService)
    private readonly waltIdWalletService: WaltIdWalletService,
    @Inject(WaltIdIssuerService)
    private readonly waltIdIssuerService: WaltIdIssuerService
  ) { }

  async createRequest(
    requesterWallet: string,
    requestedIssuerDid: string,
    request: CredentialDTO
  ): Promise<boolean> {
    const contractRequesterInfo =
      await this.coredinContract.getWalletInfo(requesterWallet);
    if (!contractRequesterInfo.did_info) {
      console.error(
        "Unable to create issuance request: requester DID not found onchain..",
        requesterWallet
      );
      return false;
    }
    const res = await this.requestsRepo.insert({
      requesterWallet,
      requesterDid: contractRequesterInfo.did_info?.did.value,
      requestedIssuerDid,
      request,
      createdAt: new Date(),
      status: CredentialRequestStatus.PENDING
    });

    return res.identifiers.length === 1;
  }

  async getRequests(issuerWallet: string, status: CredentialRequestStatus) {
    return this.requestsRepo.find({
      relations: ["user"],
      where: { status, issuer: { wallet: issuerWallet } },
      order: { createdAt: "DESC" }
    });
  }

  async accept(
    issuerWallet: string,
    requestId: number,
    daysValid: number
  ): Promise<boolean> {
    const request = await this.requestsRepo.findOne({
      relations: ["issuer"],
      where: {
        id: requestId,
        issuer: { wallet: issuerWallet },
        status: CredentialRequestStatus.PENDING
      }
    });

    if (!request) {
      console.error(
        "Request not found while accepting.. ",
        issuerWallet,
        requestId
      );
      return false;
    }

    const issuedCredentialId = await this.issueCredential(request, daysValid);
    if (issuedCredentialId.length === 0) {
      return false;
    }

    const updateResult = await this.requestsRepo.update(
      {
        id: requestId
      },
      {
        status: CredentialRequestStatus.ACCEPTED,
        issuedCredentialId
      }
    );

    return updateResult.affected === 1;
  }

  async reject(issuerWallet: string, requestId: number) {
    const request = await this.requestsRepo.findOne({
      relations: ["issuer"],
      where: {
        id: requestId,
        issuer: { wallet: issuerWallet },
        status: CredentialRequestStatus.PENDING
      }
    });

    if (!request) {
      console.error(
        "Request not found while rejecting.. ",
        issuerWallet,
        requestId
      );
      return false;
    }

    return this.requestsRepo.update(
      {
        id: requestId
      },
      { status: CredentialRequestStatus.REJECTED }
    );
  }

  async revoke(issuerWallet: string, requestId: number): Promise<boolean> {
    const request = await this.requestsRepo.findOne({
      relations: ["issuer"],
      where: {
        id: requestId,
        issuer: { wallet: issuerWallet },
        status: CredentialRequestStatus.ACCEPTED,
        issuedCredentialId: Not(IsNull())
      }
    });

    if (!request) {
      console.error(
        "Request not found while revoking.. ",
        issuerWallet,
        requestId
      );
      return false;
    }

    const res = await this.waltIdWalletService.deleteCredential(
      request.requesterWallet,
      request.issuedCredentialId,
      true
    );
    console.log("Revoking response...", res);

    const updateResult = await this.requestsRepo.update(
      {
        id: requestId,
        issuer: { wallet: issuerWallet },
        status: CredentialRequestStatus.ACCEPTED
      },
      { status: CredentialRequestStatus.REVOKED }
    );

    return updateResult.affected === 1;
  }

  private async issueCredential(
    request: IssuanceRequest,
    daysValid: number
  ): Promise<string> {
    const offer = await this.waltIdIssuerService.getCredentialOfferUrl(
      request.requesterDid,
      request.request,
      // This is a test key and issuer DID for dev purposes.. not to be used in prod!
      {
        issuerKeyVaultId: request.issuer.issuerKeyId,
        issuerDid: request.issuer.issuerDid
      },
      daysValid
    );
    console.log("offer", offer);
    const res = await this.waltIdWalletService.useOfferRequest(
      request.requesterWallet,
      request.requesterDid,
      offer
    );
    console.log("res", res);

    if (res.length === 0) {
      console.error(
        "No response from wallet while issuing credential.. ",
        request.id,
        offer
      );

      return "";
    }

    return res[0].id;
  }
}
