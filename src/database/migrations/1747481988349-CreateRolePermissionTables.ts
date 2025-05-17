import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissionTables1747481988349 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    // Create role_permissions join table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // Create user_roles join table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    // Seed default roles
    await queryRunner.query(`
      INSERT INTO "roles" (id, name, description) VALUES 
      (uuid_generate_v4(), 'user', 'Regular user with limited access'),
      (uuid_generate_v4(), 'admin', 'Administrator with extended privileges'),
      (uuid_generate_v4(), 'super_admin', 'Super administrator with full access')
    `);

    // Seed permissions based on your Permission enum
    await queryRunner.query(`
      INSERT INTO "permissions" (id, name, description) VALUES 
      (uuid_generate_v4(), 'user:read', 'Can read user data'),
      (uuid_generate_v4(), 'user:create', 'Can create users'),
      (uuid_generate_v4(), 'user:update', 'Can update user data'),
      (uuid_generate_v4(), 'user:delete', 'Can delete users'),
      
      (uuid_generate_v4(), 'subscription:read', 'Can read subscription data'),
      (uuid_generate_v4(), 'subscription:create', 'Can create subscriptions'),
      (uuid_generate_v4(), 'subscription:update', 'Can update subscriptions'),
      (uuid_generate_v4(), 'subscription:delete', 'Can delete subscriptions'),
      
      (uuid_generate_v4(), 'plan:read', 'Can read plan data'),
      (uuid_generate_v4(), 'plan:create', 'Can create plans'),
      (uuid_generate_v4(), 'plan:update', 'Can update plans'),
      (uuid_generate_v4(), 'plan:delete', 'Can delete plans'),
      
      (uuid_generate_v4(), 'integration:read', 'Can read integration data'),
      (uuid_generate_v4(), 'integration:create', 'Can create integrations'),
      (uuid_generate_v4(), 'integration:update', 'Can update integrations'),
      (uuid_generate_v4(), 'integration:delete', 'Can delete integrations'),
      
      (uuid_generate_v4(), 'analytics:read', 'Can read analytics data'),
      (uuid_generate_v4(), 'analytics:export', 'Can export analytics data')
    `);

    // Assign permissions to roles
    // Assign basic permissions to user role
    await queryRunner.query(`
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT r.id, p.id 
      FROM roles r, permissions p
      WHERE r.name = 'user' AND p.name = 'user:read';
    `);

    // Assign most permissions to admin role
    await queryRunner.query(`
      WITH admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
      admin_perms AS (SELECT id FROM permissions WHERE name NOT LIKE '%:delete')
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT admin_role.id, admin_perms.id FROM admin_role, admin_perms
    `);

    // Assign all permissions to super_admin role
    await queryRunner.query(`
      WITH super_admin_role AS (SELECT id FROM roles WHERE name = 'super_admin'),
      all_perms AS (SELECT id FROM permissions)
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT super_admin_role.id, all_perms.id FROM super_admin_role, all_perms
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}