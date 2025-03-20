import { PostDTO } from "./PostDTO";

export type PostDetailDTO = PostDTO & {
  parent?: PostDTO;
  replies: PostDTO[];
};
