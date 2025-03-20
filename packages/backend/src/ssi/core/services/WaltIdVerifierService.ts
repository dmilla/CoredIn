import axios from "axios";
import { CredentialType, CredentialDTO } from "@coredin/shared";

export class WaltIdVerifierService {
  constructor(private readonly verifierApiUrl: string) {}

  async requestPresentation(
    credentialType: CredentialType,
    values: Partial<CredentialDTO>
  ) {
    const response = await axios.post(
      `${this.verifierApiUrl}/openid4vc/verify`,
      this.formatPresentationPayload(credentialType, values),
      {
        headers: {
          responseMode: "direct_post"
        }
      }
    );

    return response.data;
  }

  async getPresentationState(state: string) {
    const response = await axios.get(
      `${this.verifierApiUrl}/openid4vc/session/` + state
    );

    return response.data;
  }

  private formatPresentationPayload(
    credentialType: CredentialType,
    values: Partial<CredentialDTO>
  ) {
    const fields = [
      {
        path: ["$.type"],
        filter: {
          type: "string",
          pattern: credentialType
        }
      },
      ...Object.entries(values).map(([key, value]) => {
        return {
          path: [`$.credentialSubject.${key}`],
          filter: {
            type: "string",
            pattern: value
          }
        };
      })
    ];

    return {
      request_credentials: [{ type: credentialType, format: "jwt_vc_json" }],
      presentation_definition: {
        id: "<automatically assigned>",
        input_descriptors: [
          {
            id: credentialType,
            format: {
              jwt_vc_json: {
                alg: ["EdDSA"]
              }
            },
            constraints: {
              fields
            }
          }
        ]
      }
    };
  }
}
