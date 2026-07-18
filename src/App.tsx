import { useState, useEffect } from "react";
import Header from "./components/Header";
import CategorySelector from "./components/CategorySelector";
import ExtraSettings from "./components/ExtraSettings";
import ScriptRenderer from "./components/ScriptRenderer";
import SavedHistory from "./components/SavedHistory";
import { Category, ScriptData, ScriptHistoryItem } from "./types";
import { 
  Sparkles, AlertCircle, RefreshCw, Wand2, Lightbulb, 
  HelpCircle, CheckCircle2, ChevronRight, HeartPulse, History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WAITING_TIPS = [
  "Bác Sĩ Gấu đang chuẩn bị ống nghe và giã gừng tươi để xông hơi...",
  "Cụ Cú Mèo đang mở cuốn bí kíp y thuật cổ để tra cứu các huyệt đạo...",
  "Tiên Tử Thảo Dược đang dệt tơ sương mai và rắc nhũ vàng lấp lánh lên tía tô...",
  "Đang sắc thuốc sắc thơm lừng: Gừng nướng, sả vàng và mật ong rừng lấp lánh...",
  "Đang đo vẽ kích thước khung hình hoạt hình chuẩn dọc 9:16 cho kênh TikTok của bạn...",
  "Đang tinh chỉnh lời bình thoại lôi cuốn kích thích người xem tò mò trong 3 giây đầu...",
  "Đang pha chế bối cảnh 3D Pixar tươi tắn, ngập tràn ánh nắng ấm áp...",
  "Đang soạn thảo prompt tạo ảnh chi tiết và prompt tạo chuyển động video sinh động..."
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<string>("");
  const [numScenes, setNumScenes] = useState<number>(4);
  const [artStyle, setArtStyle] = useState<string>("3d-pixar");
  const [characterRole, setCharacterRole] = useState<string>("bac-si-gau");
  const [aspectRatio, setAspectRatio] = useState<string>("9:16");
  const [imageModel, setImageModel] = useState<string>("nano-banana");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTipIdx, setLoadingTipIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<ScriptData | null>(null);
  const [history, setHistory] = useState<ScriptHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("viral_health_script_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Lỗi khi tải lịch sử kịch bản:", e);
    }
  }, []);

  // Save history to localStorage on change
  const saveHistoryToLocalStorage = (newHistory: ScriptHistoryItem[]) => {
    try {
      localStorage.setItem("viral_health_script_history", JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error("Lỗi khi lưu lịch sử kịch bản:", e);
    }
  };

  // Cycling waiting tips
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTipIdx((prev) => (prev + 1) % WAITING_TIPS.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!selectedCategory || !selectedIdea) {
      setError("Vui lòng chọn đầy đủ Danh mục sức khỏe và một Ý tưởng tương ứng ở Bước 1!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);
    setLoadingTipIdx(0);

    // Prepare custom attributes based on user settings to pass inside the prompt
    const artStyleLabel = getArtStyleLabel(artStyle);
    const characterRoleLabel = getCharacterRoleLabel(characterRole);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory.name,
          idea: `${selectedIdea} - Phong cách hoạt hình vẽ bằng AI: ${artStyleLabel}. Nhân vật dẫn chuyện chính xuyên suốt là: ${characterRoleLabel}. Tỷ lệ khung hình video: ${aspectRatio}.`,
          num_scenes: numScenes,
        }),
      });

      let result: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textError = await response.text();
        console.error("Server non-JSON response:", textError);
        throw new Error(`Máy chủ trả về kết quả không hợp lệ (Mã trạng thái: ${response.status}). Có thể máy chủ đang quá tải hoặc gặp sự cố. Vui lòng nhấn Thử lại sau ít giây.`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Đã xảy ra lỗi không xác định từ máy chủ khi tạo kịch bản.");
      }

      const scriptData: ScriptData = result.data;
      setGeneratedScript(scriptData);

      // Save to history list
      const timestampStr = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });

      const newHistoryItem: ScriptHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timestampStr,
        category: selectedCategory.name,
        idea: selectedIdea,
        num_scenes: numScenes,
        script: scriptData,
      };

      const updatedHistory = [newHistoryItem, ...history];
      saveHistoryToLocalStorage(updatedHistory);
      setActiveHistoryId(newHistoryItem.id);

    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Máy chủ AI quá tải hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: ScriptHistoryItem) => {
    setGeneratedScript(item.script);
    setActiveHistoryId(item.id);
    
    // Find matching category to pre-select, so the user knows what context is active
    const cat = selectedCategory; // keep current or find
    setSelectedIdea(item.idea);
    setError(null);

    // Auto scroll to generated script
    setTimeout(() => {
      document.getElementById("output-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistoryToLocalStorage(updated);
    if (activeHistoryId === id) {
      setGeneratedScript(null);
      setActiveHistoryId(undefined);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử kịch bản đã tạo không?")) {
      saveHistoryToLocalStorage([]);
      setGeneratedScript(null);
      setActiveHistoryId(undefined);
    }
  };

  const getArtStyleLabel = (id: string) => {
    switch (id) {
      case "3d-pixar": return "3D Disney/Pixar";
      case "ghibli": return "Anime Thần Tiên Ghibli";
      case "claymation": return "Đất Sét Claymation";
      case "chibi": return "Chibi Kawaii";
      case "neon-cyber": return "Cyberpunk Thảo Mộc";
      default: return "Hoạt hình dễ thương";
    }
  };

  const getCharacterRoleLabel = (id: string) => {
    switch (id) {
      case "bac-si-gau": return "Bác Sĩ Gấu Bông dễ thương đeo ống nghe";
      case "bac-si-cu": return "Cụ Cú Mèo thông thái đeo kính tròn";
      case "tien-tu-thao-duoc": return "Nàng Tiên Thảo Dược xinh xắn cánh lá phát sáng";
      case "ba-ngoai": return "Người Bà tóc bạc nhân hậu, kể chuyện mẹo dân gian";
      case "cau-be-to-mo": return "Cậu Bé Sóc Nhỏ ham học hỏi mẹo y học";
      default: return "Bác sĩ dễ thương";
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans relative overflow-x-hidden selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Sparkly Ambient Glowing Orbs Background */}
      <div className="absolute top-10 left-[10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] left-[20%] w-[30rem] h-[30rem] bg-blue-500/8 rounded-full blur-[90px] -z-10 pointer-events-none" />

      {/* Decorative stars */}
      <div className="absolute top-24 left-[15%] text-indigo-500/25 animate-ping text-lg pointer-events-none">✦</div>
      <div className="absolute top-48 right-[20%] text-amber-500/20 animate-pulse text-xl pointer-events-none">✦</div>
      <div className="absolute bottom-60 left-[8%] text-purple-500/15 animate-pulse text-2xl pointer-events-none">✦</div>
      <div className="absolute bottom-96 right-[15%] text-blue-400/25 animate-ping text-lg pointer-events-none">✦</div>

      {/* Top Header Logo & Intro */}
      <Header />

      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Grid: Input Fields & Config (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Category Selector Component */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedIdea={selectedIdea}
            onSelectIdea={setSelectedIdea}
          />

          {/* Settings Customizer Components */}
          <ExtraSettings
            numScenes={numScenes}
            setNumScenes={setNumScenes}
            artStyle={artStyle}
            setArtStyle={setArtStyle}
            characterRole={characterRole}
            setCharacterRole={setCharacterRole}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            imageModel={imageModel}
            setImageModel={setImageModel}
          />

          {/* Action Trigger Box */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none" />
            
            <div className="space-y-1 relative z-10">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <Wand2 className="w-4 h-4 text-blue-400" />
                HÔ BIẾN KỊCH BẢN VIRAL
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                Gemini AI sẽ viết kịch bản hấp dẫn với lời bình, prompt tạo ảnh hoạt hình chi tiết và prompt tạo video chuyển động.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full md:w-auto px-8 py-3.5 rounded-full font-black text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider ${
                isLoading
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.45)]"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Tạo Kịch Bản...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>BẮM ĐỂ TẠO KỊCH BẢN</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-rose-300">Lưu ý hệ thống</span>
                <p className="text-xs leading-relaxed text-rose-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Interactive Loading Screen / Brewing Stage */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-slate-950/90 p-8 rounded-3xl border border-white/10 text-center space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none" />
                
                {/* Brewing pot animation or circles */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full animate-ping opacity-20" />
                  <div className="absolute inset-1.5 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Wand2 className="w-6 h-6 text-blue-300 animate-pulse" />
                  </div>
                  {/* Bubbles floating up */}
                  <div className="absolute -top-1 left-5 w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="absolute -top-3 right-5 w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-white text-base tracking-wide uppercase">
                    ĐANG NGHIÊN CỨU SÁNG TẠO Y THUẬT...
                  </h3>
                  <p className="text-xs text-blue-300 font-bold italic leading-relaxed">
                    "{WAITING_TIPS[loadingTipIdx]}"
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-white/5 p-4 rounded-2xl border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-extrabold text-slate-300 block mb-1 uppercase tracking-wider text-[9px] text-blue-400">Mẹo hay làm video hoạt hình</span>
                  Hãy dùng ảnh nền nhất quán vẽ bằng Midjourney, sau đó tải lên Kling AI hoặc Luma Dream Machine để tạo các chuyển động nháy mắt, mỉm cười mượt mà của nhân vật.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Script Output Section */}
          <div id="output-section" className="scroll-mt-6">
            {generatedScript && (
              <ScriptRenderer
                script={generatedScript}
                onRegenerate={handleGenerate}
                artStyleLabel={getArtStyleLabel(artStyle)}
                characterRoleLabel={getCharacterRoleLabel(characterRole)}
                aspectRatio={aspectRatio}
                imageModel={imageModel}
              />
            )}
          </div>

        </div>

        {/* Right Grid: History & Quick Instructions (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Saved History Component */}
          <SavedHistory
            history={history}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
            activeId={activeHistoryId}
          />

          {/* Instructions Card */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] pointer-events-none" />
            
            <h3 className="text-xs font-black text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" />
              Cách Sử Dụng Kịch Bản
            </h3>
            
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span><b>Sao chép Lời thoại:</b> Dán vào công cụ chuyển giọng nói AI (như ElevenLabs, Vbee) hoặc trực tiếp ghi âm lồng tiếng thật hay.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span><b>Sao chép Prompt Ảnh:</b> Dán vào Midjourney hoặc Leonardo.ai để xuất ra các bức ảnh 3D hoạt hình rực rỡ, lung linh.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span><b>Sao chép Prompt Video:</b> Đưa ảnh đã vẽ lên Runway Gen-3, Kling AI hoặc Luma, kèm prompt tạo video để nhân vật chuyển động.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                <span><b>Ghép & Dựng:</b> Sử dụng CapCut hoặc Canva để ghép âm thanh, lồng hình ảnh/video hoạt hình, chèn phụ đề nhanh chóng để đăng lên kênh của bạn!</span>
              </li>
            </ul>
          </div>

          {/* Quick FAQ / Folk knowledge card */}
          <div className="bg-white/5 border border-white/5 p-4 rounded-3xl text-xs text-slate-400 leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-[40px] pointer-events-none" />
            <p className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Sức hút dân gian
            </p>
            Các chủ đề thảo dược thiên nhiên, tỏi, gừng, xông hơi, hay bấm huyệt rất được người xem lớn tuổi lẫn người trẻ yêu lối sống xanh ưa chuộng, có tỷ lệ lưu lại và chia sẻ video cực kỳ cao!
          </div>

        </div>

      </main>

      {/* Floating Zalo Contact Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        <a
          href="https://zalo.me/0888649819"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20 transition-all hover:scale-110 active:scale-95 animate-bounce relative group-hover:animate-none cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black">1</span>
          
          <img 
            src="https://img.icons8.com/color/48/zalo.png" 
            alt="Zalo Icon" 
            className="w-5 h-5 shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-blue-200 uppercase tracking-widest font-bold leading-none">Liên hệ Hỗ Trợ</span>
            <span className="text-xs leading-tight font-black font-mono mt-0.5">Zalo: 0888.649.819</span>
          </div>
        </a>
      </div>

    </div>
  );
}
