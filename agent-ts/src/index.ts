// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// Load .env from both agent-ts directory and parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // Also check local .env
import cors from "cors";
import { A2AExpressApp, DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import type { AgentCard, AgentSkill, AgentCapabilities } from "@a2a-js/sdk";
import { UIBuilderAgentExecutor } from "./agent-executor.js";
import { UIBuilderAgent } from "./agent.js";
import { getA2UIAgentExtension } from "./a2ui-extension.js";

const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};

class MissingAPIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingAPIKeyError";
  }
}

async function main() {
  const host = process.env.HOST || "localhost";
  const port = parseInt(process.env.PORT || "10002", 10);

  try {
    // Check for API key only if Vertex AI is not configured
    if (process.env.GOOGLE_GENAI_USE_VERTEXAI !== "TRUE") {
      if (!process.env.GEMINI_API_KEY) {
        throw new MissingAPIKeyError(
          "GEMINI_API_KEY environment variable not set and GOOGLE_GENAI_USE_VERTEXAI is not TRUE."
        );
      }
    }

    const capabilities: AgentCapabilities = {
      streaming: true,
      extensions: [getA2UIAgentExtension()],
    };

    const skill: AgentSkill = {
      id: "build_ui",
      name: "UI Builder",
      description:
        "Builds dynamic, interactive user interfaces using A2UI. Can create dashboards, forms, cards, galleries, and any other UI component.",
      tags: ["ui", "builder", "a2ui", "interface", "design"],
      examples: [
        "Build me a contact form",
        "Create a dashboard with stats",
        "Make a user profile card",
        "Design an image gallery",
        "Build a settings panel",
      ],
    };

    const baseUrl = `http://${host}:${port}`;

    const agentCard: AgentCard = {
      name: "UI Builder Agent",
      description:
        "A creative UI builder that generates rich, interactive user interfaces using A2UI. Ask it to build any type of UI - forms, dashboards, cards, galleries, and more.",
      url: baseUrl,
      version: "1.0.0",
      defaultInputModes: UIBuilderAgent.SUPPORTED_CONTENT_TYPES,
      defaultOutputModes: UIBuilderAgent.SUPPORTED_CONTENT_TYPES,
      capabilities,
      skills: [skill],
    };

    const agentExecutor = new UIBuilderAgentExecutor(baseUrl);
    const taskStore = new InMemoryTaskStore();

    const requestHandler = new DefaultRequestHandler(
      agentCard,
      taskStore,
      agentExecutor
    );

    const app = express();

    // Setup CORS
    app.use(
      cors({
        origin: [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:3004",
        ],
        credentials: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Setup A2A routes
    const a2aApp = new A2AExpressApp(requestHandler);
    a2aApp.setupRoutes(app, "");

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    app.listen(port, host, () => {
      logger.info(`UI Builder Agent (TypeScript) running at ${baseUrl}`);
      logger.info(`Agent card available at ${baseUrl}/.well-known/agent.json`);
    });
  } catch (e) {
    if (e instanceof MissingAPIKeyError) {
      logger.error(`Error: ${e.message}`);
      process.exit(1);
    }
    logger.error(`An error occurred during server startup: ${e}`);
    process.exit(1);
  }
}

main();
