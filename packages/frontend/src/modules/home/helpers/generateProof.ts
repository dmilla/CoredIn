import { CredentialDTO } from "@coredin/shared";
import { keccak256 } from "@ethersproject/keccak256";
import { MerkleTree } from "merkletreejs";

export const generateProof = (vc: CredentialDTO, tree: MerkleTree) => {
  const leaf = keccak256(Buffer.from(JSON.stringify(vc), "utf8")).substring(2);
  const proof = tree.getHexProof(leaf).map((p) => p.substring(2));

  return { leaf, proof };
};
