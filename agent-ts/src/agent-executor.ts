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

import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type {
  Task,
  Part,
  Message,
  TaskStatusUpdateEvent,
  TaskState,
} from "@a2a-js/sdk";
import { UIBuilderAgent } from "./agent.js";
import { createA2UIPart, tryActivateA2UIExtension } from "./a2ui-extension.js";
import { v4 as uuidv4 } from "uuid";

const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};

// TaskState values (since they're type-only in the SDK)
const TaskStateValues = {
  Submitted: "submitted" as TaskState,
  Working: "working" as TaskState,
  InputRequired: "input-required" as TaskState,
  Completed: "completed" as TaskState,
  Canceled: "canceled" as TaskState,
  Failed: "failed" as TaskState,
  Unknown: "unknown" as TaskState,
} as const;

/**
 * UI Builder AgentExecutor - builds dynamic user interfaces using A2UI.
 */
export class UIBuilderAgentExecutor implements AgentExecutor {
  private uiAgent: UIBuilderAgent;
  private textAgent: UIBuilderAgent;

  constructor(baseUrl: string) {
    // Instantiate two agents: one for UI and one for text-only
    this.uiAgent = new UIBuilderAgent(baseUrl, true);
    this.textAgent = new UIBuilderAgent(baseUrl, false);
  }

