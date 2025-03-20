import { PostVisibility } from "@coredin/shared";

export const visibilityData: { title: string; value: PostVisibility }[] = [
  {
    title: "Visible to everyone",
    value: PostVisibility.PUBLIC
  },
  {
    title: "Visible to your subscribers only",
    value: PostVisibility.PRIVATE
  }
];
