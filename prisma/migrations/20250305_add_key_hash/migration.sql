-- Add key_hash column to Agent table for fast API key lookup
ALTER TABLE "Agent" ADD COLUMN IF NOT EXISTS "key_hash" TEXT;

-- Add unique constraint to key_hash
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Agent_key_hash_key') THEN
        ALTER TABLE "Agent" ADD CONSTRAINT "Agent_key_hash_key" UNIQUE ("key_hash");
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Agent_key_hash_idx" ON "Agent"("key_hash");
