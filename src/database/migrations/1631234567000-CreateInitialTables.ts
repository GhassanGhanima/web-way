import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1631234567000 implements MigrationInterface {
  name = 'CreateInitialTables1631234567000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_roles_enum" AS ENUM('user', 'admin', 'super_admin');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "password" character varying NOT NULL,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{user}',
        "avatar_url" character varying,
        "google_id" character varying,
        "last_login_at" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
  }
}
