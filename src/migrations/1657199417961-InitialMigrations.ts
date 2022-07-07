import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigrations1657199417961 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" bigserial PRIMARY KEY,
        "hashedPassword" varchar NOT NULL,
        "passwordSalt" varchar NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT (now()),
        "updatedAt" timestamptz NOT NULL DEFAULT (now())
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "agents" (
        "id" bigserial PRIMARY KEY,
        "hashedPassword" varchar NOT NULL,
        "passwordSalt" varchar NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT (now()),
        "updatedAt" timestamptz NOT NULL DEFAULT (now())
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" (
        "id" bigserial PRIMARY KEY,
        "userId" bigint NOT NULL,
        "body" varchar NOT NULL,
        "type" varchar NOT NULL,
        "priority" bigint NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT (now())
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "agents_users" (
        "id" bigserial PRIMARY KEY,
        "agentId" bigint NOT NULL,
        "userId" bigint UNIQUE NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ON "agents_users" ("agentId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents_users" ADD FOREIGN KEY ("agentId") REFERENCES "agents" ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents_users" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agents_users"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "agents"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
