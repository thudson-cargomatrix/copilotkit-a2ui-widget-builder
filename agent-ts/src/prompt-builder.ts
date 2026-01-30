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

import { z } from "zod";

// The A2UI schema remains constant for all A2UI responses.
export const A2UI_SCHEMA = `
{
  "title": "A2UI Message Schema",
  "description": "Describes a JSON payload for an A2UI (Agent to UI) message, which is used to dynamically construct and update user interfaces. A message MUST contain exactly ONE of the action properties: 'beginRendering', 'surfaceUpdate', 'dataModelUpdate', or 'deleteSurface'.",
  "type": "object",
  "properties": {
    "beginRendering": {
      "type": "object",
      "description": "Signals the client to begin rendering a surface with a root component and specific styles.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be rendered."
        },
        "root": {
          "type": "string",
          "description": "The ID of the root component to render."
        },
        "styles": {
          "type": "object",
          "description": "Styling information for the UI.",
          "properties": {
            "font": {
              "type": "string",
              "description": "The primary font for the UI."
            },
            "primaryColor": {
              "type": "string",
              "description": "The primary UI color as a hexadecimal code (e.g., '#00BFFF').",
              "pattern": "^#[0-9a-fA-F]{6}$"
            }
          }
        }
      },
      "required": ["root", "surfaceId"]
    },
    "surfaceUpdate": {
      "type": "object",
      "description": "Updates a surface with a new set of components.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be updated."
        },
        "components": {
          "type": "array",
          "description": "A list containing all UI components for the surface.",
          "minItems": 1
        }
      },
      "required": ["surfaceId", "components"]
    },
    "dataModelUpdate": {
      "type": "object",
      "description": "Updates the data model for a surface.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface this data model update applies to."
        },
        "path": {
          "type": "string",
          "description": "An optional path to a location within the data model."
        },
        "contents": {
          "type": "array",
          "description": "An array of data entries."
        }
      },
      "required": ["contents", "surfaceId"]
    },
    "deleteSurface": {
      "type": "object",
      "description": "Signals the client to delete the surface identified by 'surfaceId'.",
      "properties": {
        "surfaceId": {
          "type": "string",
          "description": "The unique identifier for the UI surface to be deleted."
        }
      },
      "required": ["surfaceId"]
    }
  }
}
`;

