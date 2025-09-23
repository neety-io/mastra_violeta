import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { mcp } from "../mcp/mcp";

// Configurar OpenAI con la API key directamente
const openaiClient = createOpenAI({
  apiKey: "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"
});


export const linkedinScraperAgent = new Agent({
  name: "LinkedIn Scraper",
  instructions: `
    You are a LinkedIn scraping assistant.
    You have access to a set of tools for scraping LinkedIn data.
    Most of your tools require a full LinkedIn URL as input (for example, a profile, post, or company page URL).
    If the client request does not provide a full URL, you can modify or construct the URL as needed to match the expected format for your tools.
    Your main job is to help the user extract information from LinkedIn by calling the appropriate tool with the correct URL.
    You do not have memory: each request is independent and you do not retain information between requests.
    Normally you will be prompted to extract information, which you can do by using the scraper, this will give you a snapshot that you have to poll using another tool. If the snapshot is not ready the first time you poll, 
    you can keep polling until it is ready. the maximum times you can call the pool tool is 10 times.
    Always:
    - Adjust or rewrite the URL if necessary to match the tool's requirements, a linkedin URL has this format: https://www.linkedin.com/in/user/ or https://www.linkedin.com/in/username/.
    - Clearly state which tool you are using and what data you are extracting.
    - If you cannot fulfill a request due to a missing or invalid URL, explain what is needed.
    - Be concise and direct in your responses.
  `,
  model: openaiClient("gpt-4o"),
  tools: await mcp.getTools()
});