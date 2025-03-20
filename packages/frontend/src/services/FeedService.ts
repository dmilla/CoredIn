import { HttpService } from "@/services";
import { CreatePostDTO, PostDTO, PostDetailDTO } from "@coredin/shared";
import { Coin } from "@cosmjs/amino";

export class FeedService {
  constructor(private readonly http: HttpService) {}

  async get(id: number, creator: string): Promise<PostDetailDTO> {
    return this.http.get("posts/" + id + "?creator=" + creator);
  }

  async getFeed(page: number): Promise<PostDTO[]> {
    return this.http.get("posts?page=" + page);
  }

  async getMessageFeed(): Promise<PostDTO[]> {
    return this.http.get("posts/messages");
  }

  async getUserFeed(user: string): Promise<PostDTO[]> {
    return this.http.get("posts/user/" + user);
  }

  async publish(createDTO: CreatePostDTO): Promise<void> {
    return this.http.post("posts", createDTO);
  }

  async likePost(postId: number, liked: boolean): Promise<void> {
    return this.http.post("posts/" + postId + `/like`, { liked });
  }

  async deletePost(postId: number): Promise<void> {
    return this.http.delete("posts/" + postId);
  }

  async hidePost(postId: number): Promise<void> {
    return this.http.post("posts/" + postId + `/hide`, {});
  }

  async tipPost(postId: number, tip: Coin, txHash: string): Promise<void> {
    return this.http.post("posts/" + postId + `/tip`, { tip, txHash });
  }

  async clearBoosts(): Promise<void> {
    return this.http.post("posts/clear-boosts", {});
  }
}
