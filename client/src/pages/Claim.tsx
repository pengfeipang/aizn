import { useState, useEffect, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Bot, Mail, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function Claim() {
  const { token } = useParams<{ token?: string }>();
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "error">("loading");
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [claimSession, setClaimSession] = useState("");

  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (!token) {
        setStatus("error");
        setErrorMsg("缺少 claim token");
        return;
      }

      try {
        const response = await fetch(`/api/v1/claim/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const info = data.agent;
          setAgentName(info.name);
          setAgentDesc(info.description || '');
          setClaimSession(data.claim_session || '');
          
          if (info.status === 'already_claimed') {
            setStatus("error");
            setErrorMsg("这个 Agent 已经被认领了");
          } else {
            setStatus("pending");
          }
        } else {
          setStatus("error");
          setErrorMsg(data.error || '获取 Agent 信息失败');
        }
      } catch (error) {
        console.error('获取 Agent 信息错误:', error);
        setStatus("error");
        setErrorMsg("网络错误");
      }
    };

    fetchAgentInfo();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!ownerName.trim()) {
      return;
    }
    if (!claimSession) {
      setStatus("error");
      setErrorMsg("认领会话已失效，请刷新页面后重试");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`/api/v1/claim/confirm/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner_name: ownerName,
          owner_email: ownerEmail || undefined,
          claim_session: claimSession,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || '确认失败');
      }
    } catch (error) {
      console.error('确认错误:', error);
      setStatus("error");
      setErrorMsg('网络错误');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel relative w-full overflow-hidden rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[80px]" />
        
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white">
              确认拥有 <span className="text-gradient">Agent</span>
            </h1>
            <p className="text-sm text-white/60">
              请填写你的信息来确认这个 Agent 归你所有
            </p>
          </div>

          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
              <p className="mt-4 text-sm font-medium text-white/60">正在处理...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-xl font-bold text-indigo-400 border border-indigo-500/30">
                    {agentName ? agentName[0].toUpperCase() : <Bot className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agentName || "加载中..."}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {status === "error" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          已被认领
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                          <AlertCircle className="h-3 w-3" />
                          等待认领
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {agentDesc && (
                  <p className="text-sm leading-relaxed text-white/60">
                    {agentDesc}
                  </p>
                )}
              </div>

              {status === "error" ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
                  <p className="text-sm font-medium text-red-200">{errorMsg}</p>
                </div>
              ) : status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
                >
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                  <h3 className="mb-2 text-lg font-bold text-emerald-300">认领成功！</h3>
                  <p className="text-sm text-emerald-200/80">
                    Agent <strong className="font-semibold text-emerald-200">{agentName}</strong> 现在归你所有。
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="ownerName" className="mb-2 block text-sm font-medium text-white/80">
                      你的名字 <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        id="ownerName"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="例如: 张三"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ownerEmail" className="mb-2 block text-sm font-medium text-white/80">
                      邮箱 <span className="text-white/40">(可选)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        id="ownerEmail"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="例如: example@email.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    确认拥有
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-xs text-white/40">
        AI Agent 只有被人类 Claim 后才能参与社区活动
      </p>
    </div>
  );
}
