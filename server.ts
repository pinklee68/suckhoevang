import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client with error handling
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables. Please add it via the Settings > Secrets menu in AI Studio.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// API endpoint to generate video scripts
app.post("/api/generate-script", async (req, res) => {
  try {
    const { category, idea, num_scenes } = req.body;

    if (!category || !idea || !num_scenes) {
      return res.status(400).json({ error: "Missing required parameters: category, idea, and num_scenes are required." });
    }

    const client = getGeminiClient();

    const systemInstruction = `Bạn là một biên kịch và đạo diễn nghệ thuật chuyên nghiệp chuyên tạo ra nội dung video viral ngắn (TikTok, Shorts, Reels) phong cách hoạt hình 3D (Pixar/Disney/Chibi dễ thương) lung linh, thần tiên về chủ đề sức khỏe và các mẹo chữa bệnh dân gian.
Nhiệm vụ của bạn là viết một kịch bản hoàn chỉnh dựa trên ý tưởng và danh mục được chọn, chia thành số phân cảnh đúng như yêu cầu.

YÊU CẦU NỘI DUNG VÀ MỸ THUẬT (Cực kỳ ngắn gọn để tối ưu hóa tốc độ phản hồi của AI):
1. Tone giọng kịch bản: Hấp dẫn, kích thích tò mò ngay giây đầu tiên, nhịp độ nhanh gọn, vui tươi hoặc ấm áp sâu sắc.
2. Phong cách hình ảnh cực kỳ lộng lẫy ("lung linh - màu sắc nổi bật"): Hoạt hình dễ thương, màu sắc rực rỡ ấm áp, có hiệu ứng phát sáng kì ảo (glowing herbs, magical dust, sparkling particles).
3. Lời thoại (voiceover_vi): CỰC KỲ NGẮN GỌN (Tối đa 20 từ mỗi cảnh), phù hợp cho lồng tiếng nhanh hoặc AI đọc.
4. Mô tả bối cảnh (visual_description_vi): NGẮN GỌN (Tối đa 20 từ mỗi cảnh), tả biểu cảm và bối cảnh chính.
5. Prompt tạo ảnh (image_prompt_en): Viết bằng tiếng Anh, CÔ ĐỌNG (Tối đa 35 từ), tả nhân vật 3D Pixar, biểu cảm rực rỡ, ánh sáng phát sáng huyền ảo.
6. Prompt tạo video (video_prompt_en): Viết bằng tiếng Anh, tự vận hành và đầy đủ (self-contained). Prompt này BẮT BUỘC phải tích hợp đầy đủ cả 3 phần sau vào trong một đoạn mô tả liền mạch bằng tiếng Anh:
   - [HÌNH ẢNH / VISUALS]: Mô tả bối cảnh hoạt hình chi tiết, nhân vật chính, quần áo, bối cảnh xung quanh và ánh sáng huyền ảo (ví dụ: "A detailed 3D Pixar style cute bear doctor wearing a small stethoscope, standing in a cozy magical clinic with shelves of glowing herb jars...").
   - [CHUYỂN ĐỘNG / MOTION]: Hành động của nhân vật, cử chỉ tay chân, nháy mắt, biểu cảm nét mặt sinh động và chuyển động của camera zoom/pan mượt mà (ví dụ: "...gently gesturing with his paws while talking, camera slowly zooms in on his warm face, glowing dust particles swirling in the air...").
   - [LỜI THOẠI / DIALOGUE]: Trạng thái nhân vật đang nói lời thoại gì (dịch từ voiceover_vi sang tiếng Anh) với khẩu hình khớp tự nhiên (ví dụ: "...the doctor is speaking warmly with natural lip sync: 'Have you ever suffered from this pain? Don't worry, I have a magical cure!'").
   Hãy kết hợp cả 3 phần (Hình ảnh, Chuyển động, Lời thoại) thành một đoạn prompt tiếng Anh mạch lạc, mô tả rõ nét hành vi và lời thoại của nhân vật hoạt hình để người dùng dán vào các AI tạo video (như Kling, Runway, Luma) là tạo ra video hoàn chỉnh ngay lập tức.

Dữ liệu phản hồi phải tuân thủ nghiêm ngặt theo cấu trúc JSON định nghĩa sẵn và KHÔNG chứa các văn bản mô tả dài dòng không cần thiết để đảm bảo phản hồi nhanh chóng.`;

    const prompt = `Hãy tạo một kịch bản video hoạt hình sức khỏe lung linh cho:
- Danh mục: ${category}
- Ý tưởng / Chủ đề: ${idea}
- Số phân cảnh: ${num_scenes}

Hãy đảm bảo có chính xác ${num_scenes} phân cảnh trong mảng 'scenes'.`;

    let response: any = null;
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini API] Attempting generation with model: ${modelName}`);
        response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 1.0,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Tiêu đề kịch bản hấp dẫn, giật gân kích thích tò mò"
                },
                target_audience: {
                  type: Type.STRING,
                  description: "Đối tượng người xem mục tiêu"
                },
                vibe: {
                  type: Type.STRING,
                  description: "Tông màu và phong cách mỹ thuật tổng thể (ví dụ: Ấm áp vàng óng, xanh thảo dược lung linh)"
                },
                scenes: {
                  type: Type.ARRAY,
                  description: "Danh sách các phân cảnh kịch bản",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      scene_number: {
                        type: Type.INTEGER,
                        description: "Số thứ tự phân cảnh, từ 1 đến N"
                      },
                      scene_title: {
                        type: Type.STRING,
                        description: "Tên ngắn gọn của phân cảnh"
                      },
                      visual_description_vi: {
                        type: Type.STRING,
                        description: "Mô tả bối cảnh và hành động nhân vật chi tiết bằng tiếng Việt"
                      },
                      voiceover_vi: {
                        type: Type.STRING,
                        description: "Lời thoại hoặc lời thuyết minh tiếng Việt cực hay, hấp dẫn"
                      },
                      image_prompt_en: {
                        type: Type.STRING,
                        description: "Prompt tiếng Anh cực kỳ chi tiết dùng để tạo ảnh hoạt hình 3D lung linh rực rỡ"
                      },
                      video_prompt_en: {
                        type: Type.STRING,
                        description: "Prompt tiếng Anh cực kỳ chi tiết dùng để tạo video hoạt hình chuyển động mượt mà"
                      },
                      caption_vi: {
                        type: Type.STRING,
                        description: "Chữ hiển thị trên màn hình (subtitle hoặc headline ngắn gọn)"
                      },
                      sound_effect: {
                        type: Type.STRING,
                        description: "Gợi ý âm thanh hiệu ứng (ví dụ: tiếng nhạc phép thuật lấp lánh, tiếng sấm nhẹ)"
                      }
                    },
                    required: [
                      "scene_number",
                      "scene_title",
                      "visual_description_vi",
                      "voiceover_vi",
                      "image_prompt_en",
                      "video_prompt_en",
                      "caption_vi",
                      "sound_effect"
                    ]
                  }
                }
              },
              required: ["title", "target_audience", "vibe", "scenes"]
            }
          }
        });

        if (response && response.text) {
          console.log(`[Gemini API] Successfully generated content using ${modelName}`);
          break; // Exit loop on success
        }
      } catch (err: any) {
        console.warn(`[Gemini API] Failed generation with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Không nhận được phản hồi hợp lệ từ bất kỳ mô hình AI nào.");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Không nhận được phản hồi hợp lệ từ mô hình AI.");
    }

    const scriptData = JSON.parse(resultText);
    res.json({ success: true, data: scriptData });

  } catch (error: any) {
    console.error("Error generating script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Đã xảy ra lỗi trong quá trình tạo kịch bản."
    });
  }
});

