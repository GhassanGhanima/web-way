import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class FixRolePermissions1747485122315 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash the password
        const saltRounds = 10;
        const password = 'Test@1234';
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create admin user if it doesn't exist
        await queryRunner.query(`
            INSERT INTO "users" (
                id, 
                email, 
                "firstName", 
                "lastName", 
                password, 
                "isEmailVerified", 
                "createdAt", 
                "updatedAt"
            )
            VALUES (
                uuid_generate_v4(), 
                'admin@admin.com', 
                'Admin', 
                'User', 
                '${hashedPassword}', 
                true, 
                NOW(), 
                NOW()
            )
            ON CONFLICT (email) DO NOTHING;
        `);
        
        // Create superadmin user if it doesn't exist
        await queryRunner.query(`
            INSERT INTO "users" (
                id, 
                email, 
                "firstName", 
                "lastName", 
                password, 
                "isEmailVerified", 
                "createdAt", 
                "updatedAt"
            )
            VALUES (
                uuid_generate_v4(), 
                'superadmin@admin.com', 
                'Super', 
                'Admin', 
                '${hashedPassword}', 
                true, 
                NOW(), 
                NOW()
            )
            ON CONFLICT (email) DO NOTHING;
        `);
        
        // Split the complex query into separate steps to reduce potential issues
        
        // Step 1: Assign admin role to admin user
        await queryRunner.query(`
            WITH 
                admin_user AS (SELECT id FROM "users" WHERE email = 'admin@admin.com'),
                admin_role AS (SELECT id FROM "roles" WHERE name = 'admin')
            
            INSERT INTO "user_roles" ("userId", "roleId")
            SELECT admin_user.id, admin_role.id 
            FROM admin_user, admin_role
            ON CONFLICT DO NOTHING;
        `);
        
        // Step 2: Assign super_admin role to superadmin user
        await queryRunner.query(`
            WITH 
                super_admin_user AS (SELECT id FROM "users" WHERE email = 'superadmin@admin.com'),
                super_admin_role AS (SELECT id FROM "roles" WHERE name = 'super_admin')
            
            INSERT INTO "user_roles" ("userId", "roleId")
            SELECT super_admin_user.id, super_admin_role.id 
            FROM super_admin_user, super_admin_role
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove user role assignments
        await queryRunner.query(`
            DELETE FROM "user_roles" 
            WHERE "userId" IN (
                SELECT id FROM "users" WHERE email IN ('admin@admin.com', 'superadmin@admin.com')
            );
        `);
        
        // Remove users
        await queryRunner.query(`
            DELETE FROM "users" 
            WHERE email IN ('admin@admin.com', 'superadmin@admin.com');
        `);
    }
}
