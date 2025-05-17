import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '@app/common/decorators/permissions.decorator';

export class PopulatePermissions1747482012345 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert all permissions from the enum
    const permissionValues = Object.values(Permission);
    
    for (const permValue of permissionValues) {
      await queryRunner.query(`
        INSERT INTO permissions (id, name, description, "createdAt", "updatedAt")
        VALUES (
          uuid_generate_v4(), 
          '${permValue}', 
          '${this.getPermissionDescription(permValue)}', 
          NOW(), 
          NOW()
        )
        ON CONFLICT (name) DO NOTHING
      `);
    }

    // Assign all permissions to super_admin role
    await queryRunner.query(`
      WITH super_admin_role AS (SELECT id FROM roles WHERE name = 'super_admin'),
      all_perms AS (SELECT id FROM permissions)
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT super_admin_role.id, all_perms.id FROM super_admin_role, all_perms
      ON CONFLICT DO NOTHING
    `);

    // Assign read permissions to regular admin role
    await queryRunner.query(`
      WITH admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
      read_perms AS (SELECT id FROM permissions WHERE name LIKE '%:read')
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT admin_role.id, read_perms.id FROM admin_role, read_perms
      ON CONFLICT DO NOTHING
    `);

    // Add FAQ permissions
    await queryRunner.query(`
      INSERT INTO "permissions" (id, name, description, "createdAt", "updatedAt")
      VALUES 
        (uuid_generate_v4(), 'faq:read', 'Can read FAQ content', NOW(), NOW()),
        (uuid_generate_v4(), 'faq:create', 'Can create FAQ entries', NOW(), NOW()),
        (uuid_generate_v4(), 'faq:update', 'Can update FAQ entries', NOW(), NOW()),
        (uuid_generate_v4(), 'faq:delete', 'Can delete FAQ entries', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);

    // Assign FAQ permissions to admin role
    await queryRunner.query(`
      WITH admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
      faq_perms AS (SELECT id FROM permissions WHERE name LIKE 'faq:%')
      INSERT INTO role_permissions ("roleId", "permissionId")
      SELECT admin_role.id, faq_perms.id FROM admin_role, faq_perms
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove permissions assigned to roles
    await queryRunner.query(`DELETE FROM role_permissions`);
    
    // Remove all permissions
    await queryRunner.query(`DELETE FROM permissions`);
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