import path from "path";
import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { saveBufferToFile } from "@/lib/storage";
import { v4 as uuid } from "uuid";

export async function generateThumbnail(
  projectId: string,
  title: string,
  outline: string[]
) {
  logInfo(projectId, "thumbnail", "Generating thumbnail via OpenAI image API");
  const prompt = `Create a cinematic, high-energy YouTube thumbnail for a motivational video titled "${title}". 
  The scene should be dramatic with vibrant lighting, featuring abstract shapes representing growth and energy.
  Include bold typography reading "RISE TODAY".`;

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    response_format: "b64_json"
  });

  if (!response.data?.length) {
    throw new Error("OpenAI returned no thumbnail");
  }

  const buffer = Buffer.from(response.data[0].b64_json!, "base64");
  const id = uuid();
  const thumbnailPath = saveBufferToFile(
    buffer,
    path.join(projectId, "final", `${id}-thumbnail.png`)
  );

  logInfo(projectId, "thumbnail", `Thumbnail generated at ${thumbnailPath}`);

  return thumbnailPath;
}
