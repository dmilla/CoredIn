import { ProfileInfo } from "@coredin/shared";

export const prettifyDid = (did: ProfileInfo["did"]) => {
  return did.value.slice(0, 7) + "..." + did.value.slice(-6);
};
