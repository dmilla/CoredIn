import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Any, ILike, In, IsNull, Not, Repository } from "typeorm";
import { User } from "./user.entity";
import {
  NotFoundError,
  UserProfile,
  UpdateProfileDTO,
  CredentialDTO,
  TipDTO,
  TipsDTO
} from "@coredin/shared";
import { Effect } from "effect";
import { WaltIdIssuerService, WaltIdWalletService } from "../ssi/core/services";
import { CoredinContractService } from "@/coreum/services";
// import { MerkleTree } from "merkletreejs";
// import { keccak256 } from "@ethersproject/keccak256";
import { VerifiableCredential } from "@/ssi/core/data-classes";
import { Tip } from "@/posts/tips/tip.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
    @Inject(WaltIdWalletService)
    private readonly walletService: WaltIdWalletService,
    @Inject(WaltIdIssuerService)
    private readonly issuerService: WaltIdIssuerService,
    @Inject(CoredinContractService)
    private readonly coredinContractService: CoredinContractService
  ) {}

  async getPublicOrPrivate(
    requesterWallet: string,
    wallet: string
  ): Promise<Effect.Effect<UserProfile, NotFoundError>> {
    console.log("get user", requesterWallet, wallet);
    if (requesterWallet === wallet) {
      return this.getPrivate(wallet);
    }
    if (
      await this.coredinContractService.isWalletSubscribed(
        wallet,
        requesterWallet
      )
    ) {
      return this.getPrivate(wallet);
    }
    return this.getPublic(wallet);
  }

  async getPublic(
    wallet: string
  ): Promise<Effect.Effect<UserProfile, NotFoundError>> {
    const user = await this.userRepository.findOne({
      where: { wallet }
    });
    if (user) {
      return Effect.succeed(this.adaptforPublicVisibililty(user));
    }

    return Effect.fail(new NotFoundError());
  }

  async getPublicProfileList(wallets: string[]): Promise<UserProfile[]> {
    const users = await this.userRepository.find({
      where: { wallet: In(wallets) }
    });
    return users.map((user) => this.adaptforPublicVisibililty(user));
  }

  async getPrivate(
    wallet: string
  ): Promise<Effect.Effect<UserProfile, NotFoundError>> {
    const user = await this.userRepository.findOne({
      where: { wallet }
    });
    if (user) {
      let didKeyId = user.didKeyId;
      if (!user.didKeyId) {
        const generateDidKeyResult =
          await this.walletService.generateKey(wallet);
        console.log(
          "Generated DID key for wallet,",
          wallet,
          generateDidKeyResult
        );
        didKeyId = generateDidKeyResult;
        await this.userRepository.update({ wallet }, { didKeyId });
      }
      // Get DID
      const did = await this.walletService.getOrCreateDid(wallet, didKeyId);
      const credentials = await this.adaptCredentials(
        await this.walletService.getVCs(wallet)
      );
      return Effect.succeed({
        wallet: user.wallet,
        username: user.username || "",
        did: { value: did!.did },
        likedPosts: user.likedPosts,
        skillTags: user.skillTags,
        avatarUrl: user.avatarUrl,
        avatarFallbackColor: user.avatarFallbackColor,
        backgroundColor: user.backgroundColor,
        bio: user.bio,
        issuerDid: user.issuerDid,
        credentials: credentials
        // credentialsMerkleRoot: this.genereateMerkleTree(
        //   credentials.filter((c) => c.verified)
        // )
      });
    }

    return Effect.fail(new NotFoundError());
  }

  async getTips(wallet: string): Promise<TipsDTO> {
    console.log("getting tips..", wallet);
    const allTips = await this.tipRepository.find({
      where: [{ tipperWallet: wallet }, { receiverWallet: wallet }],
      relations: ["tipper", "receiver"],
      order: { createdAt: "DESC" }
    });

    return {
      sentTips: allTips
        .filter((tip) => tip.tipperWallet === wallet)
        .map(this.adaptTip),
      receivedTips: allTips
        .filter((tip) => tip.receiverWallet === wallet)
        .map(this.adaptTip)
    };
  }

  async updateTipsSeen(wallet: string, tipIds: number[]) {
    await this.tipRepository.update(
      {
        receiverWallet: wallet,
        id: Any(tipIds),
        isViewed: false
      },
      { isViewed: true }
    );
  }

  async updateLastSeen(wallet: string) {
    return this.userRepository.upsert({ wallet, lastSeen: new Date() }, [
      "wallet"
    ]);
  }

  async updateProfile(wallet: string, profile: UpdateProfileDTO) {
    const onchainProfile =
      await this.coredinContractService.getWalletInfo(wallet);

    return this.userRepository.update(
      { wallet },
      { ...profile, username: onchainProfile.did_info?.username }
    );
  }

  async grantIssuerDid(wallet: string) {
    const user = await this.userRepository.findOne({
      where: { wallet }
    });
    if (!user) {
      console.error("User not found white trying to grand issuerDid!", wallet);
      throw new NotFoundException("User not found");
    }
    if (user.issuerDid) {
      console.error("User already has an issuerDid! ", wallet);
      return false;
    }
    const issuerData = await this.issuerService.onboardIssuer(wallet);
    const updateResult = await this.userRepository.update(
      { wallet },
      { issuerDid: issuerData.issuerDid, issuerKeyId: issuerData.issuerKey.id }
    );

    return updateResult.affected === 1;
  }

  async getIssuers() {
    const issuers = await this.userRepository.find({
      where: { issuerDid: Not(IsNull()) }
    });

    return issuers.map((issuer) => this.adaptforPublicVisibililty(issuer));
  }

  async searchUsers(username: string) {
    const users = await this.userRepository.find({
      where: { username: ILike(`%${username}%`) },
      take: 10
    });

    return users.map((users) => this.adaptforPublicVisibililty(users));
  }

  private async adaptCredentials(
    rawVCs: VerifiableCredential[]
  ): Promise<CredentialDTO[]> {
    const issuerDids = rawVCs.map((vc) => vc.parsedDocument.issuer.id);
    const issuers = await this.userRepository.find({
      where: { issuerDid: In(issuerDids) }
    });
    return rawVCs.map((vc) => ({
      id: vc.id,
      subjectDid: vc.parsedDocument.credentialSubject.id,
      type: vc.parsedDocument.type[1],
      issuer: vc.parsedDocument.issuer.id,
      issuerWallet:
        issuers.find((user) => user.issuerDid === vc.parsedDocument.issuer.id)
          ?.wallet || "",
      issuerUsername:
        issuers.find((user) => user.issuerDid === vc.parsedDocument.issuer.id)
          ?.username || "",
      title: vc.parsedDocument.credentialSubject.title,
      establishment: vc.parsedDocument.credentialSubject.establishment,
      startDate: vc.parsedDocument.credentialSubject.startDate,
      endDate: vc.parsedDocument.credentialSubject.endDate,
      verified: true
    }));
  }

  private adaptforPublicVisibililty(user: User): UserProfile {
    return {
      wallet: user.wallet,
      username: user.username || "",
      did: undefined,
      likedPosts: [],
      skillTags: user.skillTags,
      avatarUrl: user.avatarUrl,
      avatarFallbackColor: user.avatarFallbackColor,
      backgroundColor: user.backgroundColor,
      bio: user.bio,
      issuerDid: user.issuerDid,
      credentials: []
    };
  }

  private adaptTip(tip: Tip): TipDTO {
    return {
      id: tip.id,
      postId: tip.postId,
      tipperWallet: tip.tipperWallet,
      tipperAvatar: tip.tipper.avatarUrl,
      tipperUsername: tip.tipper.username,
      tipperAvatarFallbackColor: tip.tipper.avatarFallbackColor,
      receiverWallet: tip.receiverWallet,
      receiverUsername: tip.receiver.username,
      receiverAvatar: tip.receiver.avatarUrl,
      receiverAvatarFallbackColor: tip.receiver.avatarFallbackColor,
      createdAt: tip.createdAt.toISOString(),
      amount: tip.amount,
      denom: tip.denom,
      isViewed: tip.isViewed
    };
  }

  // private genereateMerkleTree(rawVCs: CredentialDTO[]) {
  //   const leaves = rawVCs.map((vc) => {
  //     return keccak256(Buffer.from(JSON.stringify(vc), "utf8"));
  //   });

  //   // const leaves = ["a", "b", "c"].map((vc) => {
  //   //   return keccak256(vc);
  //   // });

  //   const tree = new MerkleTree(leaves, keccak256, { sort: true });
  //   const root = tree.getHexRoot().substring(2); // remove 0x since not needed for WASM contract

  //   // const leaf = leaves[0];
  //   // console.log(leaf);
  //   // const proof = tree.getHexProof(leaf); // .map((p) => p.substring(2));
  //   // const proof = [
  //   //   { position: "right", data: Buffer.from("proof1") },
  //   //   { position: "right", data: Buffer.from("proof2") }
  //   // ];
  //   // console.log("root", root, "leaf", leaf, "proof", proof);
  //   // console.log("verify", tree.verify(proof .map((p) => p.substring(2)), leaf, root.substring(2)));
  //   return root;
  // }
}