  async execute(
    context: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    let query = "";
    let uiEventPart: Record<string, unknown> | null = null;
    let action: string | null = null;

    logger.info(`--- AGENT_EXECUTOR: Processing request ---`);
    const useUI = tryActivateA2UIExtension(context);

    // Determine which agent to use based on whether the a2ui extension is active
    const agent = useUI ? this.uiAgent : this.textAgent;
    logger.info(
      `--- AGENT_EXECUTOR: A2UI extension is ${useUI ? "active. Using UI agent." : "not active. Using text agent."} ---`
    );

    // Process incoming message parts
    if (context.userMessage?.parts) {
      logger.info(
        `--- AGENT_EXECUTOR: Processing ${context.userMessage.parts.length} message parts ---`
      );
      for (let i = 0; i < context.userMessage.parts.length; i++) {
        const part = context.userMessage.parts[i] as Part;
        if ((part as { kind?: string }).kind === "data") {
          const dataPart = part as { data?: Record<string, unknown> };
          if (dataPart.data && "userAction" in dataPart.data) {
            logger.info(`  Part ${i}: Found a2ui UI ClientEvent payload.`);
            uiEventPart = dataPart.data.userAction as Record<string, unknown>;
          } else {
            logger.info(
              `  Part ${i}: DataPart (data: ${JSON.stringify(dataPart.data)})`
            );
          }
        } else if ((part as { kind?: string }).kind === "text") {
          const textPart = part as { text?: string };
          logger.info(`  Part ${i}: TextPart (text: ${textPart.text})`);
        } else {
          logger.info(`  Part ${i}: Unknown part type`);
        }
      }
    }

    if (uiEventPart) {
      logger.info(`Received a2ui ClientEvent: ${JSON.stringify(uiEventPart)}`);
      action = (uiEventPart.actionName as string) || null;
      const ctx = (uiEventPart.context as Record<string, unknown>) || {};

      // Generic action handling - pass all actions to the agent with their context
      const contextStr = Object.entries(ctx)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      query = `User triggered action '${action}' with context: ${contextStr}. Please respond appropriately with a UI update or confirmation.`;
    } else {
      logger.info("No a2ui UI event part found. Falling back to text input.");
      // Extract text from message parts
      const textParts = context.userMessage?.parts?.filter(
        (p) => (p as { kind?: string }).kind === "text"
      ) as Array<{ text?: string }> | undefined;
      query = textParts?.map((p) => p.text).join(" ") || "";
    }

    logger.info(`--- AGENT_EXECUTOR: Final query for LLM: '${query}' ---`);

    // Get or create task
    const taskId = context.task?.id || context.taskId || uuidv4();
    const contextId = context.userMessage?.contextId || context.contextId;

    // Create initial task if needed
    if (!context.task) {
      const initialTask: Task = {
        kind: "task",
        id: taskId,
        contextId: contextId,
        status: { state: TaskStateValues.Submitted },
        history: context.userMessage ? [context.userMessage] : [],
      };
      eventBus.publish(initialTask);
    }

    // Stream agent responses
    for await (const item of agent.stream(query, contextId)) {
      const isTaskComplete = item.is_task_complete;

      if (!isTaskComplete) {
        // Working status update
        const workingMessage: Message = {
          kind: "message",
          messageId: uuidv4(),
          contextId: contextId,
          taskId: taskId,
          role: "agent",
          parts: [{ kind: "text", text: item.updates || "Working..." } as Part],
        };

        const statusUpdate: TaskStatusUpdateEvent = {
          kind: "status-update",
          taskId: taskId,
          contextId: contextId,
          status: { state: TaskStateValues.Working, message: workingMessage },
          final: false,
        };

        eventBus.publish(statusUpdate);
        continue;
      }

      // For UI interactions, default to input_required to allow further interaction
      // Actions ending in "submit" or "confirm" are treated as completing the task
      const finalState =
        action &&
        (action.toLowerCase().includes("submit") ||
          action.toLowerCase().includes("confirm"))
          ? TaskStateValues.Completed
          : TaskStateValues.InputRequired;

      const content = item.content || "";
      const finalParts: Part[] = [];

      if (content.includes("---a2ui_JSON---")) {
        logger.info("Splitting final response into text and UI parts.");
        const [textContent, jsonString] = content.split("---a2ui_JSON---");

        if (textContent?.trim()) {
          finalParts.push({ kind: "text", text: textContent.trim() } as Part);
        }

        if (jsonString?.trim()) {
          try {
            let jsonStringCleaned = jsonString
              .trim()
              .replace(/^```json\s*/, "")
              .replace(/```\s*$/, "")
              .trim();

            const jsonData = JSON.parse(jsonStringCleaned);

            if (Array.isArray(jsonData)) {
              logger.info(
                `Found ${jsonData.length} messages. Creating individual DataParts.`
              );
              for (const message of jsonData) {
                finalParts.push(createA2UIPart(message));
              }
            } else {
              // Handle the case where a single JSON object is returned
              logger.info(
                "Received a single JSON object. Creating a DataPart."
              );
              finalParts.push(createA2UIPart(jsonData));
            }
          } catch (e) {
            const err = e as Error;
            logger.error(`Failed to parse UI JSON: ${err.message}`);
            finalParts.push({ kind: "text", text: jsonString } as Part);
          }
        }
      } else {
        finalParts.push({ kind: "text", text: content.trim() } as Part);
      }

      logger.info("--- FINAL PARTS TO BE SENT ---");
      for (let i = 0; i < finalParts.length; i++) {
        const part = finalParts[i];
        logger.info(`  - Part ${i}: Type = ${(part as { kind?: string }).kind}`);
        if ((part as { kind?: string }).kind === "text") {
          const textPart = part as { text?: string };
          logger.info(`    - Text: ${textPart.text?.slice(0, 200)}...`);
        } else if ((part as { kind?: string }).kind === "data") {
          const dataPart = part as { data?: unknown };
          logger.info(
            `    - Data: ${JSON.stringify(dataPart.data)?.slice(0, 200)}...`
          );
        }
      }
      logger.info("-----------------------------");

      // Create final message
      const finalMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        contextId: contextId,
        taskId: taskId,
        role: "agent",
        parts: finalParts,
      };

      // Final status update
      const finalUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId: taskId,
        contextId: contextId,
        status: { state: finalState, message: finalMessage },
        final: finalState === TaskStateValues.Completed,
      };

      eventBus.publish(finalUpdate);
      // Signal that execution is complete
      eventBus.finished();
      break;
    }
  }

  async cancelTask(
    taskId: string,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    throw new Error("Cancel operation is not supported");
  }
}