export const GENERAL_UI_EXAMPLES = `
The following are reference examples showing A2UI JSON structure. You should use these as inspiration
but CREATE YOUR OWN unique layouts based on what the user requests. Be creative!

---BEGIN CARD_LIST_EXAMPLE---
Shows a vertical list of cards with image, title, description, and action button.
[
  { "beginRendering": { "surfaceId": "default", "root": "root-column", "styles": { "primaryColor": "#6366F1", "font": "Inter" } } },
  { "surfaceUpdate": {
    "surfaceId": "default",
    "components": [
      { "id": "root-column", "component": { "Column": { "children": { "explicitList": ["title-heading", "item-list"] } } } },
      { "id": "title-heading", "component": { "Text": { "usageHint": "h1", "text": { "literalString": "Your Items" } } } },
      { "id": "item-list", "component": { "List": { "direction": "vertical", "children": { "template": { "componentId": "item-card-template", "dataBinding": "/items" } } } } },
      { "id": "item-card-template", "component": { "Card": { "child": "card-layout" } } },
      { "id": "card-layout", "component": { "Row": { "children": { "explicitList": ["template-image", "card-details"] } } } },
      { "id": "template-image", "weight": 1, "component": { "Image": { "url": { "path": "imageUrl" }, "usageHint": "smallFeature" } } },
      { "id": "card-details", "weight": 2, "component": { "Column": { "children": { "explicitList": ["template-name", "template-desc", "template-action"] } } } },
      { "id": "template-name", "component": { "Text": { "usageHint": "h3", "text": { "path": "name" } } } },
      { "id": "template-desc", "component": { "Text": { "text": { "path": "description" } } } },
      { "id": "template-action", "component": { "Button": { "child": "action-text", "primary": true, "action": { "name": "item_selected", "context": [ { "key": "itemId", "value": { "path": "id" } } ] } } } },
      { "id": "action-text", "component": { "Text": { "text": { "literalString": "Select" } } } }
    ]
  } },
  { "dataModelUpdate": {
    "surfaceId": "default",
    "path": "/",
    "contents": [
      { "key": "items", "valueMap": [
        { "key": "item1", "valueMap": [
          { "key": "id", "valueString": "1" },
          { "key": "name", "valueString": "Item Name" },
          { "key": "description", "valueString": "Item description here" },
          { "key": "imageUrl", "valueString": "https://picsum.photos/200" }
        ] }
      ] }
    ]
  } }
]
---END CARD_LIST_EXAMPLE---

---BEGIN FORM_EXAMPLE---
Shows a form with various input types and a submit button.
[
  { "beginRendering": { "surfaceId": "form", "root": "form-column", "styles": { "primaryColor": "#10B981", "font": "Inter" } } },
  { "surfaceUpdate": {
    "surfaceId": "form",
    "components": [
      { "id": "form-column", "component": { "Column": { "children": { "explicitList": ["form-title", "name-field", "email-field", "date-field", "message-field", "agree-checkbox", "submit-btn"] } } } },
      { "id": "form-title", "component": { "Text": { "usageHint": "h2", "text": { "literalString": "Contact Form" } } } },
      { "id": "name-field", "component": { "TextField": { "label": { "literalString": "Name" }, "text": { "path": "name" }, "textFieldType": "shortText" } } },
      { "id": "email-field", "component": { "TextField": { "label": { "literalString": "Email" }, "text": { "path": "email" }, "textFieldType": "shortText" } } },
      { "id": "date-field", "component": { "DateTimeInput": { "value": { "path": "date" }, "enableDate": true, "enableTime": false } } },
      { "id": "message-field", "component": { "TextField": { "label": { "literalString": "Message" }, "text": { "path": "message" }, "textFieldType": "longText" } } },
      { "id": "agree-checkbox", "component": { "CheckBox": { "label": { "literalString": "I agree to the terms" }, "value": { "path": "agreed" } } } },
      { "id": "submit-btn", "component": { "Button": { "child": "submit-text", "primary": true, "action": { "name": "submit_form", "context": [ { "key": "name", "value": { "path": "name" } }, { "key": "email", "value": { "path": "email" } }, { "key": "message", "value": { "path": "message" } } ] } } } },
      { "id": "submit-text", "component": { "Text": { "text": { "literalString": "Submit" } } } }
    ]
  } },
  { "dataModelUpdate": {
    "surfaceId": "form",
    "path": "/",
    "contents": [
      { "key": "name", "valueString": "" },
      { "key": "email", "valueString": "" },
      { "key": "date", "valueString": "" },
      { "key": "message", "valueString": "" },
      { "key": "agreed", "valueBoolean": false }
    ]
  } }
]
---END FORM_EXAMPLE---

---BEGIN DASHBOARD_EXAMPLE---
Shows a dashboard with stats cards, tabs, and a grid layout.
[
  { "beginRendering": { "surfaceId": "dashboard", "root": "dashboard-root", "styles": { "primaryColor": "#8B5CF6", "font": "Inter" } } },
  { "surfaceUpdate": {
    "surfaceId": "dashboard",
    "components": [
      { "id": "dashboard-root", "component": { "Column": { "children": { "explicitList": ["dash-title", "stats-row", "divider", "content-tabs"] } } } },
      { "id": "dash-title", "component": { "Text": { "usageHint": "h1", "text": { "literalString": "Dashboard" } } } },
      { "id": "stats-row", "component": { "Row": { "distribution": "spaceEvenly", "children": { "explicitList": ["stat-card-1", "stat-card-2", "stat-card-3"] } } } },
      { "id": "stat-card-1", "weight": 1, "component": { "Card": { "child": "stat-1-content" } } },
      { "id": "stat-1-content", "component": { "Column": { "alignment": "center", "children": { "explicitList": ["stat-1-icon", "stat-1-value", "stat-1-label"] } } } },
      { "id": "stat-1-icon", "component": { "Icon": { "name": { "literalString": "person" } } } },
      { "id": "stat-1-value", "component": { "Text": { "usageHint": "h2", "text": { "path": "/stats/users" } } } },
      { "id": "stat-1-label", "component": { "Text": { "usageHint": "caption", "text": { "literalString": "Total Users" } } } },
      { "id": "stat-card-2", "weight": 1, "component": { "Card": { "child": "stat-2-content" } } },
      { "id": "stat-2-content", "component": { "Column": { "alignment": "center", "children": { "explicitList": ["stat-2-icon", "stat-2-value", "stat-2-label"] } } } },
      { "id": "stat-2-icon", "component": { "Icon": { "name": { "literalString": "shoppingCart" } } } },
      { "id": "stat-2-value", "component": { "Text": { "usageHint": "h2", "text": { "path": "/stats/orders" } } } },
      { "id": "stat-2-label", "component": { "Text": { "usageHint": "caption", "text": { "literalString": "Orders" } } } },
      { "id": "stat-card-3", "weight": 1, "component": { "Card": { "child": "stat-3-content" } } },
      { "id": "stat-3-content", "component": { "Column": { "alignment": "center", "children": { "explicitList": ["stat-3-icon", "stat-3-value", "stat-3-label"] } } } },
      { "id": "stat-3-icon", "component": { "Icon": { "name": { "literalString": "star" } } } },
      { "id": "stat-3-value", "component": { "Text": { "usageHint": "h2", "text": { "path": "/stats/rating" } } } },
      { "id": "stat-3-label", "component": { "Text": { "usageHint": "caption", "text": { "literalString": "Avg Rating" } } } },
      { "id": "divider", "component": { "Divider": { "axis": "horizontal" } } },
      { "id": "content-tabs", "component": { "Tabs": { "tabItems": [ { "title": { "literalString": "Overview" }, "child": "tab-overview" }, { "title": { "literalString": "Details" }, "child": "tab-details" } ] } } },
      { "id": "tab-overview", "component": { "Text": { "text": { "literalString": "Overview content goes here..." } } } },
      { "id": "tab-details", "component": { "Text": { "text": { "literalString": "Detailed information goes here..." } } } }
    ]
  } },
  { "dataModelUpdate": {
    "surfaceId": "dashboard",
    "path": "/",
    "contents": [
      { "key": "stats", "valueMap": [
        { "key": "users", "valueString": "1,234" },
        { "key": "orders", "valueString": "567" },
        { "key": "rating", "valueString": "4.8" }
      ] }
    ]
  } }
]
---END DASHBOARD_EXAMPLE---

---BEGIN PROFILE_CARD_EXAMPLE---
Shows a user profile card with avatar, info, and action buttons.
[
  { "beginRendering": { "surfaceId": "profile", "root": "profile-card", "styles": { "primaryColor": "#F59E0B", "font": "Inter" } } },
  { "surfaceUpdate": {
    "surfaceId": "profile",
    "components": [
      { "id": "profile-card", "component": { "Card": { "child": "profile-content" } } },
      { "id": "profile-content", "component": { "Column": { "alignment": "center", "children": { "explicitList": ["avatar", "user-name", "user-bio", "divider", "action-row"] } } } },
      { "id": "avatar", "component": { "Image": { "url": { "path": "/user/avatar" }, "usageHint": "avatar" } } },
      { "id": "user-name", "component": { "Text": { "usageHint": "h2", "text": { "path": "/user/name" } } } },
      { "id": "user-bio", "component": { "Text": { "usageHint": "body", "text": { "path": "/user/bio" } } } },
      { "id": "divider", "component": { "Divider": {} } },
      { "id": "action-row", "component": { "Row": { "distribution": "spaceEvenly", "children": { "explicitList": ["msg-btn", "follow-btn"] } } } },
      { "id": "msg-btn", "component": { "Button": { "child": "msg-text", "action": { "name": "send_message", "context": [ { "key": "userId", "value": { "path": "/user/id" } } ] } } } },
      { "id": "msg-text", "component": { "Text": { "text": { "literalString": "Message" } } } },
      { "id": "follow-btn", "component": { "Button": { "child": "follow-text", "primary": true, "action": { "name": "follow_user", "context": [ { "key": "userId", "value": { "path": "/user/id" } } ] } } } },
      { "id": "follow-text", "component": { "Text": { "text": { "literalString": "Follow" } } } }
    ]
  } },
  { "dataModelUpdate": {
    "surfaceId": "profile",
    "path": "/",
    "contents": [
      { "key": "user", "valueMap": [
        { "key": "id", "valueString": "123" },
        { "key": "name", "valueString": "Jane Doe" },
        { "key": "bio", "valueString": "Software developer and UI enthusiast" },
        { "key": "avatar", "valueString": "https://i.pravatar.cc/150" }
      ] }
    ]
  } }
]
---END PROFILE_CARD_EXAMPLE---

---BEGIN GRID_GALLERY_EXAMPLE---
Shows a two-column image gallery with captions.
[
  { "beginRendering": { "surfaceId": "gallery", "root": "gallery-root", "styles": { "primaryColor": "#EC4899", "font": "Inter" } } },
  { "surfaceUpdate": {
    "surfaceId": "gallery",
    "components": [
      { "id": "gallery-root", "component": { "Column": { "children": { "explicitList": ["gallery-title", "gallery-grid"] } } } },
      { "id": "gallery-title", "component": { "Text": { "usageHint": "h1", "text": { "literalString": "Photo Gallery" } } } },
      { "id": "gallery-grid", "component": { "Row": { "children": { "explicitList": ["col-1", "col-2"] } } } },
      { "id": "col-1", "weight": 1, "component": { "Column": { "children": { "explicitList": ["img-1", "cap-1"] } } } },
      { "id": "img-1", "component": { "Image": { "url": { "path": "/images/0/url" }, "usageHint": "mediumFeature", "fit": "cover" } } },
      { "id": "cap-1", "component": { "Text": { "usageHint": "caption", "text": { "path": "/images/0/caption" } } } },
      { "id": "col-2", "weight": 1, "component": { "Column": { "children": { "explicitList": ["img-2", "cap-2"] } } } },
      { "id": "img-2", "component": { "Image": { "url": { "path": "/images/1/url" }, "usageHint": "mediumFeature", "fit": "cover" } } },
      { "id": "cap-2", "component": { "Text": { "usageHint": "caption", "text": { "path": "/images/1/caption" } } } }
    ]
  } },
  { "dataModelUpdate": {
    "surfaceId": "gallery",
    "path": "/",
    "contents": [
      { "key": "images", "valueMap": [
        { "key": "0", "valueMap": [
          { "key": "url", "valueString": "https://picsum.photos/400/300" },
          { "key": "caption", "valueString": "Beautiful landscape" }
        ] },
        { "key": "1", "valueMap": [
          { "key": "url", "valueString": "https://picsum.photos/400/301" },
          { "key": "caption", "valueString": "City skyline" }
        ] }
      ] }
    ]
  } }
]
---END GRID_GALLERY_EXAMPLE---
`;

