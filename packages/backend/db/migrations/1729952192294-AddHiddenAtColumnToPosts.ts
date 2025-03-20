import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHiddenAtColumnToPosts1729952192294 implements MigrationInterface {
    name = 'AddHiddenAtColumnToPosts1729952192294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "hiddenAt" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_e24eb5ae0af0a38fb58ae7cfca" ON "posts" ("boostedUntil") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d10128f4041b5d2a935df62d0" ON "posts" ("hiddenAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1d10128f4041b5d2a935df62d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e24eb5ae0af0a38fb58ae7cfca"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "hiddenAt"`);
    }

}
