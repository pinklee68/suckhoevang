import { useState } from "react";
import * as Icons from "lucide-react";
import { categoriesData } from "../data/categories";
import { Category } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CategorySelectorProps {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  selectedIdea: string;
  onSelectIdea: (idea: string) => void;
}

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
  selectedIdea,
  onSelectIdea,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categoriesData.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.ideas.some((idea) => idea.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search and Navigation Title inside a bento-style box */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[60px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" />
              1. CHỌN DANH MỤC SỨC KHỎE
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chọn nhóm chủ đề sức khỏe và thảo dược thiên nhiên để khám phá ý tưởng.
            </p>
          </div>
          
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Tìm nhanh chủ đề hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-9 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <Icons.Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[10px] text-slate-400 hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Categories (Styled like Bento boxes) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;
          const IconComponent = (Icons as any)[cat.icon] || Icons.Heart;

          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat);
                if (cat.id !== selectedCategory?.id) {
                  onSelectIdea("");
                }
              }}
              className={`group relative text-left p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-36 ${
                isSelected
                  ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]"
                  : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10"
              }`}
            >
              {/* Background ambient lighting from category's color */}
              <div className={`absolute -right-6 -bottom-6 w-16 h-16 bg-gradient-to-br ${cat.color} opacity-[0.08] rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform`} />

              <div className="space-y-2 relative z-10">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} text-slate-900 w-fit shadow-md transition-transform group-hover:scale-110`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-xs tracking-tight line-clamp-2 leading-snug">
                  {cat.name}
                </h3>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed relative z-10">
                {cat.description}
              </p>

              {isSelected && (
                <div className="absolute right-3 top-3 text-blue-400 bg-blue-950/80 p-0.5 rounded-full border border-blue-500/30">
                  <Icons.Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Ideas list for the selected category (Styled like a gorgeous bento item) */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md"
          >
            {/* Ambient Background Glow matching the bento theme */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" />
              <h2 className="text-sm font-bold text-slate-300">
                2. CHỌN Ý TƯỞNG (TRENDING): <span className="text-blue-400 font-extrabold">{selectedCategory.name}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 relative z-10">
              {selectedCategory.ideas.map((idea, index) => {
                const isIdeaSelected = selectedIdea === idea;
                return (
                  <button
                    key={index}
                    onClick={() => onSelectIdea(idea)}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 text-xs flex items-start gap-3 cursor-pointer ${
                      isIdeaSelected
                        ? "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                        : "bg-white/5 border-white/5 hover:border-white/15 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border ${
                      isIdeaSelected
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-slate-900 text-slate-400 border-slate-850"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="leading-relaxed flex-grow font-medium">{idea}</span>
                    {isIdeaSelected && (
                      <Icons.CheckCircle2 className="w-4 h-4 shrink-0 text-purple-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
