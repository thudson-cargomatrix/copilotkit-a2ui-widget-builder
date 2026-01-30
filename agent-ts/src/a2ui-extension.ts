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

import type { AgentExtension, Part, DataPart } from "@a2a-js/sdk";
import type { RequestContext } from "@a2a-js/sdk/server";

export const A2UI_EXTENSION_URI =
  "https://a2ui.org/a2a-extension/a2ui/v0.8";

export const MIME_TYPE_KEY = "mimeType";
export const A2UI_MIME_TYPE = "application/json+a2ui";

export const A2UI_CLIENT_CAPABILITIES_KEY = "a2uiClientCapabilities";
export const SUPPORTED_CATALOG_IDS_KEY = "supportedCatalogIds";
export const INLINE_CATALOGS_KEY = "inlineCatalogs";

export const STANDARD_CATALOG_ID =
  "https://raw.githubusercontent.com/google/A2UI/refs/heads/main/specification/0.8/json/standard_catalog_definition.json";

/**
 * Creates an A2A Part containing A2UI data.
 */
export function createA2UIPart(a2uiData: Record<string, unknown>): Part {
  return {
    kind: "data",
    data: a2uiData,
    metadata: {
      [MIME_TYPE_KEY]: A2UI_MIME_TYPE,
    },
  } as Part;
}

/**
 * Checks if an A2A Part contains A2UI data.
 */
export function isA2UIPart(part: Part): boolean {
  if ((part as DataPart).kind !== "data") return false;
  const dataPart = part as DataPart;
  return dataPart.metadata?.[MIME_TYPE_KEY] === A2UI_MIME_TYPE;
}

/**
 * Extracts the DataPart containing A2UI data from an A2A Part, if present.
 */
export function getA2UIDataPart(part: Part): DataPart | null {
  if (isA2UIPart(part)) {
    return part as DataPart;
  }
  return null;
}

/**
 * Creates the A2UI AgentExtension configuration.
 */
export function getA2UIAgentExtension(
  acceptsInlineCustomCatalog = false
): AgentExtension {
  const params: Record<string, unknown> = {};
  if (acceptsInlineCustomCatalog) {
    params.acceptsInlineCustomCatalog = true;
  }

  return {
    uri: A2UI_EXTENSION_URI,
    description: "Provides agent driven UI using the A2UI JSON format.",
    params: Object.keys(params).length > 0 ? params : undefined,
  };
}

// Interface to type the RequestContext with extension methods
interface RequestContextWithExtensions extends RequestContext {
  requestedExtensions?: string[];
  addActivatedExtension?: (uri: string) => void;
}

/**
 * Activates the A2UI extension if requested.
 * Returns true if activated, false otherwise.
 *
 * Note: The JS SDK doesn't expose requestedExtensions the same way as Python SDK.
 * For now, we always return true to enable UI mode since this agent's purpose
 * is to generate UIs.
 */
export function tryActivateA2UIExtension(context: RequestContext): boolean {
  // Always enable UI mode for this agent since its primary purpose is UI generation
  // TODO: Properly detect extension requests when A2A JS SDK exposes this
  return true;
}
