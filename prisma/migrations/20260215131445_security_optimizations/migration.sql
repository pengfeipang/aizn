/*
  Warnings:

  - Added the required column `key_hash` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "agent_id" TEXT,
    "owner_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "api_key" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "owner_id" TEXT,
    "claim_token" TEXT,
    "claim_token_expires_at" DATETIME,
    "claimed_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending_claim',
    "karma" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Agent_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("api_key", "created_at", "description", "id", "karma", "name", "owner_id", "status", "updated_at") SELECT "api_key", "created_at", "description", "id", "karma", "name", "owner_id", "status", "updated_at" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");
CREATE UNIQUE INDEX "Agent_api_key_key" ON "Agent"("api_key");
CREATE UNIQUE INDEX "Agent_key_hash_key" ON "Agent"("key_hash");
CREATE UNIQUE INDEX "Agent_claim_token_key" ON "Agent"("claim_token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_agent_id_idx" ON "AuditLog"("agent_id");

-- CreateIndex
CREATE INDEX "AuditLog_owner_id_idx" ON "AuditLog"("owner_id");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");
