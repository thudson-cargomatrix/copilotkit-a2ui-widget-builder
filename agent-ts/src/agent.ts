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

import {
  LlmAgent,
  InMemorySessionService,
  Runner,
  isFinalResponse,
  stringifyContent,
  type Event,
} from "@google/adk";
import {
  AGENT_INSTRUCTION,
  getUIPrompt,
  getTextPrompt,
  validateA2UIResponse,
} from "./prompt-builder.js";

const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};

export interface StreamResult {
  is_task_complete: boolean;
  content?: string;
  updates?: string;
}

export class UIBuilderAgent {
  static readonly SUPPORTED_CONTENT_TYPES = ["text", "text/plain"];

  private baseUrl: string;
  private useUI: boolean;
  private agent: LlmAgent;
  private userId = "remote_agent";
  private runner: Runner;
  private sessionService: InMemorySessionService;

  constructor(baseUrl: string, useUI = false) {
    this.baseUrl = baseUrl;
    this.useUI = useUI;
    this.agent = this.buildAgent(useUI);
    this.sessionService = new InMemorySessionService();
    this.runner = new Runner({
      appName: this.agent.name,
      agent: this.agent,
      sessionService: this.sessionService,
    });
  }

  getProcessingMessage(): string {
    return "Building your UI...";
  }

  private buildAgent(useUI: boolean): LlmAgent {
    const model = process.env.LITELLM_MODEL || "gemini-2.5-flash";

    let instruction: string;
    if (useUI) {
      instruction = AGENT_INSTRUCTION + getUIPrompt(this.baseUrl);
    } else {
      instruction = getTextPrompt();
    }

    return new LlmAgent({
      model,
      name: "ui_builder_agent",
      description: "An agent that builds dynamic user interfaces using A2UI.",
      instruction,
      tools: [], // No external tools needed - agent generates UIs directly
    });
  }

  async *stream(
    query: string,
    sessionId: string
  ): AsyncGenerator<StreamResult> {
    const sessionState = { base_url: this.baseUrl };

    let session = await this.sessionService.getSession({
      appName: this.agent.name,
      userId: this.userId,
      sessionId,
    });

    if (!session) {
      session = await this.sessionService.createSession({
        appName: this.agent.name,
        userId: this.userId,
        state: sessionState,
        sessionId,
      });
    }

    // --- Begin: UI Validation and Retry Logic ---
    const maxRetries = 1; // Total 2 attempts
    let attempt = 0;
    let currentQueryText = query;

    while (attempt <= maxRetries) {
      attempt++;
      logger.info(
        `--- UIBuilderAgent.stream: Attempt ${attempt}/${maxRetries + 1} for session ${sessionId} ---`
      );

      let finalResponseContent: string | null = null;

      // Run the agent - newMessage expects a Content object
      const runResult = this.runner.runAsync({
        userId: this.userId,
        sessionId: session.id,
        newMessage: {
          role: "user",
          parts: [{ text: currentQueryText }],
        },
      });

      for await (const event of runResult) {
        logger.info(`Event from runner: ${JSON.stringify(event)}`);

        if (isFinalResponse(event)) {
          // Use stringifyContent to extract text from the event
          finalResponseContent = stringifyContent(event);
          break;
        } else {
          logger.info(`Intermediate event: ${JSON.stringify(event)}`);
          yield {
            is_task_complete: false,
            updates: this.getProcessingMessage(),
          };
        }
      }

      if (finalResponseContent === null) {
        logger.warn(
          `--- UIBuilderAgent.stream: Received no final response content from runner (Attempt ${attempt}). ---`
        );
        if (attempt <= maxRetries) {
          currentQueryText = `I received no response. Please try again. Please retry the original request: '${query}'`;
          continue;
        } else {
          finalResponseContent =
            "I'm sorry, I encountered an error and couldn't process your request.";
        }
      }

      let isValid = false;
      let errorMessage = "";

      if (this.useUI) {
        logger.info(
          `--- UIBuilderAgent.stream: Validating UI response (Attempt ${attempt})... ---`
        );
        try {
          if (!finalResponseContent.includes("---a2ui_JSON---")) {
            throw new Error("Delimiter '---a2ui_JSON---' not found.");
          }

          const [textPart, jsonString] =
            finalResponseContent.split("---a2ui_JSON---");

          if (!jsonString?.trim()) {
            throw new Error("JSON part is empty.");
          }

          let jsonStringCleaned = jsonString
            .trim()
            .replace(/^```json\s*/, "")
            .replace(/```\s*$/, "")
            .trim();

          if (!jsonStringCleaned) {
            throw new Error("Cleaned JSON string is empty.");
          }

          // Parse and validate JSON
          const parsedJsonData = JSON.parse(jsonStringCleaned);

          logger.info(
            "--- UIBuilderAgent.stream: Validating against A2UI schema... ---"
          );
          const validation = validateA2UIResponse(parsedJsonData);

          if (!validation.valid) {
            throw new Error(`Schema validation failed: ${validation.error}`);
          }

          logger.info(
            `--- UIBuilderAgent.stream: UI JSON successfully parsed AND validated. Validation OK (Attempt ${attempt}). ---`
          );
          isValid = true;
        } catch (e) {
          const err = e as Error;
          logger.warn(
            `--- UIBuilderAgent.stream: A2UI validation failed: ${err.message} (Attempt ${attempt}) ---`
          );
          logger.warn(
            `--- Failed response content: ${finalResponseContent.slice(0, 500)}... ---`
          );
          errorMessage = `Validation failed: ${err.message}.`;
        }
      } else {
        // Not using UI, so text is always "valid"
        isValid = true;
      }

      if (isValid) {
        logger.info(
          `--- UIBuilderAgent.stream: Response is valid. Sending final response (Attempt ${attempt}). ---`
        );
        logger.info(`Final response: ${finalResponseContent}`);
        yield {
          is_task_complete: true,
          content: finalResponseContent,
        };
        return;
      }

      // --- If we're here, validation failed ---
      if (attempt <= maxRetries) {
        logger.warn(
          `--- UIBuilderAgent.stream: Retrying... (${attempt}/${maxRetries + 1}) ---`
        );
        currentQueryText = `Your previous response was invalid. ${errorMessage} You MUST generate a valid response that strictly follows the A2UI JSON SCHEMA. The response MUST be a JSON list of A2UI messages. Ensure the response is split by '---a2ui_JSON---' and the JSON part is well-formed. Please retry the original request: '${query}'`;
      }
    }

    // --- If we're here, we've exhausted retries ---
    logger.error(
      "--- UIBuilderAgent.stream: Max retries exhausted. Sending text-only error. ---"
    );
    yield {
      is_task_complete: true,
      content:
        "I'm sorry, I'm having trouble generating the interface for that request right now. Please try again in a moment.",
    };
  }
}
