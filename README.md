# A2UI Widget Builder

A general-purpose UI builder agent that dynamically generates rich, interactive user interfaces using **A2UI** (Agent-to-UI) protocol. Built with **CopilotKit**, **Next.js**, and **Google ADK**.

## What is This?

This project demonstrates how AI agents can generate dynamic user interfaces on-the-fly. Instead of returning plain text, the agent creates fully interactive UI components - forms, dashboards, cards, galleries, and more - rendered directly in the chat interface.

**Ask the agent to build any UI:**
- "Create a contact form"
- "Build a dashboard with stats"
- "Make a user profile card"
- "Design an image gallery"
- "Create a settings panel with toggles"

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  CopilotChat    │───▶│  CopilotKit     │───▶│ A2UI        │ │
│  │  (React)        │    │  Runtime        │    │ Renderer    │ │
│  └─────────────────┘    └────────┬────────┘    └─────────────┘ │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ A2A Protocol
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Agent (TypeScript + Google ADK)                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  UIBuilder      │───▶│  LLM (Gemini)   │───▶│ A2UI JSON   │ │
│  │  Agent          │    │                 │    │ Generator   │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **User sends a message** via the CopilotChat interface
2. **CopilotKit Runtime** routes the request to the TypeScript agent via A2A protocol
3. **UIBuilder Agent** (powered by Gemini) interprets the request and generates A2UI JSON
4. **A2UI Renderer** converts the JSON into interactive React components
5. **User interacts** with buttons, forms, etc. - actions are sent back to the agent

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript 5.9** | Type safety |
| **Tailwind CSS 4** | Styling |
| **CopilotKit** | AI chat infrastructure |
| **@copilotkit/a2ui-renderer** | Renders A2UI JSON to React components |
| **@a2ui/lit** | A2UI web components library |
| **Hono** | Lightweight web framework for API routes |
| **Zod** | Schema validation |

### Backend (TypeScript Agent)
| Technology | Purpose |
|------------|---------|
| **Node.js 20+** | Runtime |
| **@google/adk** | Google Agent Development Kit |
| **@a2a-js/sdk** | A2A protocol SDK |
| **Gemini** | LLM (via Google AI) |
| **Express** | Web framework |
| **Zod** | Schema validation |

### Protocols
| Protocol | Purpose |
|----------|---------|
| **A2A** | Agent-to-Agent communication |
| **A2UI** | Agent-to-UI declarative spec (by Google) |
| **AG-UI** | Agent-GUI protocol by CopilotKit |

## A2UI Components

The agent can generate UIs using these components:

### Layout Components
| Component | Description |
|-----------|-------------|
| `Row` | Horizontal flex layout with distribution & alignment |
| `Column` | Vertical flex layout with distribution & alignment |
| `List` | Scrollable list with dynamic data binding |
| `Card` | Elevated container with shadow |
| `Tabs` | Tabbed interface |
| `Modal` | Popup dialog overlay |

### Content Components
| Component | Description |
|-----------|-------------|
| `Text` | Text with styles (h1-h5, body, caption) + markdown |
| `Image` | Images with fit modes and size hints |
| `Icon` | 41 Material Design icons |
| `Video` | Embedded video player |
| `AudioPlayer` | Audio playback |
| `Divider` | Visual separator |

### Form Components
| Component | Description |
|-----------|-------------|
| `TextField` | Text input (short, long, number, date, password) |
| `DateTimeInput` | Date and/or time picker |
| `CheckBox` | Boolean toggle with label |
| `MultipleChoice` | Multi-select options |
| `Slider` | Range slider |
| `Button` | Interactive button with actions |

### Available Icons
```
accountCircle, add, arrowBack, arrowForward, attachFile, calendarToday,
call, camera, check, close, delete, download, edit, event, error,
favorite, favoriteOff, folder, help, home, info, locationOn, lock,
lockOpen, mail, menu, moreVert, moreHoriz, notificationsOff, notifications,
payment, person, phone, photo, print, refresh, search, send, settings,
share, shoppingCart, star, starHalf, starOff, upload, visibility,
visibilityOff, warning
```

## Project Structure

```
copilotkit-a2ui-widget-builder/
├── app/                          # Next.js frontend
│   ├── api/copilotkit/          # CopilotKit API route
│   │   └── [[...slug]]/route.tsx
│   ├── page.tsx                 # Main chat interface
│   ├── theme.ts                 # A2UI theme configuration
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── agent-ts/                     # TypeScript agent
│   ├── src/
│   │   ├── index.ts             # Entry point & A2A server
│   │   ├── agent.ts             # UIBuilderAgent class
│   │   ├── agent-executor.ts    # AgentExecutor implementation
│   │   ├── prompt-builder.ts    # Prompts & UI examples
│   │   └── a2ui-extension.ts    # A2UI DataPart utilities
│   ├── package.json             # Agent dependencies
│   └── tsconfig.json            # TypeScript config
│
├── package.json                 # Root dependencies
└── .env                         # Environment variables
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm, pnpm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd copilotkit-a2ui-widget-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This also runs `postinstall` which installs the TypeScript agent dependencies.

3. **Set up environment variables**
   Create a `.env` file in the root:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Or run frontend and agent separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev:ui

   # Terminal 2 - Agent
   npm run dev:agent
   ```

