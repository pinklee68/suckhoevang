import { Users, Film, Compass, Columns, Image } from "lucide-react";

interface ExtraSettingsProps {
  numScenes: number;
  setNumScenes: (num: number) => void;
  artStyle: string;
  setArtStyle: (style: string) => void;
  characterRole: string;
  setCharacterRole: (role: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  imageModel: string;
  setImageModel: (model: string) => void;
}

const ART_STYLES = [
  { id: "3d-pixar", name: "3D Disney/Pixar", desc: "Màu sắc ấm, nhân vật tròn trịa đáng yêu, mắt to tròn" },
  { id: "ghibli", name: "Anime Thần Tiên (Ghibli)", desc: "Tranh vẽ tay thơ mộng, thiên nhiên xanh mát rực rỡ" },
  { id: "claymation", name: "Đất Sét Claymation", desc: "Phong cách búp bê đất sét thủ công siêu tinh tế, ngộ nghĩnh" },
  { id: "chibi", name: "Chibi Kawaii", desc: "Nhân vật siêu lùn, đầu to má phúng phính cực kỳ dễ thương" },
  { id: "neon-cyber", name: "Cyberpunk Thảo Mộc", desc: "Phong cách phát sáng dạ quang, neon hiện đại pha trộn cổ kính" },
];

const CHARACTER_ROLES = [
  { id: "bac-si-gau", name: "Bác Sĩ Gấu Bông", desc: "Chú gấu nâu hiền lành mang ống nghe, luôn mỉm cười" },
  { id: "bac-si-cu", name: "Bác Sĩ Cú Tinh Anh", desc: "Cụ cú mèo thông thái đeo kính tròn, đọc sách cổ" },
  { id: "tien-tu-thao-duoc", name: "Tiên Tử Thảo Dược", desc: "Cô bé tiên nhỏ xinh đẹp có đôi cánh lá cây lấp lánh" },
  { id: "ba-ngoai", name: "Bà Ngoại Nhân Hậu", desc: "Người bà tóc bạc ấm áp, hay kể mẹo xưa bên bếp lửa" },
  { id: "cau-be-to-mo", name: "Cậu Bé Sóc Nhỏ", desc: "Cậu bé tinh nghịch hay tò mò học hỏi các mẹo chữa bệnh" },
];

const IMAGE_MODELS = [
  { id: "nano-banana", name: "Nano Banana (Premium)", desc: "Màu sắc vàng rực rỡ, ngộ nghĩnh và cực kỳ dễ thương." },
  { id: "imagen-3", name: "Imagen 3 (Google Cloud)", desc: "Chi tiết sắc nét, chân thực và chuyên nghiệp chuẩn điện ảnh." },
];

export default function ExtraSettings({
  numScenes,
  setNumScenes,
  artStyle,
  setArtStyle,
  characterRole,
  setCharacterRole,
  aspectRatio,
  setAspectRatio,
  imageModel,
  setImageModel,
}: ExtraSettingsProps) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-md space-y-5">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full pointer-events-none" />

      <div>
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" />
          3. TÙY CHỈNH PHONG CÁCH & NHÂN VẬT
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Tối ưu hóa hình ảnh hoạt hình độc đáo để AI vẽ chính xác nhân vật dẫn truyện của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {/* Model tạo ảnh Nano Banana */}
        <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 mb-2">
              <Image className="w-3.5 h-3.5 text-amber-400" />
              Model Tạo Ảnh
            </label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
            >
              {IMAGE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2 line-clamp-2">
            {IMAGE_MODELS.find(m => m.id === imageModel)?.desc}
          </p>
        </div>

        {/* Number of scenes (capsule styled bento component) */}
        <div className="space-y-2.5 bg-black/20 p-4 rounded-2xl border border-white/5">
          <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-blue-400" />
            Số phân cảnh
          </label>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumScenes(num)}
                className={`flex-1 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  numScenes === num
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(59,130,241,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">Mỗi cảnh dài trung bình 5-8 giây.</p>
        </div>

        {/* Aspect Ratio (capsule styled bento component) */}
        <div className="space-y-2.5 bg-black/20 p-4 rounded-2xl border border-white/5">
          <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-blue-400" />
            Tỷ lệ khung hình
          </label>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
            {[
              { label: "9:16", val: "9:16" },
              { label: "16:9", val: "16:9" }
            ].map((ratio) => (
              <button
                key={ratio.val}
                type="button"
                onClick={() => setAspectRatio(ratio.val)}
                className={`flex-1 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  aspectRatio === ratio.val
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(59,130,241,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">Dọc cho Shorts/TikTok, ngang cho YouTube.</p>
        </div>

        {/* Art Style */}
        <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 mb-2">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              Nghệ thuật AI
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
            >
              {ART_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2 line-clamp-2">
            {ART_STYLES.find(s => s.id === artStyle)?.desc}
          </p>
        </div>

        {/* Character Role */}
        <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Người dẫn chuyện
            </label>
            <select
              value={characterRole}
              onChange={(e) => setCharacterRole(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
            >
              {CHARACTER_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2 line-clamp-2">
            {CHARACTER_ROLES.find(r => r.id === characterRole)?.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
