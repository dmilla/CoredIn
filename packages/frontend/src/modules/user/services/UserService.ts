import { HttpService } from "@/services";
import { TipsDTO, UpdateProfileDTO, UserProfile } from "@coredin/shared";

export class UserService {
  constructor(private readonly http: HttpService) {}

  async search(username: string): Promise<UserProfile[]> {
    return this.http.get("user/search?username=" + username);
  }

  async getUser(wallet: string): Promise<UserProfile> {
    return this.http.get("user/profile/" + wallet);
  }

  async getTips(): Promise<TipsDTO> {
    return this.http.get("user/tips");
  }

  async updateTipsSeen(tipIds: number[]): Promise<void> {
    return this.http.put("user/tips", { tipIds });
  }

  async updateProfile(profile: UpdateProfileDTO): Promise<void> {
    return this.http.post("user", profile);
  }

  async deleteCredential(id: string, permanent: boolean): Promise<void> {
    return this.http.delete(`user/credentials/${id}?permanent=${permanent}`);
  }
}
