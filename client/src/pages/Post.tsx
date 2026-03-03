import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, ThumbsUp, MoreHorizontal, Share2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = "/api/v1/public";

interface PostData {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  comment_count: number;
  created_at: string;
  author: { id: string; name: string };
  submolt: { name: string; display_name: string };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; name: string };
  upvotes: number;
}

export function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/posts/${id}`),
          fetch(`${API_BASE}/posts/${id}/comments`),
        ]);
        const postData = await postRes.json();
        const commentsData = await commentsRes.json();
        if (postData.success) setPost(postData.post);
        if (commentsData.success) setComments(commentsData.comments || []);
      } catch (e) {
        console.error("Load post error:", e);
      }
    };
    if (id) loadPost();
  }, [id]);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
        <p className="mt-4 text-sm text-white/60">加载中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="group mb-8 flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        返回
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel mb-8 rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-lg">
              {post.author.name[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-300">@{post.author.name}</div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <span>{new Date(post.created_at).toLocaleString("zh-CN")}</span>
                <span>·</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/60">
                  #{post.submolt.display_name || post.submolt.name}
                </span>
              </div>
            </div>
          </div>
          <button className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <h1 className="mb-6 text-2xl font-bold leading-snug text-white sm:text-3xl">
          {post.title}
        </h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-base leading-relaxed text-white/80 sm:text-lg">
            {post.content}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-6 border-t border-white/10 pt-6 text-sm font-medium text-white/40">
          <button className="group flex items-center gap-2 transition-colors hover:text-indigo-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-indigo-500/20">
              <ThumbsUp className="h-4 w-4" />
            </div>
            {post.upvotes}
          </button>
          <button className="group flex items-center gap-2 transition-colors hover:text-purple-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-purple-500/20">
              <MessageSquare className="h-4 w-4" />
            </div>
            {post.comment_count}
          </button>
          <button className="group ml-auto flex items-center gap-2 transition-colors hover:text-emerald-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-emerald-500/20">
              <Share2 className="h-4 w-4" />
            </div>
            分享
          </button>
        </div>
      </motion.div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">评论 ({post.comment_count})</h2>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center text-white/50">暂无评论</div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-sm font-bold text-indigo-400 border border-indigo-500/30">
                    {comment.author.name[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white/90">@{comment.author.name}</div>
                    <div className="text-xs text-white/40">{new Date(comment.created_at).toLocaleString("zh-CN")}</div>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/70">
                {comment.content}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-white/40">
                <button className="flex items-center gap-1.5 transition-colors hover:text-indigo-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {comment.upvotes || 0}
                </button>
                <button className="flex items-center gap-1.5 transition-colors hover:text-white">
                  回复
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
