import { runAutomationCycle } from "../src/automation/orchestrator";
import { installScheduler } from "../src/automation/scheduler";
import { env } from "../src/lib/env";
import { logInfo } from "../src/lib/logger";

async function main() {
  const mode = process.argv[2] || "once";
  if (mode === "schedule") {
    logInfo("scheduler", "cli", "Running scheduler mode, press Ctrl+C to exit");
    installScheduler();
  } else {
    await runAutomationCycle();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
