import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNameAndLastName1777040145875 implements MigrationInterface {
  name = 'AddUserNameAndLastName1777040145875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "first_name" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_name" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
  }
}
