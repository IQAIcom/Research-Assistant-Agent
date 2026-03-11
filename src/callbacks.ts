// src/callbacks.ts
import type { CallbackContext } from "@iqai/adk";

const STEP_LABELS: Record<string, string> = {
  researcher_agent: "Step 1/4: Researcher",
  analyst_agent: "Step 2/4: Analyst",
  recommender_agent: "Step 3/4: Recommender",
  writer_agent: "Step 4/4: Writer",
};

// Logs the step name and records start time in temp state
export const beforeAgentCallback = async (ctx: CallbackContext) => {
  const label = STEP_LABELS[ctx.agentName] ?? ctx.agentName;
  ctx.state[`temp:${ctx.agentName}_start`] = Date.now();
  console.log(`\n>> ${label} - Starting...`);
  return undefined;
};

// Logs completion with duration
export const afterAgentCallback = async (ctx: CallbackContext) => {
  const label = STEP_LABELS[ctx.agentName] ?? ctx.agentName;
  const startTime = ctx.state[`temp:${ctx.agentName}_start`] as
    | number
    | undefined;
  const duration = startTime
    ? ((Date.now() - startTime) / 1000).toFixed(1)
    : "?";
  console.log(`<< ${label} - Complete (${duration}s)`);
  return undefined;
};
