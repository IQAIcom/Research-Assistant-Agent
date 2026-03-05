// src/agents/agent.ts

import { AgentBuilder } from "@iqai/adk";
import { getResearcherAgent } from "./researcher-agent/agent";
import { getAnalysisAgent } from "./analysis-report-agent/agent";
import { getRecommenderAgent } from "./recommender-agent/agent";
import { getWriterAgent } from "./writer-agent/agent";

export const getRootAgent = async () => {
  const researcherAgent = getResearcherAgent();
  const analysisAgent = getAnalysisAgent();
  const recommenderAgent = getRecommenderAgent();
  const writerAgent = getWriterAgent();

  return AgentBuilder.create("research_assistant")
    .withDescription(
      "Sequential research pipeline: research → analyze → recommend → write",
    )
    .asSequential([
      researcherAgent,
      analysisAgent,
      recommenderAgent,
      writerAgent,
    ])
    .build();
};
