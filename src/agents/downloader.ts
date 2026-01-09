import axios from "axios";
import fs from "fs";
import path from "path";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { createTempDir, cleanupTempDir, saveStreamToFile } from "@/lib/storage";
import { DownloadedAsset } from "@/types";
import { v4 as uuid } from "uuid";

interface PexelsVideoFile {
  link: string;
  quality: string;
  file_type: string;
  width: number;
  height: number;
}

interface PexelsVideo {
  id: number;
  image: string;
  duration: number;
  video_files: PexelsVideoFile[];
  url: string;
}

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  duration: number;
  downloads: number;
  user: string;
  largeImageURL?: string;
  videos?: Record<string, { url: string; width: number; height: number }>;
  audio?: { url: string };
  previewURL?: string;
}

async function fetchPexelsVideo(): Promise<PexelsVideo> {
  const response = await axios.get<{
    videos: PexelsVideo[];
  }>("https://api.pexels.com/videos/search", {
    headers: {
      Authorization: env.pexelsApiKey
    },
    params: {
      query: env.pexelsQuery,
      per_page: 1,
      orientation: "landscape"
    }
  });

  if (!response.data.videos.length) {
    throw new Error("No videos found on Pexels.");
  }

  return response.data.videos[0];
}

async function fetchPixabayMusic(): Promise<PixabayHit> {
  const response = await axios.get<{
    hits: PixabayHit[];
  }>("https://pixabay.com/api/", {
    params: {
      key: env.pixabayApiKey,
      q: "motivational instrumental",
      safesearch: true,
      category: "music",
      per_page: 10
    }
  });

  if (!response.data.hits.length) {
    throw new Error("No music found on Pixabay.");
  }

  const sorted = response.data.hits.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  return sorted[0];
}

async function downloadFile(url: string, relativeTarget: string) {
  const response = await axios.get<NodeJS.ReadableStream>(url, {
    responseType: "stream"
  });
  return saveStreamToFile(response.data, relativeTarget);
}

export async function runDownloader(projectId: string): Promise<DownloadedAsset> {
  logInfo(projectId, "downloader", "Starting downloader agent");
  const tempDir = createTempDir("downloader");

  try {
    const video = await fetchPexelsVideo();
    const chosenFile =
      video.video_files.find(
        (file) => file.quality === "hd" && file.file_type === "video/mp4"
      ) || video.video_files[0];
    if (!chosenFile) {
      throw new Error("No downloadable files available for selected video.");
    }
    logInfo(projectId, "downloader", `Selected Pexels video ${video.id}`);

    const music = await fetchPixabayMusic();
    logInfo(projectId, "downloader", `Selected Pixabay music ${music.id}`);

    const id = uuid();
    const videoPath = await downloadFile(
      chosenFile.link,
      path.join(projectId, "raw", `${id}-video.mp4`)
    );
    const musicUrl =
      (music as any).audio?.url ||
      (music.videos?.large?.url as string) ||
      music.previewURL;

    if (!musicUrl) {
      throw new Error("Unable to resolve Pixabay music URL");
    }

    const musicPath = await downloadFile(
      musicUrl,
      path.join(projectId, "raw", `${id}-music.mp3`)
    );

    const metadata = {
      pexelsVideoId: video.id,
      pexelsUrl: video.url,
      pixabayId: music.id,
      pixabayTags: music.tags,
      pixabayUrl: music.pageURL
    };

    logInfo(projectId, "downloader", "Downloader agent completed.");

    return {
      id,
      videoPath,
      musicPath,
      metadata
    };
  } finally {
    cleanupTempDir(tempDir);
  }
}
