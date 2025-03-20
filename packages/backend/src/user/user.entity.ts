import { Tip } from "../posts/tips/tip.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
  OneToMany
} from "typeorm";

@Entity("users")
export class User {
  constructor(
    id: number,
    wallet: string,
    username: string,
    didKeyId: string,
    issuerDid: string,
    issuerKeyId: string,
    lastSeen: Date,
    likedPosts: number[],
    avatarUrl: string,
    backgroundColor: string,
    avatarFallbackColor: string,
    bio: string
  ) {
    this.id = id;
    this.wallet = wallet;
    this.username = username;
    this.didKeyId = didKeyId;
    this.issuerDid = issuerDid;
    this.issuerKeyId = issuerKeyId;
    this.lastSeen = lastSeen;
    this.likedPosts = likedPosts;
    this.avatarUrl = avatarUrl;
    this.backgroundColor = backgroundColor;
    this.avatarFallbackColor = avatarFallbackColor;
    this.bio = bio;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  wallet: string;

  @Column({
    type: "varchar",
    length: 99,
    nullable: true
  })
  username: string;

  @Column({
    nullable: true
  })
  didKeyId: string;

  @Index({ unique: true })
  @Column({
    unique: true,
    nullable: true
  })
  issuerDid: string;

  @Column({
    nullable: true
  })
  issuerKeyId: string;

  @Column()
  lastSeen: Date;

  @Column("int", { array: true, default: {} })
  likedPosts: number[];

  @Column("varchar", { array: true, default: [] })
  @Index()
  skillTags: string[];

  @Column({
    nullable: true
  })
  avatarUrl: string;

  @Column({
    nullable: true
  })
  backgroundColor: string;

  @Column({
    nullable: true
  })
  avatarFallbackColor: string;

  @Column({
    type: "varchar",
    length: 250,
    nullable: true
  })
  bio: string;

  @OneToMany(() => Tip, (tip) => tip.post)
  @JoinColumn({ name: "receiverWallet", referencedColumnName: "wallet" })
  receivedTips: Tip[];

  @OneToMany(() => Tip, (tip) => tip.post)
  @JoinColumn({ name: "receiverWallet", referencedColumnName: "wallet" })
  sentTips: Tip[];
}
