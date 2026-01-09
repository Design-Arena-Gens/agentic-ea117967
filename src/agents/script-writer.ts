import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { ScriptContent } from "@/types";
import { v4 as uuid } from "uuid";

const SYSTEM_PROMPT = `You are a senior motivational scriptwriter and YouTube strategist.
Return answers strictly as JSON with keys: title, description, tags (array of 15 SEO tags in snake_case),
outline (array of 6 bullet headlines), script (600 word narration in first-person present tense).`;

export async function runScriptWriter(projectId: string): Promise<ScriptContent> {
  logInfo(projectId, "script-writer", "Generating motivational script via OpenAI");

  const completion = await openai.chat.completions.create({
    model: env.openAIModel,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content:
          "Craft a novel motivational concept about discipline, resilience, and growth. Avoid clichés."
      }
    ]
  });

  const content = completion.choices[0].message?.content ?? "{}";
  const payload = JSON.parse(content);

  const result: ScriptContent = {
    id: uuid(),
    title: payload.title,
    description: payload.description,
    tags: payload.tags,
    bulletOutline: payload.outline,
    fullScript: payload.script
  };

  logInfo(projectId, "script-writer", "Script generation complete");

  return result;
}
