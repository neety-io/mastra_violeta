import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { fuserAgent } from './agents/fuser-agent';
import { fabricadosAgent } from './agents/fabricados';


export const mastra = new Mastra({
  workflows: {},
  agents: { fuserAgent, fabricadosAgent},
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
})