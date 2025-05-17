import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFaqTables1748000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create FAQ Category table
    await queryRunner.query(`
      CREATE TABLE "faq_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "description" character varying,
        "order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_faq_categories" PRIMARY KEY ("id")
      )
    `);

    // Create FAQ table
    await queryRunner.query(`
      CREATE TABLE "faqs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "question" character varying NOT NULL,
        "answer" text NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        "isPublished" boolean NOT NULL DEFAULT true,
        "categoryId" uuid,
        CONSTRAINT "PK_faqs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_faqs_category" FOREIGN KEY ("categoryId") 
          REFERENCES "faq_categories" ("id") ON DELETE SET NULL
      )
    `);

    // Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_faqs_category" ON "faqs" ("categoryId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_faqs_category"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "faq_categories"`);
  }
}