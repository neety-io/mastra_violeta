import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

export const simpleAgent = new Agent({
  name: 'Simple Agent',
  instructions: `You are a simple demonstration agent. Your purpose is to:
  - Respond to basic questions
  - Show that the Mastra framework is working correctly
  - Provide helpful information about the system
  
  Keep your responses friendly and concise.`,
  model: openai("gpt-4o-mini"), // Use cheaper model for testing
});