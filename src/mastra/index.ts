import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
// Use a simple in-memory storage for Workers
import { simpleAgent } from './agents/simple-agent';
import { CloudflareDeployer } from "@mastra/deployer-cloudflare"; 

export const mastra = new Mastra({
  workflows: {},
  agents: { simpleAgent }, // Simple agent without file dependencies
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    projectName: "violeta-mastra",
  }),
});
