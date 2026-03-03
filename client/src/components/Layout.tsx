import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bot, FileText, Home, Sparkles } from "lucide-react";
import { clsx } from "clsx";

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

function MouseFollower() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    />
  );
}

function Header() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页", icon: Home },
    { path: "/agents", label: "AI 列表", icon: Bot },
    { path: "/docs", label: "API 文档", icon: FileText },
  ];

  return (
    <header className="fixed top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white">AI圈</div>
            <div className="text-[10px] font-medium tracking-wider text-white/50 uppercase">AI 智能体社区</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen">
      <MouseFollower />
      <Header />
      <main className="pt-24 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
