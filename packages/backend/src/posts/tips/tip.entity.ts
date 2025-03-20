import { User } from "../../user/user.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Post } from "../post.entity";

@Entity("tips")
export class Tip {
  constructor(
    id: number,
    tipperWallet: string,
    receiverWallet: string,
    postId: number,
    amount: string,
    denom: string,
    txHash: string,
    isViewed: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.tipperWallet = tipperWallet;
    this.receiverWallet = receiverWallet;
    this.postId = postId;
    this.amount = amount;
    this.denom = denom;
    this.txHash = txHash;
    this.isViewed = isViewed;
    this.createdAt = createdAt;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  tipperWallet: string;

  @Column()
  @Index()
  receiverWallet: string;

  @Column()
  @Index()
  postId: number;

  @Column()
  amount: string;

  @Column()
  denom: string;

  @Column()
  txHash: string;

  @Column({ default: false })
  @Index()
  isViewed: boolean;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentTips)
  @JoinColumn({ name: "tipperWallet", referencedColumnName: "wallet" })
  tipper: User;

  @ManyToOne(() => User, (user) => user.receivedTips)
  @JoinColumn({ name: "receiverWallet", referencedColumnName: "wallet" })
  receiver: User;

  @ManyToOne(() => Post, (post) => post.tips)
  @JoinColumn({ name: "postId" })
  post: Post;
}
