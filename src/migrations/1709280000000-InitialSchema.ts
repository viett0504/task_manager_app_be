import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709280000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "full_name" VARCHAR(255) NOT NULL,
        "avatar_url" TEXT,
        "role" VARCHAR(50) NOT NULL DEFAULT 'member',
        "ai_score" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "owner_id" uuid REFERENCES "users"("id"),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create team_members table
    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid REFERENCES "teams"("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "role" VARCHAR(50) NOT NULL,
        "allocation_percentage" INTEGER DEFAULT 0,
        "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("team_id", "user_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
