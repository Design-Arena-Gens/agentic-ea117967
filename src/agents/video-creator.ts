import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { DownloadedAsset, VoiceoverResult } from "@/types";
import { logInfo } from "@/lib/logger";
import { createTempDir, cleanupTempDir, ensureDir } from "@/lib/storage";
import { v4 as uuid } from "uuid";
import { env } from "@/lib/env";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

function promisifyFFmpeg(command: ffmpeg.FfmpegCommand) {
  return new Promise<void>((resolve, reject) => {
    command.on("end", () => resolve());
    command.on("error", (err) => reject(err));
  });
}

async function createLoopedVideo(
  sourceVideo: string,
  durationSeconds: number,
  tempDir: string
) {
  const loopedVideo = path.join(tempDir, "looped.mp4");
  const command = ffmpeg(sourceVideo)
    .inputOptions(["-stream_loop", "-1"])
    .setDuration(durationSeconds)
    .output(loopedVideo)
    .outputOptions(["-c copy"]);

  await promisifyFFmpeg(command);
  return loopedVideo;
}

async function mixAudioTracks(
  voiceoverPath: string,
  musicPath: string,
  tempDir: string
) {
  const mixedPath = path.join(tempDir, "mixed.mp3");
  const command = ffmpeg()
    .input(voiceoverPath)
    .input(musicPath)
    .complexFilter([
      "[0:a]volume=1[a0]",
      "[1:a]volume=0.35[a1]",
      "[a0][a1]amix=inputs=2:duration=longest[aout]"
    ])
    .outputOptions(["-map", "[aout]", "-c:a", "mp3"])
    .save(mixedPath);

  await promisifyFFmpeg(command);
  return mixedPath;
}

export async function composeVideo(
  projectId: string,
  assets: DownloadedAsset,
  voiceover: VoiceoverResult
) {
  logInfo(projectId, "video-creator", "Composing final video with ffmpeg");
  const tempDir = createTempDir("video-compose");

  try {
    const targetDuration = Math.max(voiceover.durationSeconds || 0, 120);
    const loopedVideo = await createLoopedVideo(
      assets.videoPath,
      targetDuration,
      tempDir
    );
    const mixedAudio = await mixAudioTracks(
      voiceover.audioPath,
      assets.musicPath,
      tempDir
    );

    const id = uuid();
    const outputDir = path.join(env.storageRoot, projectId, "final");
    ensureDir(outputDir);
    const finalPath = path.join(outputDir, `${id}-final.mp4`);

    const command = ffmpeg(loopedVideo)
      .input(mixedAudio)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-shortest", "-preset veryfast", "-movflags +faststart"])
      .save(finalPath);

    await promisifyFFmpeg(command);

    logInfo(projectId, "video-creator", `Video composed at ${finalPath}`);

    return finalPath;
  } finally {
    cleanupTempDir(tempDir);
  }
}
