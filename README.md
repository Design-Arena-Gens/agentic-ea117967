## Agentic Motivation Studio

Autonomous multi-agent pipeline that sources copyright-free footage and music, writes and narrates motivational scripts, edits a final video, and publishes directly to YouTube on a schedule. Built with Next.js and deployable to Vercel.

### Core Capabilities

- **Downloader Agent** — pulls cinematic stock video from Pexels and inspirational background music from Pixabay, storing references and metadata.
- **Scriptwriter Agent** — prompts OpenAI to craft SEO-ready scripts, outlines, titles, and tag bundles.
- **Voiceover Agent** — synthesises narration using OpenAI TTS and exports aligned transcripts.
- **Video Creation Agent** — stitches footage, narration, and background score via ffmpeg, exporting optimized MP4 files.
- **Thumbnail + Publisher Agent** — generates branded artwork, uploads via the YouTube Data API, attaches metadata, and tracks published URLs.
- **Scheduler + Logging** — runs on cron, rotates temp directories, and records structured logs for audit.

### Environment Configuration

Provide the following environment variables (locally via `.env.local`, on Vercel via Project Settings → Environment Variables):

| Key | Purpose |
| --- | --- |
| `PEXELS_API_KEY` | Stock video search and downloads |
| `PIXABAY_API_KEY` | Royalty-free music selection |
| `OPENAI_API_KEY` | Scriptwriting, voice, and thumbnail generation |
| `OPENAI_TTS_MODEL` (optional) | Defaults to `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` (optional) | Defaults to `alloy` |
| `OPENAI_MODEL` (optional) | Defaults to `gpt-4o-mini` |
| `YOUTUBE_CLIENT_EMAIL` | Service account email with upload permission |
| `YOUTUBE_PRIVATE_KEY` | Service account private key (escaping newlines as `\n`) |
| `YOUTUBE_CHANNEL_ID` | Target channel for uploads |
| `YOUTUBE_UPLOAD_PRIVACY` (optional) | `public`, `unlisted`, or `private` |
| `CRON_SCHEDULE` (optional) | Defaults to `0 */6 * * *` |
| `ASSET_STORAGE_ROOT`, `TEMP_ROOT`, `LOGS_ROOT` (optional) | Override storage directories |

### Development

```bash
npm install
npm run dev
```

- Trigger an on-demand cycle from the dashboard or via:

  ```bash
  npm run run-cycle
  ```

- Start the autonomous scheduler locally:

  ```bash
  npm run run-cycle -- schedule
  ```

### Deployment Notes

1. Deploy to Vercel (`vercel deploy --prod --token $VERCEL_TOKEN --name agentic-ea117967`).
2. Configure environment variables in Vercel (including cron job hitting `/api/run` if using Vercel Cron).
3. Ensure ffmpeg is available (the project bundles `ffmpeg-static` for serverless environments).
4. Monitor logs via the UI and `logs/automation.log`.

### Compliance & Safety

All assets are sourced from royalty-free providers with attribution metadata captured per run. Generated media is deleted from temporary directories once compiled, retaining only final deliverables and audit logs.
