import { Sparkles, HeartPulse, ShieldCheck, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-purple-900/40 p-5 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden backdrop-blur-md">
      {/* Absolute ambient lights inside header */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] pointer-events-none" />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 animate-pulse">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300">
            SỨC KHỎE VÀNG
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-blue-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
            Xưởng Kịch Bản Hoạt Họa Sức Khỏe & Mẹo Dân Gian
          </p>
        </div>
      </div>

      {/* Right widgets of Header for Bento look */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-4">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            Bản Quyền Hệ Thống
          </span>
          <span className="text-xs font-semibold text-white">V2.1.0 Lunar Engine</span>
        </div>
        
        <div className="flex gap-3">
          <div className="flex flex-col items-end justify-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">AI Studio Token</span>
            <span className="text-xs font-black text-blue-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              Không Giới Hạn
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}
