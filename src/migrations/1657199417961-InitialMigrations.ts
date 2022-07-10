import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigrations1657199417961 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" serial PRIMARY KEY NOT NULL,
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
        "id" serial PRIMARY KEY NOT NULL,
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
        "id" serial PRIMARY KEY NOT NULL,
        "userId" integer NOT NULL,
        "body" varchar NOT NULL,
        "type" varchar NOT NULL,
        "priority" integer NOT NULL,
        "sender" varchar NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT (now())
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "agents_users" (
        "id" serial PRIMARY KEY NOT NULL,
        "agentId" integer NOT NULL,
        "userId" integer UNIQUE NOT NULL
      )`,
    );
    await queryRunner.query(`CREATE INDEX ON "users" ("email") INCLUDE ("id")`);

    await queryRunner.query(`CREATE INDEX ON "users" ("email") INCLUDE ("id")`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX ON "agents_users" ("userId", "agentId")`,
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
