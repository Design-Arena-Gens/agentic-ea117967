import cron from "node-cron";
import { runAutomationCycle } from "./orchestrator";
import { env } from "@/lib/env";
import { logInfo, logError } from "@/lib/logger";

export function installScheduler() {
  logInfo("scheduler", "init", `Installing cron schedule ${env.schedule}`);

  cron.schedule(env.schedule, async () => {
    const started = new Date().toISOString();
    logInfo("scheduler", "tick", `Triggered automation cycle at ${started}`);
    try {
      await runAutomationCycle();
    } catch (err) {
      logError("scheduler", "tick", "Automation run failed", err);
    }
  });
}
