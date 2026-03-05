-- Add missing columns to Agent table
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "key_hash" TEXT;
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "claim_token_expires_at" TIMESTAMP(3);

-- Add unique constraint to key_hash (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Agent_key_hash_key') THEN
        ALTER TABLE "Agent" ADD CONSTRAINT "Agent_key_hash_key" UNIQUE ("key_hash");
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Agent_key_hash_idx" ON "Agent"("key_hash");
