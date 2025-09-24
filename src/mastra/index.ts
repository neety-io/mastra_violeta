import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { contentWorkflow, aiContentWorkflow, parallelAnalysisWorkflow, conditionalWorkflow } from './workflows/content-workflow';
import { fuserAgent } from './agents/fuser-agent';
import { fabricadosAgent } from './agents/fabricados';


export const mastra = new Mastra({
  workflows: { weatherWorkflow, contentWorkflow, aiContentWorkflow, parallelAnalysisWorkflow, conditionalWorkflow },
  agents: { fuserAgent, fabricadosAgent},
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
})