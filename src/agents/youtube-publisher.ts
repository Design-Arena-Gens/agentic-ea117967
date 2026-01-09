import fs from "fs";
import path from "path";
import { google, youtube_v3 } from "googleapis";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { ScriptContent } from "@/types";
import { createYouTubeClient } from "@/lib/google";

export interface PublishResult {
  videoId: string;
  url: string;
}

export async function publishToYouTube(
  projectId: string,
  script: ScriptContent,
  videoPath: string,
  thumbnailPath: string
): Promise<PublishResult> {
  const youtube = createYouTubeClient(projectId);

  logInfo(projectId, "youtube-upload", "Uploading video to YouTube");
  const uploadResponse = await youtube.videos.insert(
    {
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          categoryId: "24",
          title: script.title,
          description: `${script.description}\n\nOutline:\n${script.bulletOutline
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")}\n\n#motivation #mindset`,
          tags: script.tags
        },
        status: {
          privacyStatus: env.youtubeUploadPrivacy,
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    },
    {
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fs.statSync(videoPath).size) * 100;
        logInfo(projectId, "youtube-upload", `Upload progress: ${progress.toFixed(1)}%`);
      }
    }
  );

  const videoId = uploadResponse.data.id;
  if (!videoId) {
    throw new Error("YouTube upload did not return video ID");
  }

  logInfo(projectId, "youtube-upload", `Setting thumbnail for video ${videoId}`);
  await youtube.thumbnails.set({
    videoId,
    media: {
      mimeType: "image/png",
      body: fs.createReadStream(thumbnailPath)
    }
  });

  logInfo(projectId, "youtube-upload", "Upload complete");

  return {
    videoId,
    url: `https://youtube.com/watch?v=${videoId}`
  };
}
