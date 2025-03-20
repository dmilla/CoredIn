import { CredentialDTO } from "@coredin/shared";
import axios from "axios";

export type IssuerInfo = {
  issuerDid: string;
  issuerKeyVaultId: string;
};

export class WaltIdIssuerService {
  constructor(
    private readonly issuerApiUrl: string,
    private readonly vaultUrl: string,
    private readonly vaultRoleId: string,
    private readonly vaultSecretId: string
  ) {}

  async onboardIssuer(wallet: string) {
    const createIssuerKeyResult = await axios.post(
      `${this.issuerApiUrl}/onboard/issuer`,
      {
        key: {
          backend: "tse",
          keyType: "Ed25519",
          config: {
            server: this.vaultUrl + "/v1/transit",
            auth: {
              roleId: this.vaultRoleId,
              secretId: this.vaultSecretId
            }
          }
        },
        did: {
          method: "key"
        }
      }
    );
    // console.log("Onboarded issuer for wallet,", wallet);

    return createIssuerKeyResult.data;
  }

  async getCredentialOfferUrl(
    subjectDid: string,
    data: CredentialDTO,
    issuerInfo: IssuerInfo,
    daysValid: number
  ) {
    const payload = this.generateCredentialPayload(
      subjectDid,
      data,
      issuerInfo,
      daysValid
    );
    // console.log("generated payload", payload);
    const createCredentialOfferResult = await axios.post(
      `${this.issuerApiUrl}/openid4vc/jwt/issue`,
      payload,
      {
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json"
        }
      }
    );

    // console.log(
    //   "createCredentialOfferResult data",
    //   createCredentialOfferResult.data
    // );

    // throw new Error();

    return createCredentialOfferResult.data;
  }

  private generateCredentialPayload(
    subjectDid: string,
    data: CredentialDTO,
    issuerInfo: IssuerInfo,
    daysValid: number
  ): string {
    return JSON.stringify({
      issuerKey: {
        type: "tse",
        server: this.vaultUrl + "/v1/transit",
        auth: {
          roleId: this.vaultRoleId,
          secretId: this.vaultSecretId
        },
        id: issuerInfo.issuerKeyVaultId
      },
      authenticationMethod: "PRE_AUTHORIZED",
      issuerDid: issuerInfo.issuerDid,
      credentialConfigurationId: data.type + "_jwt_vc_json",
      credentialData: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        type: ["VerifiableCredential", data.type],
        issuer: {
          id: issuerInfo.issuerDid
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: subjectDid,
          title: data.title,
          establishment: data.establishment,
          startDate: data.startDate,
          endDate: data.endDate
        }
      },
      mapping: {
        id: "<uuid>",
        issuer: {
          id: "<issuerDid>"
        },
        credentialSubject: {
          id: "<subjectDid>"
        },
        issuanceDate: "<timestamp>",
        expirationDate: `<timestamp-in:${daysValid}d>`
      }
    });
  }
}
