Este proyecto es un servidor de mastra que permite la iteraccion con tres agentes distintos:
- Fuser agent, que se dedica a juntar dos json
- LinkedinSraper que tiene las capacidades del MCP de bright data
- Fabricados, que tiene acceso a todas las herramientas mencionadas en tools-config.txt

El resto de workflows son ejemplos anteriores. 

# Instrucciones para ejecutar el servidor Mastra

## 1. Instalar dependencias
npm install

## 2. Instalar dotenv (si es necesario)
npm install dotenv

## 3. Construir el proyecto
npm run build

## 4. Ejecutar el servidor
npm run start
npm run dev (en development)

## 5. El servidor estará disponible en:
http://localhost:3000/api

## 6. Endpoints disponibles:

### Información general:
GET http://localhost:3000/api

### Agentes:
GET http://localhost:3000/api/agents
POST http://localhost:3000/api/agents/personalAssistantAgent/generate
POST http://localhost:3000/api/agents/fuserAgent/generate
POST http://localhost:3000/api/agents/fabricadosAgent/generate

### Workflows:
GET http://localhost:3000/api/workflows
POST http://localhost:3000/api/workflows/weatherWorkflow/execute
POST http://localhost:3000/api/workflows/contentWorkflow/execute
POST http://localhost:3000/api/workflows/aiContentWorkflow/execute
POST http://localhost:3000/api/workflows/parallelAnalysisWorkflow/execute
POST http://localhost:3000/api/workflows/conditionalWorkflow/execute

## 7. Ejemplo de uso con curl:

### Chat con agente:
curl -X POST http://localhost:3000/api/agents/personalAssistantAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

### Ejecutar workflow del tiempo:
curl -X POST http://localhost:3000/api/workflows/weatherWorkflow/execute \
  -H "Content-Type: application/json" \
  -d '{"city": "Madrid"}'

## 8. Notas:
- El servidor corre en puerto 3000
- La API key de OpenAI está configurada directamente en el código del agente
- Para desarrollo usar: npm run dev (abre playground)
- Para producción usar: npm run build && npm run start
