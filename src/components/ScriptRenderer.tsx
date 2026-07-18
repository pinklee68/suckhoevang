import { useState } from "react";
import { Scene, ScriptData } from "../types";
import { 
  Copy, Check, FileText, Download, Sparkles, Image, Video, 
  Volume2, Music, Clapperboard, HelpCircle, Eye, RefreshCw
} from "lucide-react";
import { motion } from "motion/react";

interface ScriptRendererProps {
  script: ScriptData;
  onRegenerate: () => void;
  artStyleLabel: string;
  characterRoleLabel: string;
  aspectRatio: string;
  imageModel: string;
}

export default function ScriptRenderer({
  script,
  onRegenerate,
  artStyleLabel,
  characterRoleLabel,
  aspectRatio,
  imageModel,
}: ScriptRendererProps) {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"cards" | "document">("cards");
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [isPlaceholderImages, setIsPlaceholderImages] = useState<Record<number, boolean>>({});
  const [generatingStates, setGeneratingStates] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});

  const handleGenerateImage = async (sceneNumber: number, basePrompt: string) => {
    setGeneratingStates((prev) => ({ ...prev, [sceneNumber]: true }));
    setImageErrors((prev) => ({ ...prev, [sceneNumber]: "" }));
    try {
      const fullPrompt = `${basePrompt}${styleAppend}`;
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: aspectRatio,
          imageModel: imageModel,
        }),
      });

      let result: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("Không nhận được phản hồi JSON hợp lệ từ máy chủ.");
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể tạo ảnh từ máy chủ.");
      }

      setGeneratedImages((prev) => ({ ...prev, [sceneNumber]: result.imageUrl }));
      setIsPlaceholderImages((prev) => ({ ...prev, [sceneNumber]: !!result.isPlaceholder }));
    } catch (err: any) {
      console.error("Lỗi khi tạo ảnh phân cảnh:", err);
      setImageErrors((prev) => ({ 
        ...prev, 
        [sceneNumber]: err.message || "Đã xảy ra lỗi khi tạo ảnh bằng AI." 
      }));
    } finally {
      setGeneratingStates((prev) => ({ ...prev, [sceneNumber]: false }));
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi copy:", err);
    }
  };

  const copyFullScript = () => {
    let fullText = `=== KỊCH BẢN VIDEO VIRAL SỨC KHỎE ===\n`;
    fullText += `Tiêu đề: ${script.title}\n`;
    fullText += `Đối tượng mục tiêu: ${script.target_audience}\n`;
    fullText += `Phong cách tổng thể: ${script.vibe}\n`;
    fullText += `Phong cách hoạt hình: ${artStyleLabel}\n`;
    fullText += `Nhân vật chính: ${characterRoleLabel}\n`;
    fullText += `Tỷ lệ khung hình: ${aspectRatio}\n\n`;

    script.scenes.forEach((scene) => {
      fullText += `------------------------------------\n`;
      fullText += `PHÂN CẢNH ${scene.scene_number}: ${scene.scene_title}\n`;
      fullText += `Mô tả bối cảnh: ${scene.visual_description_vi}\n`;
      fullText += `Lời thoại (Voiceover): "${scene.voiceover_vi}"\n`;
      fullText += `Chữ hiển thị (Caption): ${scene.caption_vi}\n`;
      fullText += `Âm thanh (Sound): ${scene.sound_effect}\n`;
      fullText += `Prompt vẽ ảnh (Midjourney): ${scene.image_prompt_en}\n`;
      fullText += `Prompt tạo video (Kling/Runway): ${scene.video_prompt_en}\n\n`;
    });

    handleCopy(fullText, "full-script");
  };

  const downloadScriptAsTxt = () => {
    let fullText = `=== KỊCH BẢN VIDEO VIRAL SỨC KHỎE ===\n`;
    fullText += `Tiêu đề: ${script.title}\n`;
    fullText += `Đối tượng mục tiêu: ${script.target_audience}\n`;
    fullText += `Phong cách tổng thể: ${script.vibe}\n`;
    fullText += `Phong cách hoạt hình: ${artStyleLabel}\n`;
    fullText += `Nhân vật chính: ${characterRoleLabel}\n`;
    fullText += `Tỷ lệ khung hình: ${aspectRatio}\n\n`;

    script.scenes.forEach((scene) => {
      fullText += `------------------------------------\n`;
      fullText += `PHÂN CẢNH ${scene.scene_number}: ${scene.scene_title}\n`;
      fullText += `Mô tả bối cảnh: ${scene.visual_description_vi}\n`;
      fullText += `Lời thoại (Voiceover): "${scene.voiceover_vi}"\n`;
      fullText += `Chữ hiển thị (Caption): ${scene.caption_vi}\n`;
      fullText += `Âm thanh (Sound): ${scene.sound_effect}\n`;
      fullText += `Prompt vẽ ảnh (Midjourney): ${scene.image_prompt_en}\n`;
      fullText += `Prompt tạo video (Kling/Runway): ${scene.video_prompt_en}\n\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `kich-ban-${script.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const styleAppend = `, 3D cartoon style, pixar character design, cute chubby features, warm glow, soft shadows, extremely detailed, beautiful lighting, 8k --ar ${aspectRatio === "9:16" ? "9:16" : "16:9"}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Script Header Card */}
      <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/10 p-5 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 flex-1">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 inline-flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" />
              PREVIEW KỊCH BẢN HOẠT HÌNH
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tight leading-tight">
              "{script.title}"
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">🎯 Người xem</span>
                <span className="text-blue-400 font-bold text-xs">{script.target_audience}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">✨ Phong cách</span>
                <span className="text-purple-400 font-bold text-xs capitalize">{script.vibe}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl col-span-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">🎭 Người dẫn truyện</span>
                <span className="text-blue-400 font-bold text-xs truncate block">{characterRoleLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end">
            <button
              onClick={copyFullScript}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-105 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
            >
              {copiedStates["full-script"] ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép Tất Cả</span>
                </>
              )}
            </button>

            <button
              onClick={downloadScriptAsTxt}
              className="flex-1 md:flex-initial px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Tải File .TXT</span>
            </button>

            <button
              onClick={onRegenerate}
              className="flex-1 md:flex-initial px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 text-slate-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tạo Lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs (Beautiful custom capsule bento tabs) */}
      <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("cards")}
          className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "cards"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Phân Cảnh Storyboard
        </button>
        <button
          onClick={() => setActiveTab("document")}
          className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "document"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Tài Liệu Toàn Cảnh
        </button>
      </div>

      {/* Tab: Storyboard view */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {script.scenes.map((scene, idx) => {
            const scKey = `scene-${scene.scene_number}`;
            const voiceoverKey = `${scKey}-vo`;
            const imgKey = `${scKey}-img`;
            const vidKey = `${scKey}-vid`;

            return (
              <motion.div
                key={scene.scene_number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                {/* Custom Left Gradient line indicator matching bento sample */}
                <div className="absolute -left-2.5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-50"></div>
                
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 transition-all hover:bg-white/10">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-xs font-black tracking-widest text-blue-400 uppercase">
                      PHÂN CẢNH {scene.scene_number} / {script.scenes.length}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/5 text-slate-400">
                      Thời lượng: {5 + (scene.scene_number % 3)}s
                    </span>
                  </div>

                  {/* Visual scene details & Voiceover */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Scene text, caption and sound */}
                    <div className="lg:col-span-5 space-y-3.5">
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-300">
                          {scene.scene_title}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          <span className="text-slate-500 font-bold">Mô tả cảnh:</span> {scene.visual_description_vi}
                        </p>
                      </div>

                      {/* Dialogue Voiceover box styled like bento */}
                      <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Lời thoại (Voiceover)
                          </span>
                          <button
                            onClick={() => handleCopy(scene.voiceover_vi, voiceoverKey)}
                            className="text-slate-500 hover:text-white transition-all cursor-pointer p-1"
                          >
                            {copiedStates[voiceoverKey] ? (
                              <Check className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs italic text-slate-200 mt-1 uppercase font-semibold leading-relaxed">
                          "{scene.voiceover_vi}"
                        </p>
                      </div>

                      {/* Caption & sound layout */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                        <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                          <span className="block text-slate-500 font-bold uppercase tracking-wide">Chữ chạy video:</span>
                          <span className="text-white font-medium">{scene.caption_vi}</span>
                        </div>
                        <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                          <span className="block text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1">
                            <Music className="w-3 h-3 text-indigo-400" />
                            Hiệu ứng âm:
                          </span>
                          <span className="text-blue-400 font-bold">{scene.sound_effect}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prompts on the right */}
                    <div className="lg:col-span-7 space-y-3">
                      {/* Image Prompt Card */}
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors relative">
                        <div className="flex justify-between items-center mb-1 flex-wrap gap-1.5">
                          <span className="text-[9px] text-blue-400 font-bold tracking-wider block uppercase">PROMPT ẢNH (AI IMAGE - MIDJOURNEY)</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleGenerateImage(scene.scene_number, scene.image_prompt_en)}
                              disabled={generatingStates[scene.scene_number]}
                              className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500 disabled:hover:bg-indigo-500/20 text-indigo-300 hover:text-slate-950 disabled:hover:text-indigo-300 font-black tracking-wide transition-all flex items-center gap-1 cursor-pointer border border-indigo-500/30 disabled:opacity-50"
                            >
                              {generatingStates[scene.scene_number] ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  Đang vẽ...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  Tạo ảnh AI
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(scene.image_prompt_en + styleAppend, imgKey)}
                              className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-500/20"
                            >
                              {copiedStates[imgKey] ? "Đã chép!" : "Copy + Style vẽ"}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto">
                          {scene.image_prompt_en} <span className="text-amber-400/70">{styleAppend}</span>
                        </p>
                      </div>

                      {/* Video Prompt Card */}
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-blue-400 font-bold tracking-wider block uppercase">PROMPT VIDEO (AI VIDEO - KLING/RUNWAY)</span>
                          <button
                            onClick={() => handleCopy(scene.video_prompt_en, vidKey)}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-500/20"
                          >
                            {copiedStates[vidKey] ? "Đã chép!" : "Copy Video Prompt"}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto">
                          {scene.video_prompt_en}
                        </p>
                      </div>

                      {/* Generated Image Result Card */}
                      {(generatingStates[scene.scene_number] || generatedImages[scene.scene_number] || imageErrors[scene.scene_number]) && (
                        <div className="p-3 bg-gradient-to-b from-slate-950/90 to-slate-900/90 rounded-2xl border border-white/10 relative overflow-hidden transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                                            {generatedImages[scene.scene_number] && (
                              <button
                                onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = generatedImages[scene.scene_number];
                                  a.download = `scene-${scene.scene_number}.jpg`;
                                  a.click();
                                }}
                                className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-bold transition-all cursor-pointer flex items-center gap-1 border border-blue-500/20"
                              >
                                <Download className="w-3 h-3" />
                                Tải ảnh xuống
                              </button>
                            )}
                          </div>

                          {generatingStates[scene.scene_number] && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-white/5 rounded-xl border border-white/5 min-h-[150px]">
                              <div className="relative">
                                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                <Sparkles className="w-4 h-4 text-indigo-400 absolute top-3 right-3 animate-pulse" />
                              </div>
                              <div className="text-center px-4">
                                <p className="text-xs text-indigo-300 font-semibold">Gemini đang vẽ tranh hoạt hình...</p>
                                <p className="text-[10px] text-slate-500 mt-1 max-w-[250px] mx-auto">Vẽ phong cách 3D Disney/Pixar theo bối cảnh kịch bản</p>
                              </div>
                            </div>
                          )}

                          {imageErrors[scene.scene_number] && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 space-y-1">
                              <p className="font-semibold">Lỗi tạo ảnh:</p>
                              <p className="text-rose-400/90 leading-relaxed">{imageErrors[scene.scene_number]}</p>
                              <button
                                onClick={() => handleGenerateImage(scene.scene_number, scene.image_prompt_en)}
                                className="mt-1.5 text-[10px] bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white px-2.5 py-1 rounded-full border border-rose-500/30 transition-all font-bold cursor-pointer inline-block"
                              >
                                Thử vẽ lại
                              </button>
                            </div>
                          )}

                          {generatedImages[scene.scene_number] && !generatingStates[scene.scene_number] && (
                            <div className="space-y-2">
                              {isPlaceholderImages[scene.scene_number] && (
                                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 leading-relaxed">
                                  ⚠️ <strong>Đang hiển thị ảnh minh họa mẫu:</strong> API Key hiện tại chưa kích hoạt Imagen 3 hoặc bị hạn chế vùng địa lý trong Google Cloud. Bạn vẫn có thể sao chép prompt vẽ tranh ở trên để vẽ thủ công trên Midjourney, Canva, Leonardo AI.
                                </div>
                              )}
                              <div className="relative group/img overflow-hidden rounded-xl border border-white/10 bg-black/50">
                                <img
                                  src={generatedImages[scene.scene_number]}
                                  alt={`Scene ${scene.scene_number} generated art`}
                                  className="w-full h-auto object-cover max-h-[350px] rounded-xl transition-transform duration-500 group-hover/img:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                  <p className="text-[10px] text-slate-300 line-clamp-2 italic">
                                    "{scene.image_prompt_en}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick notice */}
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pl-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Mẹo: Bạn có thể nhấn nút "Tạo ảnh AI" để vẽ hình ảnh minh họa cho phân cảnh này ngay lập tức.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tab: Full Document view */}
      {activeTab === "document" && (
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md max-w-4xl mx-auto space-y-5">
          <div className="border-b border-white/10 pb-4 text-center space-y-1.5">
            <h3 className="text-lg font-black text-white italic">"{script.title}"</h3>
            <p className="text-xs text-slate-400">
              Đối tượng: {script.target_audience} | Mỹ thuật: {script.vibe} | Tỷ lệ: {aspectRatio}
            </p>
          </div>

          <div className="space-y-5">
            {script.scenes.map((scene) => (
              <div key={scene.scene_number} className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">
                  Phân cảnh {scene.scene_number}: {scene.scene_title}
                </h4>
                <div className="pl-3.5 border-l border-white/10 text-slate-300 text-xs space-y-2">
                  <p>
                    <span className="font-bold text-slate-400">Mô tả bối cảnh:</span>{" "}
                    {scene.visual_description_vi}
                  </p>
                  <p className="text-slate-200 bg-white/5 p-3 rounded-2xl border border-white/5 font-semibold uppercase italic tracking-wide">
                    <span className="font-bold text-blue-400 not-italic block text-[9px] tracking-widest uppercase mb-1">
                      Lời thoại lồng tiếng (Voiceover):
                    </span>
                    "{scene.voiceover_vi}"
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">Phụ đề trên video:</span>{" "}
                    {scene.caption_vi}
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">Âm thanh:</span> {scene.sound_effect}
                  </p>
                  <p className="text-[11px] text-slate-300 break-all bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
                    <span className="font-bold text-purple-400 font-sans block mb-1 text-[10px] uppercase">Prompt vẽ ảnh Midjourney:</span>
                    {scene.image_prompt_en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
