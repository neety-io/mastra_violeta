import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, writeFileSync } from 'fs';

export const jsonValidatorTool = createTool({
  id: 'json-validator',
  description: 'Validates if a string is valid JSON and returns parsed object or error details',
  inputSchema: z.object({
    jsonString: z.string().describe('The JSON string to validate'),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    parsed: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const parsed = JSON.parse(context.jsonString);
      return {
        isValid: true,
        parsed,
        error: undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        parsed: undefined,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
      };
    }
  },
});

export const jsonFileReaderTool = createTool({
  id: 'json-file-reader',
  description: 'Reads and parses a JSON file from the file system',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the JSON file to read'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const fileContent = readFileSync(context.filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      return {
        success: true,
        data: parsed,
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to read or parse file',
      };
    }
  },
});

export const jsonFileWriterTool = createTool({
  id: 'json-file-writer',
  description: 'Writes a JSON object to a file with pretty formatting',
  inputSchema: z.object({
    filePath: z.string().describe('Path where to save the JSON file'),
    data: z.any().describe('The data to write as JSON'),
    indent: z.number().optional().default(2).describe('Number of spaces for indentation'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const jsonString = JSON.stringify(context.data, null, context.indent || 2);
      writeFileSync(context.filePath, jsonString, 'utf8');
      return {
        success: true,
        message: `JSON successfully written to ${context.filePath}`,
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message: undefined,
        error: error instanceof Error ? error.message : 'Failed to write file',
      };
    }
  },
});

export const jsonFormatterTool = createTool({
  id: 'json-formatter',
  description: 'Formats and pretty-prints JSON with customizable options',
  inputSchema: z.object({
    data: z.any().describe('The data to format as JSON'),
    indent: z.number().optional().default(2).describe('Number of spaces for indentation'),
    sortKeys: z.boolean().optional().default(false).describe('Whether to sort object keys alphabetically'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    formatted: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const replacer = context.sortKeys 
        ? (key: string, value: any) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              return Object.keys(value).sort().reduce((sorted: any, key) => {
                sorted[key] = value[key];
                return sorted;
              }, {});
            }
            return value;
          }
        : undefined;
      
      const formatted = JSON.stringify(context.data, replacer, context.indent || 2);
      return {
        success: true,
        formatted,
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        formatted: undefined,
        error: error instanceof Error ? error.message : 'Failed to format JSON',
      };
    }
  },
});

export const jsonSchemaGeneratorTool = createTool({
  id: 'json-schema-generator',
  description: 'Generates a basic JSON schema from a JSON object',
  inputSchema: z.object({
    data: z.any().describe('The JSON object to generate schema for'),
    title: z.string().optional().describe('Title for the schema'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    schema: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const generateSchema = (obj: any): any => {
        if (obj === null) return { type: 'null' };
        if (Array.isArray(obj)) {
          return {
            type: 'array',
            items: obj.length > 0 ? generateSchema(obj[0]) : { type: 'string' }
          };
        }
        if (typeof obj === 'object') {
          const properties: any = {};
          const required: string[] = [];
          
          for (const [key, value] of Object.entries(obj)) {
            properties[key] = generateSchema(value);
            if (value !== null && value !== undefined) {
              required.push(key);
            }
          }
          
          return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined
          };
        }
        
        return { type: typeof obj };
      };

      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...(context.title && { title: context.title }),
        ...generateSchema(context.data)
      };

      return {
        success: true,
        schema,
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        schema: undefined,
        error: error instanceof Error ? error.message : 'Failed to generate schema',
      };
    }
  },
});
