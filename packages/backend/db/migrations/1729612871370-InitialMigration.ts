import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1729612871370 implements MigrationInterface {
    name = 'InitialMigration1729612871370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tips" ("id" SERIAL NOT NULL, "tipperWallet" character varying NOT NULL, "receiverWallet" character varying NOT NULL, "postId" integer NOT NULL, "amount" character varying NOT NULL, "denom" character varying NOT NULL, "txHash" character varying NOT NULL, "isViewed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_b63a628fdfd7517d8e58fe39199" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_94f2f045a30ed13e65607b8356" ON "tips" ("tipperWallet") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f5a11fcbce0c4bc24731019c7" ON "tips" ("receiverWallet") `);
        await queryRunner.query(`CREATE INDEX "IDX_62076475782dfa7ac064001681" ON "tips" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_127898987464d6dfeff0b50ec5" ON "tips" ("isViewed") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "wallet" character varying NOT NULL, "username" character varying(99), "didKeyId" character varying, "issuerDid" character varying, "issuerKeyId" character varying, "lastSeen" TIMESTAMP NOT NULL, "likedPosts" integer array NOT NULL DEFAULT '{}', "skillTags" character varying array NOT NULL DEFAULT '{}', "avatarUrl" character varying, "backgroundColor" character varying, "avatarFallbackColor" character varying, "bio" character varying(250), CONSTRAINT "UQ_c5a97c2e62b0c759e2c16d411cd" UNIQUE ("wallet"), CONSTRAINT "UQ_4a0f44fbc0b59b1a9637ac3dffa" UNIQUE ("issuerDid"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c5a97c2e62b0c759e2c16d411c" ON "users" ("wallet") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4a0f44fbc0b59b1a9637ac3dff" ON "users" ("issuerDid") `);
        await queryRunner.query(`CREATE INDEX "IDX_40850d95842a2c4198dcabb52f" ON "users" ("skillTags") `);
        await queryRunner.query(`CREATE TYPE "public"."posts_visibility_enum" AS ENUM('public', 'private', 'recipients')`);
        await queryRunner.query(`CREATE TYPE "public"."posts_requesttype_enum" AS ENUM('job', 'gig')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "creatorWallet" character varying NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "lastReplyDate" TIMESTAMP, "visibility" "public"."posts_visibility_enum" NOT NULL, "requestType" "public"."posts_requesttype_enum", "requestExpiration" character varying, "skillTags" character varying array NOT NULL DEFAULT '{}', "recipientWallets" character varying array NOT NULL DEFAULT '{}', "unreadByWallets" character varying array NOT NULL DEFAULT '{}', "likes" integer NOT NULL DEFAULT '0', "totalTipsAmount" integer NOT NULL DEFAULT '0', "replyToPostId" integer, "boostedUntil" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3e952fdfdbd03093bbd95e6765" ON "posts" ("creatorWallet") `);
        await queryRunner.query(`CREATE INDEX "IDX_ceb1a781f04ed49dde2cf6f780" ON "posts" ("visibility") `);
        await queryRunner.query(`CREATE INDEX "IDX_4be4580c3b7fed30dad967466e" ON "posts" ("requestType") `);
        await queryRunner.query(`CREATE INDEX "IDX_28ac4437097929377f90cc49c8" ON "posts" ("requestExpiration") `);
        await queryRunner.query(`CREATE INDEX "IDX_640ed0464ab9987adf374351e2" ON "posts" ("skillTags") `);
        await queryRunner.query(`CREATE INDEX "IDX_2d55a6b86cc4b3f32a8382a4be" ON "posts" ("recipientWallets") `);
        await queryRunner.query(`CREATE INDEX "IDX_c031f556aea77c57cccb71f926" ON "posts" ("unreadByWallets") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf622940fef9786b6aacca7d56" ON "posts" ("replyToPostId") `);
        await queryRunner.query(`CREATE TYPE "public"."issuance_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED')`);
        await queryRunner.query(`CREATE TABLE "issuance_requests" ("id" SERIAL NOT NULL, "requesterWallet" character varying NOT NULL, "requesterDid" character varying NOT NULL, "requestedIssuerDid" character varying NOT NULL, "request" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL, "status" "public"."issuance_requests_status_enum" NOT NULL, "issuedCredentialId" character varying, CONSTRAINT "PK_656fd9ad1e35c6334c053a483c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea5d44343dd85ce762cbab481a" ON "issuance_requests" ("requesterWallet") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb3d1bcbfff56746953672d3f0" ON "issuance_requests" ("requesterDid") `);
        await queryRunner.query(`CREATE INDEX "IDX_81441374f144c6f28775c3b8ee" ON "issuance_requests" ("requestedIssuerDid") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb53eb8ea84acc27387797d0d6" ON "issuance_requests" ("status") `);
        await queryRunner.query(`ALTER TABLE "tips" ADD CONSTRAINT "FK_94f2f045a30ed13e65607b83563" FOREIGN KEY ("tipperWallet") REFERENCES "users"("wallet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tips" ADD CONSTRAINT "FK_7f5a11fcbce0c4bc24731019c7f" FOREIGN KEY ("receiverWallet") REFERENCES "users"("wallet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tips" ADD CONSTRAINT "FK_62076475782dfa7ac0640016812" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_3e952fdfdbd03093bbd95e67657" FOREIGN KEY ("creatorWallet") REFERENCES "users"("wallet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issuance_requests" ADD CONSTRAINT "FK_ea5d44343dd85ce762cbab481ab" FOREIGN KEY ("requesterWallet") REFERENCES "users"("wallet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issuance_requests" ADD CONSTRAINT "FK_81441374f144c6f28775c3b8ee4" FOREIGN KEY ("requestedIssuerDid") REFERENCES "users"("issuerDid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issuance_requests" DROP CONSTRAINT "FK_81441374f144c6f28775c3b8ee4"`);
        await queryRunner.query(`ALTER TABLE "issuance_requests" DROP CONSTRAINT "FK_ea5d44343dd85ce762cbab481ab"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_3e952fdfdbd03093bbd95e67657"`);
        await queryRunner.query(`ALTER TABLE "tips" DROP CONSTRAINT "FK_62076475782dfa7ac0640016812"`);
        await queryRunner.query(`ALTER TABLE "tips" DROP CONSTRAINT "FK_7f5a11fcbce0c4bc24731019c7f"`);
        await queryRunner.query(`ALTER TABLE "tips" DROP CONSTRAINT "FK_94f2f045a30ed13e65607b83563"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb53eb8ea84acc27387797d0d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81441374f144c6f28775c3b8ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb3d1bcbfff56746953672d3f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea5d44343dd85ce762cbab481a"`);
        await queryRunner.query(`DROP TABLE "issuance_requests"`);
        await queryRunner.query(`DROP TYPE "public"."issuance_requests_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf622940fef9786b6aacca7d56"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c031f556aea77c57cccb71f926"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d55a6b86cc4b3f32a8382a4be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_640ed0464ab9987adf374351e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_28ac4437097929377f90cc49c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4be4580c3b7fed30dad967466e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ceb1a781f04ed49dde2cf6f780"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e952fdfdbd03093bbd95e6765"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_requesttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."posts_visibility_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40850d95842a2c4198dcabb52f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a0f44fbc0b59b1a9637ac3dff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5a97c2e62b0c759e2c16d411c"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_127898987464d6dfeff0b50ec5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62076475782dfa7ac064001681"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f5a11fcbce0c4bc24731019c7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94f2f045a30ed13e65607b8356"`);
        await queryRunner.query(`DROP TABLE "tips"`);
    }

}
