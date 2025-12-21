# AuditForge

Frontend-first, IDE-style smart contract auditing for Solidity — with a virtual filesystem, Monaco editor, and on-demand AI analysis.

AuditForge is built for developers who want fast, focused, and transparent contract reviews: no hidden automation, no surprise background scans, and user-controlled API keys.

<p>
  <img src="public/logo.png" alt="AuditForge logo" width="180" />
</p>

## What you get

- **IDE-like workflow**: Monaco editor, tabs, workspaces, and a file explorer.
- **Virtual filesystem**: project files live in your browser and persist between sessions.
- **Contract import**: fetch verified source from explorers (Etherscan v2 API) into your workspace.
- **AI analyzer (file-level)**: run a structured audit report for the currently open Solidity file.
- **Keyboard-first UX**: browser-safe shortcuts + an “Open File” command dialog.
- **Dark mode**: theme support via system/light/dark preferences.

## How it works

- **Files & workspaces** are stored locally:
    - File tree + UI state: `localStorage`
    - File contents: `IndexedDB` (see `src/features/playground/lib/fs-db.ts`)
- **Analysis** runs only when you explicitly trigger it and uses:
    - **Ollama** (`ollama/browser`) for local models (default host `http://localhost:11434`)
    - **OpenAI** (runs from the browser; your key stays on the client)

## Getting started

### Prerequisites

- Node.js (recommended: latest LTS)
- npm (or your preferred package manager)

### Install & run

```bash
npm install
npm run dev
```

Then open the local dev server URL shown in your terminal (typically `http://localhost:5173`).

### Optional: run with Ollama (local models)

1. Install Ollama and start it.
2. Pull a model (example): `ollama pull deepseek-r1:7b`
3. In AuditForge: **Settings → Analyzer** → Provider `Ollama` → confirm host and model.

If the browser cannot reach your Ollama host due to CORS/origin restrictions, configure Ollama to allow your dev/prod origin.

## Using AuditForge

1. **Create/select a workspace** from the workspace picker.
2. **Import a contract** (optional): add your Explorer API key in **Settings → Import**, then import by address.
3. **Open a Solidity file**, then click **Analyze** (or use the shortcut) to generate a report.
4. **Save** changes (files persist locally; clearing site data resets everything).

## Keyboard shortcuts

Shortcuts use `Ctrl` on Windows/Linux and `⌘` on macOS:

- Open file: `Ctrl` + `O`
- Toggle file explorer: `Ctrl` + `Shift` + `E`
- Analyze (open analyzer panel): `Ctrl` + `Shift` + `Enter`
- Open settings: `Ctrl` + `,`
- Save file: `Ctrl` + `S`
- Save all: `Ctrl` + `Shift` + `S`
- Close active file: `Ctrl` + `Shift` + `X`
- Close all files: `Ctrl` + `Shift` + `D`

## Configuration, privacy, and security

- **API keys are stored locally in your browser** (via `localStorage`). AuditForge is designed for **user-owned keys**.
- **OpenAI requests are made from the client**. Do not ship a shared OpenAI API key in a public deployment.
- If you’ve ever pasted real API keys into local `.env` files or committed them accidentally, rotate them immediately.

## Project structure

- `src/features/playground`: editor, filesystem, tabs, analyzer UI/state
- `src/features/contract-import`: explorer fetch + source parsing + import bundling
- `src/features/settings`: settings screens + local persisted preferences
- `src/routes`: TanStack Router routes

## Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: typecheck + production build
- `npm run preview`: preview the production build
- `npm run lint`: ESLint
- `npm run format`: Prettier

## License

No license file is currently included. If you plan to distribute this project, add a `LICENSE` file and update this section.