// Zod schema for basic A2UI message validation
const A2UIMessageSchema = z.object({
  beginRendering: z
    .object({
      surfaceId: z.string(),
      root: z.string(),
      styles: z
        .object({
          font: z.string().optional(),
          primaryColor: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  surfaceUpdate: z
    .object({
      surfaceId: z.string(),
      components: z.array(z.record(z.unknown())).min(1),
    })
    .optional(),
  dataModelUpdate: z
    .object({
      surfaceId: z.string(),
      path: z.string().optional(),
      contents: z.array(z.record(z.unknown())),
    })
    .optional(),
  deleteSurface: z
    .object({
      surfaceId: z.string(),
    })
    .optional(),
});

const A2UIResponseSchema = z.array(A2UIMessageSchema);

/**
 * Validates an A2UI response against the schema.
 * Returns { valid: true, data } if valid, or { valid: false, error } if invalid.
 */
export function validateA2UIResponse(
  data: unknown
): { valid: true; data: z.infer<typeof A2UIResponseSchema> } | { valid: false; error: string } {
  const result = A2UIResponseSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, error: result.error.message };
}

/**
 * Constructs the full prompt with UI instructions, rules, examples, and schema.
 */
export function getUIPrompt(baseUrl: string): string {
  const formattedExamples = GENERAL_UI_EXAMPLES.replace(/\{base_url\}/g, baseUrl);

  return `
    You are a creative UI builder assistant. You generate rich, interactive user interfaces using A2UI JSON.
    Your final output MUST be a valid A2UI UI JSON response.

    To generate the response, you MUST follow these rules:
    1.  Your response MUST be in two parts, separated by the delimiter: \`---a2ui_JSON---\`.
    2.  The first part is your conversational text response explaining what you built.
    3.  The second part is a single, raw JSON object which is a list of A2UI messages.
    4.  The JSON part MUST validate against the A2UI JSON SCHEMA provided below.

    --- CREATIVE UI DESIGN GUIDELINES ---
    You have full creative freedom to design UIs. Use the examples below as INSPIRATION, not strict templates.

    AVAILABLE COMPONENTS:
    - Layout: Row, Column, List (for dynamic data), Card, Tabs, Modal
    - Content: Text (h1-h5, body, caption), Image (icon, avatar, smallFeature, mediumFeature, largeFeature, header), Icon, Video, AudioPlayer
    - Forms: TextField (shortText, longText, number, date, obscured), DateTimeInput, CheckBox, MultipleChoice, Slider
    - Interactive: Button (with actions), Divider

    AVAILABLE ICONS: accountCircle, add, arrowBack, arrowForward, attachFile, calendarToday, call, camera, check, close, delete, download, edit, event, error, favorite, favoriteOff, folder, help, home, info, locationOn, lock, lockOpen, mail, menu, moreVert, moreHoriz, notificationsOff, notifications, payment, person, phone, photo, print, refresh, search, send, settings, share, shoppingCart, star, starHalf, starOff, upload, visibility, visibilityOff, warning

    DESIGN PRINCIPLES:
    - Choose appropriate colors (primaryColor as hex, e.g., "#6366F1" for indigo, "#10B981" for green, "#F59E0B" for amber)
    - Use semantic text styles (h1 for main titles, h2 for section headers, body for content, caption for labels)
    - Create logical component hierarchies with meaningful IDs
    - Use data binding (paths like "/user/name") for dynamic content
    - Add meaningful button actions with context data
    - Use weight property for flex layouts in Row/Column
    - Consider visual hierarchy and spacing

    BE CREATIVE:
    - Design UIs that match what the user is asking for
    - Invent your own layouts, don't just copy the examples
    - Use appropriate components for the task (forms for input, lists for collections, cards for grouped info)
    - Add relevant placeholder data in dataModelUpdate

    ${formattedExamples}

    ---BEGIN A2UI JSON SCHEMA---
    ${A2UI_SCHEMA}
    ---END A2UI JSON SCHEMA---
    `;
}

/**
 * Constructs the prompt for a text-only agent.
 */
export function getTextPrompt(): string {
  return `
    You are a helpful UI design assistant. Your final output MUST be a text response.

    Help users understand UI concepts, discuss design patterns, or describe what kind of
    interface would work for their needs. You can explain A2UI components, suggest layouts,
    and provide guidance on building user interfaces.
    `;
}

export const AGENT_INSTRUCTION = `
    You are a creative UI builder assistant. Your goal is to help users create rich, interactive user interfaces using A2UI.

    You can build ANY type of UI the user requests:
    - Dashboards with stats and charts
    - Forms for data entry (contact forms, surveys, sign-up forms)
    - Card lists and grids (products, profiles, articles)
    - Profile cards and user displays
    - Image galleries
    - Navigation menus
    - Settings panels
    - Any other UI component or layout

    IMPORTANT GUIDELINES:
    1. Be creative and design UIs that match what the user is asking for
    2. Use appropriate components (forms for input, lists for collections, cards for grouped info)
    3. Choose colors that fit the theme (use hex codes like #6366F1 for indigo, #10B981 for green)
    4. Create logical component hierarchies with meaningful IDs
    5. Add realistic placeholder data in your dataModelUpdate
    6. Use proper text styling (h1 for titles, h2 for sections, body for content)

    When the user asks for a UI, generate it directly - you don't need external tools.
    Use your knowledge to create appropriate sample data and realistic layouts.
`;
