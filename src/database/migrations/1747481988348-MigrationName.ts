import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1747481988348 implements MigrationInterface {
    name = 'MigrationName1747481988348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('user', 'admin', 'super_admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "password" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{user}', "avatarUrl" character varying, "googleId" character varying, "lastLoginAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'canceled', 'expired', 'pending', 'trial')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "planId" character varying NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'pending', "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "renewalDate" TIMESTAMP WITH TIME ZONE, "autoRenew" boolean NOT NULL DEFAULT true, "externalSubscriptionId" character varying(255), "canceledAt" TIMESTAMP WITH TIME ZONE, "notes" character varying(255), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."script_assets_type_enum" AS ENUM('core', 'plugin', 'utility')`);
        await queryRunner.query(`CREATE TABLE "script_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "version" character varying NOT NULL, "type" "public"."script_assets_type_enum" NOT NULL DEFAULT 'core', "filePath" character varying NOT NULL, "integrityHash" character varying NOT NULL, "requiredPlan" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "isLatest" boolean NOT NULL DEFAULT true, "dependencies" text, CONSTRAINT "PK_f90d4549359f25d35d448641b58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usage_events_eventtype_enum" AS ENUM('page_view', 'feature_used', 'script_loaded', 'error', 'user_preference')`);
        await queryRunner.query(`CREATE TABLE "usage_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "integrationId" character varying NOT NULL, "eventType" "public"."usage_events_eventtype_enum" NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "pageUrl" character varying(255), "ipAddress" character varying(255), "userAgent" character varying(255), "eventData" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_c9f17d50873fab2c46615f542bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_364749e35a9cceb2cd4ef09d7a" ON "usage_events" ("eventType", "timestamp") `);
        await queryRunner.query(`CREATE INDEX "IDX_1163d6c5f7ac69fe0ecc247076" ON "usage_events" ("integrationId", "timestamp") `);
        await queryRunner.query(`CREATE TYPE "public"."integrations_status_enum" AS ENUM('active', 'pending', 'suspended', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "domain" character varying NOT NULL, "apiKey" character varying NOT NULL, "secretKey" character varying NOT NULL, "allowedDomains" text, "status" "public"."integrations_status_enum" NOT NULL DEFAULT 'pending', "isDomainVerified" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL DEFAULT '{}', "lastUsedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."plans_interval_enum" AS ENUM('monthly', 'quarterly', 'annual')`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "interval" "public"."plans_interval_enum" NOT NULL DEFAULT 'monthly', "externalPlanId" character varying(255), "maxIntegrations" integer NOT NULL DEFAULT '1', "includesAdvancedFeatures" boolean NOT NULL DEFAULT false, "includesAnalytics" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "trialPeriodDays" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integrations" ADD CONSTRAINT "FK_c32758a01d05d0d1da56fa46ae1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integrations" DROP CONSTRAINT "FK_c32758a01d05d0d1da56fa46ae1"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TYPE "public"."plans_interval_enum"`);
        await queryRunner.query(`DROP TABLE "integrations"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1163d6c5f7ac69fe0ecc247076"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_364749e35a9cceb2cd4ef09d7a"`);
        await queryRunner.query(`DROP TABLE "usage_events"`);
        await queryRunner.query(`DROP TYPE "public"."usage_events_eventtype_enum"`);
        await queryRunner.query(`DROP TABLE "script_assets"`);
        await queryRunner.query(`DROP TYPE "public"."script_assets_type_enum"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
    }

}
