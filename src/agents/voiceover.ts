import path from "path";
import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { VoiceoverResult } from "@/types";
import { saveBufferToFile } from "@/lib/storage";
import { v4 as uuid } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

function probeDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration || 0);
    });
  });
}

export async function runVoiceover(
  projectId: string,
  script: string
): Promise<VoiceoverResult> {
  logInfo(projectId, "voiceover", "Generating AI voiceover from script");

  const response = await openai.audio.speech.create({
    model: env.openAIVoiceModel,
    voice: env.openAIVoice as any,
    input: script,
    response_format: "mp3"
  });

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const id = uuid();
  const audioPath = saveBufferToFile(
    audioBuffer,
    path.join(projectId, "audio", `${id}.mp3`)
  );

  const transcriptPath = saveBufferToFile(
    Buffer.from(script, "utf8"),
    path.join(projectId, "audio", `${id}.txt`)
  );

  const durationSeconds = Math.round(await probeDuration(audioPath));

  logInfo(projectId, "voiceover", "Voiceover generation finished");

  return {
    id,
    audioPath,
    transcriptPath,
    durationSeconds
  };
}
