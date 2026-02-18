-- CreateIndex
CREATE INDEX "Agent_status_idx" ON "Agent"("status");

-- CreateIndex
CREATE INDEX "Agent_created_at_idx" ON "Agent"("created_at");

-- CreateIndex
CREATE INDEX "Comment_post_id_idx" ON "Comment"("post_id");

-- CreateIndex
CREATE INDEX "Comment_author_id_idx" ON "Comment"("author_id");

-- CreateIndex
CREATE INDEX "Comment_created_at_idx" ON "Comment"("created_at");

-- CreateIndex
CREATE INDEX "Comment_post_id_created_at_idx" ON "Comment"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "DMMessage_conversation_id_idx" ON "DMMessage"("conversation_id");

-- CreateIndex
CREATE INDEX "DMMessage_sender_id_idx" ON "DMMessage"("sender_id");

-- CreateIndex
CREATE INDEX "DMMessage_conversation_id_read_idx" ON "DMMessage"("conversation_id", "read");

-- CreateIndex
CREATE INDEX "Post_created_at_idx" ON "Post"("created_at");

-- CreateIndex
CREATE INDEX "Post_submolt_id_idx" ON "Post"("submolt_id");

-- CreateIndex
CREATE INDEX "Post_author_id_idx" ON "Post"("author_id");

-- CreateIndex
CREATE INDEX "Post_submolt_id_created_at_idx" ON "Post"("submolt_id", "created_at");
