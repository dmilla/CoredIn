import { FEATURE_FLAG } from "@coredin/shared";
import axios from "axios";

export class FeatureFlagService {
  constructor(private readonly baseApiUrl: string) {}

  async getFlag(flag: FEATURE_FLAG, wallet?: string): Promise<boolean> {
    const walletParam = wallet ? `&wallet=${wallet}` : "";
    return axios
      .get(this.baseApiUrl + `feature-flags?flag=${flag}` + walletParam)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error("Unable to get feature flag", error);
        return false;
      });
  }
}
