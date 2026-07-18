export interface Scene {
  scene_number: number;
  scene_title: string;
  visual_description_vi: string;
  voiceover_vi: string;
  image_prompt_en: string;
  video_prompt_en: string;
  caption_vi: string;
  sound_effect: string;
}

export interface ScriptData {
  title: string;
  target_audience: string;
  vibe: string;
  scenes: Scene[];
}

export interface ScriptHistoryItem {
  id: string;
  timestamp: string;
  category: string;
  idea: string;
  num_scenes: number;
  script: ScriptData;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  color: string; // CSS gradient class or tailwind color
  ideas: string[];
}
