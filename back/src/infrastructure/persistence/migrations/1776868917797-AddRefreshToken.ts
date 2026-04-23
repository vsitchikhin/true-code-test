import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToken1776868917797 implements MigrationInterface {
  name = 'AddRefreshToken1776868917797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_images" DROP CONSTRAINT "FK_cbea080987be6204e913a691aea"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_hash" text`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_path"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_path" text`);
    await queryRunner.query(
      `ALTER TABLE "post_images" ADD CONSTRAINT "FK_cbea080987be6204e913a691aea" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_images" DROP CONSTRAINT "FK_cbea080987be6204e913a691aea"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_path"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_path" character varying`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`);
    await queryRunner.query(
      `ALTER TABLE "post_images" ADD CONSTRAINT "FK_cbea080987be6204e913a691aea" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
