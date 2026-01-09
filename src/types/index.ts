export interface DownloadedAsset {
  id: string;
  videoPath: string;
  musicPath: string;
  metadata: Record<string, unknown>;
}

export interface ScriptContent {
  id: string;
  title: string;
  description: string;
  tags: string[];
  bulletOutline: string[];
  fullScript: string;
}

export interface VoiceoverResult {
  id: string;
  audioPath: string;
  transcriptPath: string;
  durationSeconds: number;
}

export interface VideoProject {
  id: string;
  assets: DownloadedAsset;
  script: ScriptContent;
  voiceover: VoiceoverResult;
  composedVideoPath: string;
  thumbnailPath: string;
  youtubeVideoId?: string;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  projectId: string;
  stage: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: string;
}