5. **Open in browser**
   - Frontend: http://localhost:3000
   - Agent: http://localhost:10002

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both UI and agent servers |
| `npm run dev:debug` | Start with debug logging |
| `npm run dev:ui` | Start only Next.js frontend |
| `npm run dev:agent` | Start only TypeScript agent |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run install:agent` | Install agent dependencies |

## How the Agent Generates UIs

The agent uses a structured approach to generate UIs:

### Response Format
The agent responds with two parts separated by `---a2ui_JSON---`:
```
Here's a contact form for you!

---a2ui_JSON---
[
  { "beginRendering": { ... } },
  { "surfaceUpdate": { ... } },
  { "dataModelUpdate": { ... } }
]
```

### A2UI Message Types
| Message | Purpose |
|---------|---------|
| `beginRendering` | Initialize a new UI surface with root component and styles |
| `surfaceUpdate` | Define/update components on the surface |
| `dataModelUpdate` | Populate dynamic data for components |
| `deleteSurface` | Remove a UI surface |

### Example: Simple Card
```json
[
  {
    "beginRendering": {
      "surfaceId": "card",
      "root": "card-root",
      "styles": { "primaryColor": "#6366F1", "font": "Inter" }
    }
  },
  {
    "surfaceUpdate": {
      "surfaceId": "card",
      "components": [
        { "id": "card-root", "component": { "Card": { "child": "content" } } },
        { "id": "content", "component": { "Column": { "children": { "explicitList": ["title", "body"] } } } },
        { "id": "title", "component": { "Text": { "usageHint": "h2", "text": { "path": "/title" } } } },
        { "id": "body", "component": { "Text": { "text": { "path": "/body" } } } }
      ]
    }
  },
  {
    "dataModelUpdate": {
      "surfaceId": "card",
      "path": "/",
      "contents": [
        { "key": "title", "valueString": "Hello World" },
        { "key": "body", "valueString": "This is a simple card." }
      ]
    }
  }
]
```

## Customization

### Modify the Agent Prompt
Edit `agent-ts/src/prompt-builder.ts`:
- `GENERAL_UI_EXAMPLES` - Add or modify example UI templates
- `getUIPrompt()` - Adjust creative guidelines
- `AGENT_INSTRUCTION` in `agent.ts` - Change agent behavior

### Customize the Theme
Edit `app/theme.ts` to change:
- Colors (primary, background, text)
- Typography (fonts, sizes, weights)
- Component-specific styles (Button, Card, TextField, etc.)
- Border radius, padding, spacing

### Add Custom Tools
Edit `agent-ts/src/agent.ts` to add tools the agent can use:
```typescript
const myCustomTool = {
  name: "my_custom_tool",
  description: "Description of what this tool does",
  parameters: z.object({ param: z.string() }),
  execute: async ({ param }: { param: string }) => {
    return result;
  }
};
```

Then register in the agent's tools array.

## Key Concepts

### CopilotKit
[CopilotKit](https://copilotkit.ai) provides the infrastructure for building AI-powered chat interfaces:
- `CopilotChat` - Pre-built chat UI component
- `CopilotKitProvider` - Context provider for runtime configuration
- `CopilotRuntime` - Backend runtime for agent communication
- `A2UIMessageRenderer` - Renders A2UI JSON to React components

### A2UI (Agent-to-UI)
[A2UI](https://a2ui.org) is a declarative UI specification created by Google:
- **Declarative JSON** - Not executable code (secure by design)
- **Framework agnostic** - Same JSON works on React, Flutter, SwiftUI, etc.
- **Streaming friendly** - Flat structure for incremental generation
- **Data binding** - Components reference data model paths

### A2A (Agent-to-Agent)
The A2A protocol enables communication between AI agents. The TypeScript agent runs as an A2A server:
- Receives requests via HTTP
- Returns responses including A2UI messages
- Handles button actions and form submissions

## Troubleshooting

### Agent Connection Issues
If you see connection errors:
1. Ensure the agent is running on port 10002
2. Check your Gemini API key is set correctly in `.env`
3. Verify both servers started successfully

### Agent Dependencies
If you encounter import errors:
```bash
cd agent-ts
npm install
npm run dev
```

### Port Already in Use
If port 10002 is already in use:
```bash
# Find and kill the process using the port
# Windows
netstat -ano | findstr :10002
taskkill /F /PID <pid>

# Mac/Linux
lsof -i :10002
kill -9 <pid>
```

## Resources

- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [A2UI Specification](https://a2ui.org)
- [A2UI Composer](https://a2ui-composer.ag-ui.com/) - Visual UI builder tool
- [Google ADK](https://github.com/google/adk-node)
- [A2A Protocol](https://github.com/google/A2A)
- [A2UI + CopilotKit Docs](https://docs.copilotkit.ai/a2a)

## License

This project is based on the CopilotKit A2A-A2UI starter template. Licensed under the MIT License.
