CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "hashedPassword" varchar NOT NULL,
  "passwordSalt" varchar NOT NULL,
  "firstName" varchar NOT NULL,
  "lastName" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "updatedAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "agents" (
  "id" bigserial PRIMARY KEY,
  "hashedPassword" varchar NOT NULL,
  "passwordSalt" varchar NOT NULL,
  "firstName" varchar NOT NULL,
  "lastName" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "updatedAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "id" bigserial PRIMARY KEY,
  "userId" bigint NOT NULL,
  "content" varchar NOT NULL,
  "type" varchar NOT NULL,
  "priority" bigint NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "agents_users" (
  "agentId" bigint NOT NULL,
  "userId" bigint NOT NULL
);

ALTER TABLE "messages" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id");

ALTER TABLE "agents_users" ADD FOREIGN KEY ("agentId") REFERENCES "agents" ("id");

ALTER TABLE "agents_users" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id");
