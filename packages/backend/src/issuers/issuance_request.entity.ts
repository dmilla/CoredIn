import { User } from "../user/user.entity";
import { CredentialDTO, CredentialRequestStatus } from "@coredin/shared";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn
} from "typeorm";

@Entity("issuance_requests")
export class IssuanceRequest {
  constructor(
    id: number,
    requesterWallet: string,
    requestedIssuerDid: string,
    request: CredentialDTO,
    createdAt: Date,
    status: CredentialRequestStatus
  ) {
    this.id = id;
    this.requesterWallet = requesterWallet;
    this.requestedIssuerDid = requestedIssuerDid;
    this.request = request;
    this.createdAt = createdAt;
    this.status = status;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  requesterWallet: string;

  @Column()
  @Index()
  requesterDid: string;

  @Column()
  @Index()
  requestedIssuerDid: string;

  @Column("jsonb")
  request: CredentialDTO; // https://wanago.io/2020/12/28/nestjs-json-postgresql-typeorm/

  @Column()
  createdAt: Date;

  @Column({
    type: "enum",
    enum: CredentialRequestStatus
  })
  @Index()
  status: CredentialRequestStatus;

  @Column({ nullable: true })
  issuedCredentialId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "requesterWallet", referencedColumnName: "wallet" })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "requestedIssuerDid", referencedColumnName: "issuerDid" })
  issuer: User;
}