// API endpoint to generate image using Gemini Imagen 3
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, imageModel } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables. Please add it via Settings.");
    }

    let finalPrompt = prompt;
    if (imageModel === "nano-banana") {
      // Inject gorgeous banana-yellow whimsical vibes and ultra-vibrant colors
      finalPrompt = `${prompt}, nano banana art style, super cute and ultra vibrant golden yellow palette, magical banana-yellow glowing dust, high-contrast cozy whimsical 3D look`;
      console.log(`[Nano Banana Mode] Enhancing prompt: "${finalPrompt}"`);
    } else {
      console.log(`[Gemini API REST] Generating image with prompt: "${prompt}" and aspect ratio: "${aspectRatio || "1:1"}"`);
    }

    // Ensure valid aspect ratio or default to "1:1"
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const targetAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    let base64Image = "";
    let success = false;
    let errMessage = "";

    // 1. Try v1 REST API endpoint (Stable)
    try {
      console.log(`[Gemini API REST] Attempting generateImages via v1 endpoint...`);
      const restUrl = `https://generativelanguage.googleapis.com/v1/models/imagen-3.0-generate-002:generateImages?key=${apiKey}`;
      const response = await fetch(restUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: targetAspectRatio
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.generatedImages && data.generatedImages.length > 0) {
          base64Image = data.generatedImages[0].image.imageBytes;
          success = true;
          console.log(`[Gemini API REST] Success with v1 REST API!`);
        }
      } else {
        const errText = await response.text();
        errMessage = `v1 failed: ${response.status} - ${errText}`;
        console.warn(`[Gemini API REST] v1 failed:`, errText);
      }
    } catch (e: any) {
      errMessage = `v1 exception: ${e.message}`;
      console.warn(`[Gemini API REST] v1 exception:`, e);
    }

    // 2. Try v1beta REST API endpoint as fallback
    if (!success) {
      try {
        console.log(`[Gemini API REST] Attempting generateImages via v1beta endpoint...`);
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${apiKey}`;
        const response = await fetch(restUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: finalPrompt,
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: targetAspectRatio
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.generatedImages && data.generatedImages.length > 0) {
            base64Image = data.generatedImages[0].image.imageBytes;
            success = true;
            console.log(`[Gemini API REST] Success with v1beta REST API!`);
          }
        } else {
          const errText = await response.text();
          errMessage += ` | v1beta failed: ${response.status} - ${errText}`;
          console.warn(`[Gemini API REST] v1beta failed:`, errText);
        }
      } catch (e: any) {
        errMessage += ` | v1beta exception: ${e.message}`;
        console.warn(`[Gemini API REST] v1beta exception:`, e);
      }
    }

    if (success && base64Image) {
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      return res.json({ success: true, imageUrl, isPlaceholder: false });
    } else {
      // 3. Robust Fallback: provide a beautifully seed-based custom placeholder that matches aspect ratios perfectly
      console.log(`[Gemini API REST] Fallback to Picsum seed placeholder due to API restrictions`);
      
      const seedWord = encodeURIComponent(prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "") || "health");
      let width = 512;
      let height = 512;
      
      if (targetAspectRatio === "16:9") { width = 896; height = 504; }
      else if (targetAspectRatio === "9:16") { width = 504; height = 896; }
      else if (targetAspectRatio === "4:3") { width = 640; height = 480; }
      else if (targetAspectRatio === "3:4") { width = 480; height = 640; }

      const imageUrl = `https://picsum.photos/seed/${seedWord}/${width}/${height}?blur=1`;
      return res.json({ 
        success: true, 
        imageUrl, 
        isPlaceholder: true, 
        errorDetails: errMessage 
      });
    }

  } catch (error: any) {
    console.error("Error in generate-image routing:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Đã xảy ra lỗi trong quá trình tạo ảnh bằng AI."
    });
  }
});

// Setup dev vs production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Setup Vite middleware for real-time asset rendering in dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware integrated.");
  } else {
    // In production, serve the pre-built files from standard 'dist' directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
