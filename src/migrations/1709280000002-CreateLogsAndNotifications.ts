import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogsAndNotifications1709280000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create activity_logs table
    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id"),
        "team_id" uuid REFERENCES "teams"("id"),
        "action_type" VARCHAR(50) NOT NULL,
        "action_description" TEXT NOT NULL,
        "target_id" uuid,
        "target_type" VARCHAR(50),
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ai_suggestions table
    await queryRunner.query(`
      CREATE TABLE "ai_suggestions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id"),
        "team_id" uuid REFERENCES "teams"("id"),
        "suggestion_type" VARCHAR(50) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "status" VARCHAR(50) DEFAULT 'pending',
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "expires_at" TIMESTAMP
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id"),
        "type" VARCHAR(50) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "is_read" BOOLEAN DEFAULT false,
        "data" JSONB,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_activity_logs_team" ON "activity_logs"("team_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_notifications_user" ON "notifications"("user_id", "is_read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "ai_suggestions"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
  }
}
