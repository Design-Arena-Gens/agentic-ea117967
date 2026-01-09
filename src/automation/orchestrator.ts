import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { runDownloader } from "@/agents/downloader";
import { runScriptWriter } from "@/agents/script-writer";
import { runVoiceover } from "@/agents/voiceover";
import { composeVideo } from "@/agents/video-creator";
import { generateThumbnail } from "@/agents/thumbnail-creator";
import { publishToYouTube } from "@/agents/youtube-publisher";
import { logError, logInfo } from "@/lib/logger";
import { ensureDir } from "@/lib/storage";
import { VideoProject } from "@/types";
import { env } from "@/lib/env";

function persistProject(project: VideoProject) {
  const projectDir = path.join(env.storageRoot, project.id);
  ensureDir(projectDir);
  fs.writeFileSync(
    path.join(projectDir, "project.json"),
    JSON.stringify(project, null, 2),
    "utf8"
  );
}

export async function runAutomationCycle() {
  const projectId = uuid();
  const createdAt = new Date().toISOString();
  logInfo(projectId, "automation", "Starting full automation cycle");

  try {
    const assets = await runDownloader(projectId);
    const script = await runScriptWriter(projectId);
    const voiceover = await runVoiceover(projectId, script.fullScript);
    const composedVideoPath = await composeVideo(projectId, assets, voiceover);
    const thumbnailPath = await generateThumbnail(
      projectId,
      script.title,
      script.bulletOutline
    );
    const publishResult = await publishToYouTube(
      projectId,
      script,
      composedVideoPath,
      thumbnailPath
    );

    const project: VideoProject = {
      id: projectId,
      createdAt,
      assets,
      script,
      voiceover,
      composedVideoPath,
      thumbnailPath,
      youtubeVideoId: publishResult.videoId
    };

    persistProject(project);
    logInfo(projectId, "automation", `Automation cycle completed: ${publishResult.url}`);

    return project;
  } catch (error) {
    logError(projectId, "automation", "Automation cycle failed", error);
    throw error;
  }
}
