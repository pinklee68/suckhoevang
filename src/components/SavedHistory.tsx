import { ScriptHistoryItem } from "../types";
import { History, Calendar, Trash2, ChevronRight, FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface SavedHistoryProps {
  history: ScriptHistoryItem[];
  onSelectHistory: (item: ScriptHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

export default function SavedHistory({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
  activeId,
}: SavedHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 text-center space-y-3 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-[40px] pointer-events-none" />
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 shadow-lg">
          <History className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Chưa có kịch bản lưu trữ</p>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
          Các kịch bản bạn tạo sẽ tự động được lưu trữ tại thiết bị này để sử dụng lại sau này.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md space-y-4">
      {/* Glow background flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-[40px] pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" />
          LỊCH SỬ ĐÃ TẠO ({history.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer uppercase tracking-wider"
        >
          Xóa Tất Cả
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {history.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isActive
                  ? "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300"
              }`}
            >
              <button
                onClick={() => onSelectHistory(item)}
                className="flex-grow text-left space-y-1 mr-2 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${isActive ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
                  <span className={`text-xs font-extrabold truncate block max-w-[200px] ${isActive ? "text-purple-300" : "text-slate-200"}`}>
                    {item.script.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="truncate max-w-[120px] bg-black/40 px-2 py-0.5 rounded-full text-slate-400 font-bold border border-white/5">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0 text-slate-500 font-mono text-[9px]">
                    <Calendar className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteHistory(item.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-black/40 transition-all cursor-pointer border border-transparent hover:border-white/10"
                  title="Xóa kịch bản"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectHistory(item)}
                  className="p-1 rounded-xl text-slate-500 group-hover:text-purple-400 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-white/5">
        Lưu trữ an toàn trên thiết bị của bạn.
      </div>
    </div>
  );
}
