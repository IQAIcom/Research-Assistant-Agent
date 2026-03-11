// src/agents/researcher-agent/agent.ts
import { LlmAgent, WebSearchTool } from "@iqai/adk";
import type { BaseTool, ToolContext } from "@iqai/adk";
import { env } from "../../env";
import { STATE_KEYS, MAX_SEARCHES } from "../../constants";
import { beforeAgentCallback, afterAgentCallback } from "../../callbacks";

// Enforces search limit AND prevents parallel tool calls
const enforceSearchLimit = async (
  _tool: BaseTool,
  _args: Record<string, any>,
  toolContext: ToolContext,
) => {
  const count = (toolContext.state["temp:search_count"] as number) || 0;

  if (count >= MAX_SEARCHES) {
    return {
      result: `Search limit reached (${MAX_SEARCHES}/${MAX_SEARCHES}). Compile your research data now.`,
    };
  }

  // Block parallel tool calls — one search per LLM response
  if (toolContext.state["temp:search_in_progress"]) {
    return {
      result: `Only ONE search per turn. ${count}/${MAX_SEARCHES} done. Search again in your NEXT response.`,
    };
  }

  toolContext.state["temp:search_count"] = count + 1;
  toolContext.state["temp:search_in_progress"] = true;
  return undefined;
};

// Clears the in-progress flag so the next turn can search
const clearSearchFlag = async (
  _tool: BaseTool,
  _args: Record<string, any>,
  toolContext: ToolContext,
  _toolResponse: Record<string, any>,
) => {
  toolContext.state["temp:search_in_progress"] = false;
  return undefined;
};

export const getResearcherAgent = () => {
  return new LlmAgent({
    name: "researcher_agent",
    description:
      "Performs web research to gather comprehensive data on any topic",
    model: env.LLM_MODEL,
    tools: [new WebSearchTool()],
    outputKey: STATE_KEYS.SEARCH_RESULTS,
    beforeAgentCallback,
    afterAgentCallback,
    beforeToolCallback: enforceSearchLimit, // Added beforeToolCallback
    afterToolCallback: clearSearchFlag, // Added afterToolCallback~~
    disallowTransferToParent: true,
    disallowTransferToPeers: true,
    instruction: `You are a RESEARCH SPECIALIST. Your ONLY job is to gather comprehensive data through web searches.

RESEARCH PROCESS:
Execute EXACTLY 3 targeted searches using web_search, ONE AT A TIME:

   SEARCH 1 - Foundation: "[topic] overview fundamentals"
   SEARCH 2 - Depth: "[topic] best practices implementation methods"
   SEARCH 3 - Currency: "[topic] latest trends statistics ${new Date().getFullYear()}"

IMPORTANT: Make only ONE web_search call per turn.

For each search, use: maxResults: 3, includeRawContent: "markdown"

After all 3 searches, compile ALL results:

=== RESEARCH DATA ===

## Search 1: [query used]
For each result:
- **Title**: [title]
- **URL**: [url]
- **Content**: [key findings]

## Search 2: [query used]
[Same format]

## Search 3: [query used]
[Same format]

## Research Summary
- Total sources found: [count]
- Search queries used: [list all 3]
- Date of research: ${new Date().toISOString().split("T")[0]}

RULES:
- Execute exactly 3 searches, one per turn
- Do NOT analyze or interpret — just gather and compile
- Include ALL source URLs for attribution
- After compiling, STOP`,
  });
};
