import { MigrationInterface, QueryRunner } from "typeorm";
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
        
        // Get the IDs of the admin and superadmin roles
        await queryRunner.query(`
            WITH 
                admin_user AS (SELECT id FROM "users" WHERE email = 'admin@admin.com'),
                super_user AS (SELECT id FROM "users" WHERE email = 'superadmin@admin.com'),
                admin_role AS (SELECT id FROM "roles" WHERE name = 'admin'),
                super_role AS (SELECT id FROM "roles" WHERE name = 'super_admin')
            
            -- Assign admin role to admin user
            INSERT INTO "user_roles" ("userId", "roleId")
            SELECT admin_user.id, admin_role.id 
            FROM admin_user, admin_role
            ON CONFLICT DO NOTHING;
            
            -- Assign super_admin role to superadmin user
            INSERT INTO "user_roles" ("userId", "roleId")
            SELECT super_user.id, super_role.id 
            FROM super_user, super_role
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the created users
        await queryRunner.query(`
            DELETE FROM "users" 
            WHERE email IN ('admin@admin.com', 'superadmin@admin.com');
        `);
    }
}
