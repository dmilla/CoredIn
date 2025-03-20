import axios from "axios";

export class AuthService {
  constructor(private readonly baseApiUrl: string) {}

  async authenticate(
    walletAddress: string,
    pubKey: string,
    signature: string,
    expiration: number
  ): Promise<string> {
    return axios
      .post(this.baseApiUrl + "authentication/login/", {
        walletAddress,
        pubKey,
        signature,
        expiration
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error("Unable to authenticate", error);
        throw error;
      });
  }
}
