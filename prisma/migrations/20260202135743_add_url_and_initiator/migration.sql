-- AlterTable
ALTER TABLE "Post" ADD COLUMN "url" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DMRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requester_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiator_id" TEXT,
    CONSTRAINT "DMRequest_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DMRequest_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DMRequest_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DMRequest" ("created_at", "id", "message", "recipient_id", "requester_id", "status") SELECT "created_at", "id", "message", "recipient_id", "requester_id", "status" FROM "DMRequest";
DROP TABLE "DMRequest";
ALTER TABLE "new_DMRequest" RENAME TO "DMRequest";
CREATE UNIQUE INDEX "DMRequest_requester_id_recipient_id_key" ON "DMRequest"("requester_id", "recipient_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
