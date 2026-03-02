import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksAndSprints1709280000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sprints table
    await queryRunner.query(`
      CREATE TABLE "sprints" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "team_id" uuid REFERENCES "teams"("id"),
        "status" VARCHAR(50) NOT NULL,
        "start_date" DATE NOT NULL,
        "end_date" DATE NOT NULL,
        "progress" INTEGER DEFAULT 0,
        "velocity" INTEGER DEFAULT 0,
        "efficiency" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(500) NOT NULL,
        "description" TEXT,
        "status" VARCHAR(50) NOT NULL,
        "priority" VARCHAR(50) NOT NULL,
        "assignee_id" uuid REFERENCES "users"("id"),
        "creator_id" uuid REFERENCES "users"("id"),
        "team_id" uuid REFERENCES "teams"("id"),
        "sprint_id" uuid REFERENCES "sprints"("id"),
        "deadline" TIMESTAMP,
        "estimated_hours" DECIMAL(5,2),
        "actual_hours" DECIMAL(5,2),
        "tags" TEXT[] DEFAULT '{}',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create milestones table
    await queryRunner.query(`
      CREATE TABLE "milestones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sprint_id" uuid REFERENCES "sprints"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "due_date" DATE NOT NULL,
        "is_completed" BOOLEAN DEFAULT false,
        "progress" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_tasks_assignee" ON "tasks"("assignee_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_status" ON "tasks"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_team" ON "tasks"("team_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_sprint" ON "tasks"("sprint_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "milestones"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "sprints"`);
  }
}
