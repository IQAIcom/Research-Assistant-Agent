// src/index.ts

import { getRootAgent } from "./agents/agent";

const main = async () => {
  const rootAgent = await getRootAgent();
  const { runner } = rootAgent;

  const topic = "Impact of artificial intelligence on healthcare in 2025";
  const response = await runner.ask(topic);

  console.log("Final Report:", response);
};

main().catch(error => {
  console.error("Error:", error);
});
