import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '@app/common/decorators/permissions.decorator';
import { Role } from '@app/common/decorators/roles.decorator';

export class PopulateRolesAndPermissions1684932500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert default roles
    await queryRunner.query(`
      INSERT INTO "roles" (id, "name", description, "createdAt", "updatedAt")
      VALUES 
        (uuid_generate_v4(), '${Role.USER}', 'Regular user with limited access', NOW(), NOW()),
        (uuid_generate_v4(), '${Role.ADMIN}', 'Administrator with extended privileges', NOW(), NOW()),
        (uuid_generate_v4(), '${Role.SUPER_ADMIN}', 'Super administrator with full access', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert all permissions from the enum
    const permissionValues = Object.values(Permission);
    
    for (const permValue of permissionValues) {
      await queryRunner.query(`
        INSERT INTO "permissions" (id, "name", description, "createdAt", "updatedAt")
        VALUES (
          uuid_generate_v4(), 
          '${permValue}', 
          '${this.getPermissionDescription(permValue)}', 
          NOW(), 
          NOW()
        )
        ON CONFLICT (name) DO NOTHING;
      `);
    }

    // Assign all permissions to super_admin role
    await queryRunner.query(`
      WITH super_admin_role AS (SELECT id FROM roles WHERE name = '${Role.SUPER_ADMIN}'),
      all_perms AS (SELECT id FROM permissions)
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT super_admin_role.id, all_perms.id FROM super_admin_role, all_perms
      ON CONFLICT DO NOTHING;
    `);

    // Assign read permissions to admin role
    await queryRunner.query(`
      WITH admin_role AS (SELECT id FROM roles WHERE name = '${Role.ADMIN}'),
      read_perms AS (SELECT id FROM permissions WHERE name LIKE '%:read')
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT admin_role.id, read_perms.id FROM admin_role, read_perms
      ON CONFLICT DO NOTHING;
    `);

    // Assign minimal permissions to user role (just examples)
    await queryRunner.query(`
      WITH user_role AS (SELECT id FROM roles WHERE name = '${Role.USER}'),
      user_perms AS (
        SELECT id FROM permissions 
        WHERE name IN ('${Permission.USER_READ}', '${Permission.PLAN_READ}')
      )
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT user_role.id, user_perms.id FROM user_role, user_perms
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM permissions`);
    await queryRunner.query(`DELETE FROM roles`);
  }

  private getPermissionDescription(permName: string): string {
    const [resource, action] = permName.split(':');
    const formattedResource = resource.toLowerCase().replace('_', ' ');
    
    switch (action) {
      case 'read':
        return `Can view ${formattedResource} information`;
      case 'create':
        return `Can create new ${formattedResource}`;
      case 'update':
        return `Can modify ${formattedResource} information`;
      case 'delete':
        return `Can delete ${formattedResource}`;
      case 'assign':
        return `Can assign ${formattedResource} to other entities`;
      case 'export':
        return `Can export ${formattedResource} data`;
      default:
        return `Permission for ${permName}`;
    }
  }
}