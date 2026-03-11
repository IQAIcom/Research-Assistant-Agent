// src/agents/agent.ts

import {
  AgentBuilder,
  MemoryService, // Import MemoryService to connect it to the builder
  InMemoryStorageProvider, // Import InMemoryStorageProvider for development memory storage
} from "@iqai/adk";
import { getResearcherAgent } from "./researcher-agent/agent";
import { getAnalysisAgent } from "./analysis-report-agent/agent";
import { getRecommenderAgent } from "./recommender-agent/agent";
import { getWriterAgent } from "./writer-agent/agent";

export const getRootAgent = async () => {
  const researcherAgent = getResearcherAgent();
  const analysisAgent = getAnalysisAgent();
  const recommenderAgent = getRecommenderAgent();
  const writerAgent = getWriterAgent();

  // Initialize the memory service with an in-memory storage provider for development
  const memoryService = new MemoryService({
    storage: new InMemoryStorageProvider(),
  });

  return (
    AgentBuilder.create("research_assistant")
      .withDescription(
        "Sequential research pipeline: research → analyze → recommend → write",
      )
      .asSequential([
        researcherAgent,
        analysisAgent,
        recommenderAgent,
        writerAgent,
      ])
      // Pre-load session state with app-level config and user ID for memory scoping
      .withQuickSession({
        appName: "research_assistant",
        userId: process.env.USER_ID ?? "user",
        state: {
          "app:pipeline_steps": [
            "researcher",
            "analyst",
            "recommender",
            "writer",
          ],
        },
      })
      // Connect the memory service to enable state persistence across agents
      .withMemory(memoryService)
      .build()
  );
};
