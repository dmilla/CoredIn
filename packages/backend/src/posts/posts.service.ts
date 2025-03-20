import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Any,
  ArrayContains,
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  Not,
  Repository
} from "typeorm";
import { Post } from "./post.entity";
import {
  CreatePostDTO,
  PostDTO,
  PostDetailDTO,
  PostRequestType,
  PostVisibility
} from "@coredin/shared";
import { User } from "@/user/user.entity";
import { CoredinContractService } from "@/coreum/services";
import { UserService } from "@/user/user.service";
import { Coin } from "@cosmjs/amino";
import { Tip } from "./tips/tip.entity";
import { Filter } from "content-checker";

const PAGE_SIZE = 10;

@Injectable()
export class PostsService {
  private readonly filter: Filter;

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(CoredinContractService)
    private readonly coredinContractService: CoredinContractService
  ) {
    this.filter = new Filter();
  }

  async get(
    id: number,
    creatorWallet: string,
    requesterWallet: string
  ): Promise<PostDetailDTO> {
    let postWithReplies = await this.getWithRelations([
      { id, visibility: PostVisibility.PUBLIC, creatorWallet },
      { id, creatorWallet: requesterWallet }
    ]);

    // If public not found, look for recipient posts
    if (!postWithReplies) {
      const conditions = [
        {
          id,
          visibility: PostVisibility.RECIPIENTS,
          creatorWallet: requesterWallet
        }, // Recipients post created by requester used
        {
          id,
          visibility: PostVisibility.RECIPIENTS,
          recipientWallets: ArrayContains([requesterWallet]) // Recipients post where requester is recipient
        }
      ];
      postWithReplies = await this.getWithRelations(conditions);
    }

    // If still not found, look for private post if requester is subscriber
    if (!postWithReplies) {
      const isSubscribed = await this.coredinContractService.isWalletSubscribed(
        creatorWallet,
        requesterWallet
      );
      if (isSubscribed) {
        postWithReplies = await this.getWithRelations([
          {
            id,
            visibility: PostVisibility.PRIVATE,
            creatorWallet
          }
        ]);
      }
    }

    if (!postWithReplies) {
      throw new NotFoundException("Post not found");
    }

    const recipients =
      postWithReplies.recipientWallets.length > 0
        ? await this.userService.getPublicProfileList(
            postWithReplies.recipientWallets
          )
        : [];

    if (postWithReplies.unreadByWallets.includes(requesterWallet)) {
      await this.postRepository.update(
        { id: postWithReplies.id },
        {
          unreadByWallets: () =>
            `array_remove("unreadByWallets", '${requesterWallet}')`
        }
      );
    }

    return {
      ...this.fromDb(postWithReplies),
      parent: postWithReplies.parent
        ? this.fromDb(postWithReplies.parent)
        : undefined,
      // TODO - sort by createdAt in query, it requires using QueryBuilder
      replies: postWithReplies.replies
        .filter((reply) => !reply.hiddenAt) // TODO - find a way to add SQL to filter out hidden posts
        .map((reply) => this.fromDb(reply))
        .sort(
          (a, b) => b.tips - a.tips || a.createdAt.localeCompare(b.createdAt)
        ),
      recipients
    };
  }

  async getPublicAndSubscribedFeed(
    requesterWallet: string,
    page: number
  ): Promise<PostDTO[]> {
    return this.getFeedWithBoostedPosts(requesterWallet, page, [
      {
        visibility: PostVisibility.PUBLIC,
        replyToPostId: IsNull()
      },
      {
        creatorWallet: Any([
          ...(await this.getSubscribedWallets(requesterWallet)),
          requesterWallet
        ]),
        visibility: PostVisibility.PRIVATE,
        replyToPostId: IsNull()
      }
    ]);
  }

  async getUserPosts(
    creatorWallet: string,
    requesterWallet: string
  ): Promise<PostDTO[]> {
    if (creatorWallet === requesterWallet) {
      return this.getAllUserPosts(creatorWallet);
    }
    const isSubscribed = await this.coredinContractService.isWalletSubscribed(
      creatorWallet,
      requesterWallet
    );
    if (isSubscribed) {
      return this.getAllUserPosts(creatorWallet);
    }

    return this.getPublicUserPosts(creatorWallet);
  }

  async getPublicUserPosts(creatorWallet: string): Promise<PostDTO[]> {
    return this.getFeedWithBoostedPosts(creatorWallet, 1, [
      {
        visibility: PostVisibility.PUBLIC,
        creatorWallet,
        replyToPostId: IsNull()
      }
    ]);
  }

  private async getAllUserPosts(creatorWallet: string): Promise<PostDTO[]> {
    return this.getFeedWithBoostedPosts(creatorWallet, 1, [
      {
        creatorWallet,
        replyToPostId: IsNull(),
        visibility: Not(PostVisibility.RECIPIENTS)
      }
    ]);
  }

  async getPostsWithRecipients(requesterWallet: string): Promise<PostDTO[]> {
    const posts = await this.postRepository.find({
      relations: ["user"],
      where: [
        {
          creatorWallet: requesterWallet,
          replyToPostId: IsNull(),
          hiddenAt: IsNull(),
          visibility: PostVisibility.RECIPIENTS
        },
        {
          replyToPostId: IsNull(),
          hiddenAt: IsNull(),
          visibility: PostVisibility.RECIPIENTS,
          recipientWallets: ArrayContains([requesterWallet])
        }
      ],
      // messages should ignore the feed score ordering
      order: { lastReplyDate: "DESC", createdAt: "DESC" }
    });

    const recipients = await this.userService.getPublicProfileList(
      posts.map((post) => post.recipientWallets).flat()
    );

    return posts.map((post) => {
      return {
        ...this.fromDb(post, requesterWallet),
        recipients: recipients.filter((recipient) =>
          post.recipientWallets.includes(recipient.wallet)
        )
      };
    });
  }

  async getJobsFor(requesterWallet: string): Promise<PostDTO[]> {
    return this.getFeedWithBoostedPosts(requesterWallet, 1, [
      {
        requestType: PostRequestType.JOB
      }
    ]);
  }
  private async getFeedWithBoostedPosts(
    requesterWallet: string,
    page: number,
    whereConditions: FindOptionsWhere<Post>[]
  ): Promise<PostDTO[]> {
    const now = new Date();

    // Fetch boosted posts only for the first page
    let boostedPosts: Post[] = [];
    if (page === 1) {
      boostedPosts = await this.postRepository.find({
        relations: ["user"],
        where: whereConditions.map((condition) => ({
          ...condition,
          boostedUntil: MoreThan(now),
          hiddenAt: IsNull()
        })),
        order: {
          boostedUntil: "DESC",
          createdAt: "DESC"
        }
      });
    }

    // Calculate how many unboosted posts we need
    const unboostedPostsNeeded = PAGE_SIZE - boostedPosts.length;

    // Fetch unboosted posts
    const offset = (page - 1) * PAGE_SIZE;
    const unboostedPosts = await this.postRepository.find({
      relations: ["user"],
      where: whereConditions.map((condition) => ({
        ...condition,
        boostedUntil: LessThanOrEqual(now),
        hiddenAt: IsNull()
      })),
      order: {
        createdAt: "DESC"
      },
      take: unboostedPostsNeeded,
      skip: offset
    });

    // Combine boosted and unboosted posts
    const allPosts = [...boostedPosts, ...unboostedPosts];

    return allPosts.map((post) => this.fromDb(post, requesterWallet));
  }

  private async getSubscribedWallets(
    requesterWallet: string
  ): Promise<string[]> {
    const allSubscriptions =
      await this.coredinContractService.getAllSubscriptions(requesterWallet);
    return allSubscriptions.map(
      (subscription) => subscription.subscribed_to_wallet
    );
  }

  async create(requesterWallet: string, createDTO: CreatePostDTO) {
    const data = { ...createDTO, text: this.filter.clean(createDTO.text) };
    let parentPost: Post | undefined;
    if (data.replyToPostId) {
      parentPost = await this.validateReplyAndGetParentPost(
        data.replyToPostId,
        requesterWallet
      );
    }

    if (data.recipientWallets && data.recipientWallets.length > 0) {
      if (data.visibility !== PostVisibility.RECIPIENTS || data.replyToPostId) {
        throw new BadRequestException(
          "Recipients can only be set for recipient visibility posts"
        );
      }

      const allSubscriptions = (
        await this.coredinContractService.getAllSubscriptions(requesterWallet)
      ).map((subscription) => subscription.subscribed_to_wallet);
      const invalidRecipients = data.recipientWallets.filter(
        (recipient) => !allSubscriptions.includes(recipient)
      );
      if (invalidRecipients.length > 0) {
        throw new BadRequestException(
          `Only subscribed profiles can be recipients, invalid profile found: ${invalidRecipients.join(", ")}`
        );
      }
    }

    if (
      data.visibility === PostVisibility.RECIPIENTS &&
      (!data.recipientWallets || data.recipientWallets.length === 0)
    ) {
      throw new BadRequestException(
        "Recipients must be set for recipient visibility posts"
      );
    }

    if (data.replyToPostId && parentPost) {
      await this.postRepository.update(
        { id: data.replyToPostId },
        {
          unreadByWallets: [
            ...parentPost.recipientWallets,
            parentPost.creatorWallet
          ].filter((wallet) => wallet !== requesterWallet),
          lastReplyDate: new Date()
        }
      );
    }

    return await this.postRepository.insert({
      boostedUntil: new Date(), // set to now() for proper sorting, won't make the post boosted initially
      creatorWallet: requesterWallet,
      createdAt: new Date(),
      lastReplyDate: new Date(),
      unreadByWallets: data.recipientWallets,
      ...data
    });
  }

  async delete(wallet: string, postId: number) {
    const post = await this.postRepository.findOne({
      where: {
        creatorWallet: wallet,
        id: postId
      }
    });
    if (!post) {
      throw new BadRequestException("Post not found");
    }
    return await this.postRepository.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Tip, {
          postId
        });
        await transactionalEntityManager.delete(Post, {
          creatorWallet: wallet,
          id: postId
        });
      }
    );
  }

  async updateLikedPost(wallet: string, postId: number, liked: boolean) {
    return await this.postRepository.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const alreadyLiked = await transactionalEntityManager.findOne(User, {
          where: {
            wallet,
            likedPosts: ArrayContains([postId])
          }
        });
        if ((alreadyLiked && liked) || (!alreadyLiked && !liked)) {
          return;
        }
        await transactionalEntityManager.update(
          User,
          { wallet },
          {
            likedPosts: liked
              ? () => `array_append("likedPosts", ${postId})`
              : () => `array_remove("likedPosts", ${postId})`
          }
        );
        await transactionalEntityManager.update(
          Post,
          { id: postId },
          {
            likes: liked ? () => "likes + 1" : () => "likes - 1"
          }
        );
      }
    );
  }
  async updateTip(
    postId: number,
    tipperWallet: string,
    tip: Coin,
    txHash: string
  ) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found");
    }

    const contractTipsString = await this.coredinContractService.getPostTips(
      post.id
    );
    const contractTips = Number(contractTipsString);
    const currentDBTips = post.totalTipsAmount;
    const tipDiff = contractTips - currentDBTips;

    // Convert microCORE to CORE and then to minutes
    // Assume 1 CORE = 1 minute of boost
    const timeToBoostInMinutes = tipDiff / 1000000.0;
    console.log("tipDiff", tipDiff);
    console.log("timeToBoostInMinutes", timeToBoostInMinutes);

    const now = new Date();
    const boostedUntil =
      post.boostedUntil && new Date(post.boostedUntil) > now
        ? new Date(post.boostedUntil)
        : now;
    const newBoostedUntil = new Date(
      boostedUntil.getTime() + timeToBoostInMinutes * 60000.0
    );
    console.log("boostedUntil", boostedUntil);
    console.log("newBoostedUntil", newBoostedUntil);
    return await this.postRepository.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          Post,
          { id: postId },
          {
            totalTipsAmount: contractTips,
            boostedUntil: newBoostedUntil
          }
        );
        await transactionalEntityManager.save(Tip, {
          tipperWallet,
          postId,
          amount: tip.amount,
          denom: tip.denom,
          receiverWallet: post.creatorWallet,
          txHash,
          createdAt: new Date(),
          isViewed: post.creatorWallet === tipperWallet
        });
      }
    );
  }

  // IMPORTANT: only allow moderators to hide posts (feature flag in controller currently)
  async hide(postId: number) {
    return await this.postRepository.update(
      { id: postId, hiddenAt: IsNull() },
      {
        hiddenAt: () => "now()"
      }
    );
  }

  private async getWithRelations(conditions: FindOptionsWhere<Post>[]) {
    const where = conditions.map((condition) => ({
      ...condition,
      hiddenAt: IsNull()
    }));
    return await this.postRepository.findOne({
      relations: ["user", "parent", "parent.user", "replies", "replies.user"],
      where,
      order: { createdAt: "DESC" }
    });
  }
  private fromDb(post: Post, requesterWallet?: string): PostDTO {
    return {
      id: post.id,
      creatorWallet: post.creatorWallet,
      creatorUsername: post.user.username,
      creatorAvatar: post.user.avatarUrl,
      tips: post.totalTipsAmount,
      creatorAvatarFallbackColor: post.user.avatarFallbackColor,
      visibility: post.visibility,
      text: post.text,
      createdAt: post.createdAt.toISOString(),
      lastReplyDate: post.lastReplyDate?.toISOString(),
      likes: post.likes,
      skillTags: post.skillTags,
      replyToPostId: post.replyToPostId,
      requestType: post.requestType,
      requestExpiration: post.requestExpiration,
      unread: requesterWallet
        ? post.unreadByWallets.includes(requesterWallet)
        : undefined,
      boostedUntil: post.boostedUntil ?? post.createdAt
    };
  }

  private async validateReplyAndGetParentPost(
    parentPostId: number,
    requesterWallet: string
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        id: parentPostId
      }
    });
    if (!post) {
      console.error("Parent post not found", parentPostId, requesterWallet);
      throw new BadRequestException("Post not found");
    }

    // Private posts can only be replied to by the creator or subscribers
    if (
      post.visibility === PostVisibility.PRIVATE &&
      post.creatorWallet !== requesterWallet
    ) {
      const isSubscribed = await this.coredinContractService.isWalletSubscribed(
        post.creatorWallet,
        requesterWallet
      );
      if (!isSubscribed) {
        console.error(
          "Trying to post a reply to a private non subscribed profile",
          parentPostId,
          requesterWallet
        );

        throw new BadRequestException("Post not found");
      }
    }

    // Recipients posts can only be replied to by the creator or recipients
    if (
      post.visibility === PostVisibility.RECIPIENTS &&
      post.creatorWallet !== requesterWallet &&
      !post.recipientWallets.includes(requesterWallet)
    ) {
      console.error(
        "Trying to post a reply to a post where requester is not a recipient",
        parentPostId,
        requesterWallet
      );
      if (!post.recipientWallets.includes(requesterWallet)) {
        throw new BadRequestException("Post not found");
      }
    }

    // Only creators that are still subscribed to a given profile can reply to their posts
    if (
      post.visibility === PostVisibility.RECIPIENTS &&
      post.creatorWallet === requesterWallet
    ) {
      for (const recipient of post.recipientWallets) {
        const isSubscribed =
          await this.coredinContractService.isWalletSubscribed(
            recipient,
            requesterWallet
          );
        if (!isSubscribed) {
          console.error(
            "Trying to post a reply to a recipients posts by the creator which is no longer subscribed",
            parentPostId,
            post.recipientWallets,
            requesterWallet
          );

          throw new BadRequestException("Post not found");
        }
      }
    }

    return post;
  }

  // // Function to calculate the current score, including base score and decaying factor
  // calculateScore(
  //   totalTipAmount: number,
  //   lastTipTime: Date | null,  // Could be null if no tips
  //   creationTime: Date,        // Scriptohost's Date class
  //   lastComputedTime: Date,    // Last time the score was updated
  //   alpha: number = 0.1,       // tip amount weight
  //   beta: number = 1.0,        // last tip timestamp weight
  //   gamma: number = 2.0,       // creation timestamp weight
  //   decayConstant: number = 0.001  // Lambda decay constant
  // ): number {
  //   const now = new Date();

  //   // Calculate hours since last tip (if there's no tip, set the contribution to 0)
  //   let hoursSinceLastTip = 0;
  //   if (lastTipTime) {
  //     const timeDiffMillis = now.getTime() - lastTipTime.getTime();
  //     hoursSinceLastTip = timeDiffMillis / (1000 * 60 * 60);  // Convert milliseconds to hours
  //   }

  //   // Calculate hours since creation
  //   const creationTimeDiffMillis = now.getTime() - creationTime.getTime();
  //   const hoursSinceCreation = creationTimeDiffMillis / (1000 * 60 * 60);  // Convert milliseconds to hours

  //   // Calculate the base score:
  //   const tipScore = Math.log(1 + totalTipAmount);
  //   const recencyLastTipScore = lastTipTime ? (1 / (1 + hoursSinceLastTip)) : 0;
  //   const recencyCreationScore = 1 / (1 + hoursSinceCreation);

  //   // Combine components into the base score
  //   const baseScore = alpha * tipScore + beta * recencyLastTipScore + gamma * recencyCreationScore;

  //   // Apply the decaying factor based on the last computed time
  //   const timeDiffMillis = now.getTime() - lastComputedTime.getTime();
  //   const hoursSinceLastUpdate = timeDiffMillis / (1000 * 60 * 60);  // Convert to hours

  //   // Apply the exponential decay to the base score
  //   const decayingScore = baseScore * Math.exp(-decayConstant * hoursSinceLastUpdate);

  //   return decayingScore;
  // }

  // TODO - remove this before deploying to production!
  // async clearAllBoosts(wallet: string): Promise<void> {
  //   const posts = await this.postRepository.find();
  //   for (const post of posts) {
  //     post.boostedUntil = post.createdAt;
  //     await this.postRepository.save(post);
  //   }
  // }
}
