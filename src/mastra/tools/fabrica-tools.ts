import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Para obtener el directorio del proyecto de manera más confiable
const getProjectRoot = () => {
  // Buscar hacia arriba hasta encontrar package.json
  let currentDir = process.cwd();
  
  // Si estamos en .mastra/output, subir hasta la raíz del proyecto
  if (currentDir.includes('.mastra/output')) {
    // Extraer la parte antes de .mastra
    const parts = currentDir.split('.mastra');
    if (parts.length > 0) {
      currentDir = parts[0];
    }
  }
  
  // Buscar package.json hacia arriba
  while (currentDir !== '/' && currentDir !== '') {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }
  
  return process.cwd(); // fallback
};

interface ToolDefinition {
  id: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  requestType: 'GET' | 'POST';
  apiUrl: string;
}

export function createToolsFromFile(filePath: string) {
  const fileContent = readFileSync(filePath, 'utf8');
  const toolDefinitions = parseToolDefinitions(fileContent);
  
  const tools: Record<string, any> = {};
  
  for (const toolDef of toolDefinitions) {
    tools[toolDef.id] = createApiTool(toolDef);
  }
  
  return tools;
}

function parseToolDefinitions(content: string): ToolDefinition[] {
  const tools: ToolDefinition[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentTool: Partial<ToolDefinition> = {};
  let currentSection = '';
  
  for (const line of lines) {
    if (line.startsWith('- ID:')) {
      // Si ya tenemos una herramienta completa, la guardamos
      if (currentTool.id) {
        tools.push(currentTool as ToolDefinition);
        currentTool = {};
      }
      currentTool.id = line.replace('- ID:', '').trim();
    }
    else if (line.startsWith('- Description:')) {
      currentTool.description = line.replace('- Description:', '').trim();
    }
    else if (line.startsWith('- Input Schema:')) {
      currentSection = 'inputSchema';
      const schemaText = line.replace('- Input Schema:', '').trim();
      if (schemaText) {
        currentTool.inputSchema = parseSchema(schemaText);
      }
    }
    else if (line.startsWith('- Output Schema:')) {
      currentSection = 'outputSchema';
      const schemaText = line.replace('- Output Schema:', '').trim();
      if (schemaText) {
        currentTool.outputSchema = parseSchema(schemaText);
      }
    }
    else if (line.startsWith('- Request Type:')) {
      const requestType = line.replace('- Request Type:', '').trim().toUpperCase();
      currentTool.requestType = requestType as 'GET' | 'POST';
    }
    else if (line.startsWith('- URL:')) {
      currentTool.apiUrl = line.replace('- URL:', '').trim();
    }
    // Si la línea no empieza con -, podría ser continuación del schema
    else if (currentSection && line.startsWith('{')) {
      if (currentSection === 'inputSchema') {
        currentTool.inputSchema = parseSchema(line);
      } else if (currentSection === 'outputSchema') {
        currentTool.outputSchema = parseSchema(line);
      }
    }
  }
  
  // Guardar la última herramienta
  if (currentTool.id) {
    tools.push(currentTool as ToolDefinition);
  }
  
  return tools;
}

function parseSchema(schemaText: string): any {
  try {
    // Intentar parsear como JSON si parece un objeto
    if (schemaText.startsWith('{')) {
      const schemaObj = JSON.parse(schemaText);
      return convertToZodSchema(schemaObj);
    }
    
    // Si es una descripción simple, crear un schema básico
    return z.object({
      input: z.string().describe(schemaText)
    });
  } catch (error) {
    console.warn(`Error parsing schema: ${schemaText}`, error);
    return z.object({
      input: z.string().describe('Input parameter')
    });
  }
}

function convertToZodSchema(obj: any): any {
  const zodObject: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      const fieldDef = value as any;
      
      if (fieldDef.type === 'string') {
        zodObject[key] = z.string().describe(fieldDef.description || key);
      } else if (fieldDef.type === 'number') {
        zodObject[key] = z.number().describe(fieldDef.description || key);
      } else if (fieldDef.type === 'boolean') {
        zodObject[key] = z.boolean().describe(fieldDef.description || key);
      } else if (fieldDef.type === 'array') {
        zodObject[key] = z.array(z.string()).describe(fieldDef.description || key);
      } else {
        zodObject[key] = z.string().describe(fieldDef.description || key);
      }
      
      if (fieldDef.optional) {
        zodObject[key] = zodObject[key].optional();
      }
    } else {
      zodObject[key] = z.string().describe(key);
    }
  }
  
  return z.object(zodObject);
}

function createApiTool(toolDef: ToolDefinition) {
  return createTool({
    id: toolDef.id,
    description: toolDef.description,
    inputSchema: toolDef.inputSchema,
    outputSchema: toolDef.outputSchema,
    execute: async ({ context }) => {
      try {
        let url = toolDef.apiUrl;
        let fetchOptions: RequestInit = {
          method: toolDef.requestType,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        
        if (toolDef.requestType === 'GET') {
          // Para GET, agregar parámetros a la URL
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(context)) {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          }
          if (params.toString()) {
            url += (url.includes('?') ? '&' : '?') + params.toString();
          }
        } else {
          // Para POST, enviar como body
          fetchOptions.body = JSON.stringify(context);
        }
        
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        console.error(`Error executing tool ${toolDef.id}:`, error);
        throw error;
      }
    },
  });
}

// Función de conveniencia para cargar herramientas desde el archivo de configuración
export function loadFabricatedTools() {
  const projectRoot = getProjectRoot();
  const toolsFilePath = join(projectRoot, 'tools-config.txt');
  
  console.log(`Buscando archivo de configuración en: ${toolsFilePath}`);
  
  try {
    if (existsSync(toolsFilePath)) {
      console.log(`✅ Archivo encontrado, cargando herramientas...`);
      const tools = createToolsFromFile(toolsFilePath);
      console.log(`✅ Se cargaron ${Object.keys(tools).length} herramientas fabricadas`);
      return tools;
    } else {
      console.warn(`❌ No se encontró el archivo: ${toolsFilePath}`);
      return {};
    }
  } catch (error) {
    console.error('❌ Error al cargar herramientas fabricadas:', error);
    return {};
  }
}
