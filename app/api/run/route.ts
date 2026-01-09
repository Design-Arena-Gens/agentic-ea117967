import { NextResponse } from "next/server";
import { runAutomationCycle } from "@/automation/orchestrator";

export async function POST() {
  try {
    const project = await runAutomationCycle();
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
