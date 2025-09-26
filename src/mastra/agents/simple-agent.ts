import { createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

// Create OpenAI instance with environment variable
export const simpleAgent = new Agent({
  name: 'Simple Agent',
  instructions: `You are a simple demonstration agent. Your purpose is to:
  - Respond to basic questions
  - Show that the Mastra framework is working correctly
  - Provide helpful information about the system
  
  Keep your responses friendly and concise.`,
  model: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || ""
  })("gpt-4o-mini"),
});