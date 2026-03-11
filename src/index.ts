// src/index.ts
import * as dotenv from "dotenv";
import { MemoryService, InMemoryStorageProvider } from "@iqai/adk";
import { getRootAgent } from "./agents/agent";

dotenv.config();

async function main() {
  const { runner, session } = await getRootAgent();

  const memoryService = new MemoryService({
    storage: new InMemoryStorageProvider(),
  });

  console.log("==============================");
  console.log("  Research Assistant Pipeline");
  console.log("==============================\n");

  console.log("Session state (app-level config):");
  console.log(
    `  app:pipeline_steps = ${JSON.stringify(session.state["app:pipeline_steps"])}`,
  );
  console.log();

  const topic = "Impact of artificial intelligence on healthcare in 2025";

  console.log(`Research topic: "${topic}"\n`);
  console.log("Starting sequential pipeline...\n");

  try {
    const result = await runner.ask(topic);

    console.log("\n" + "=".repeat(50));
    console.log("  Final Report");
    console.log("=".repeat(50) + "\n");
    console.log(result);

    // Save session to memory for future recall
    await memoryService.addSessionToMemory(session);
    console.log("\nResearch session saved to memory.");

    // Search past research
    const memories = await memoryService.search({
      appName: "research_assistant",
      userId: process.env.USER_ID ?? "user",
      query: topic,
    });
    console.log(`Found ${memories.length} stored session(s).`);
  } catch (error) {
    console.error("Error running research pipeline:", error);
  }
}

main().catch(console.error);
