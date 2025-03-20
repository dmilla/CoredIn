import { CredentialDTO } from "@coredin/shared";
import { keccak256 } from "@ethersproject/keccak256";
import { MerkleTree } from "merkletreejs";

export const generateTree = (rawVCs: CredentialDTO[]) => {
  const leaves = rawVCs.map((vc) => {
    return keccak256(Buffer.from(JSON.stringify(vc), "utf8"));
  });

  return new MerkleTree(leaves, keccak256, { sort: true });
};
