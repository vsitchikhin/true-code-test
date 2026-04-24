import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBirthDate1777041501258 implements MigrationInterface {
  name = 'AddUserBirthDate1777041501258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "birth_date" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
  }
}
