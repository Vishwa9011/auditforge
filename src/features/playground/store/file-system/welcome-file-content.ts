export const WELCOME_FILE_CONTENT = `
AUDITFORGE
AI-assisted analysis for smart contracts and source code

START HERE
1) Open the File Explorer (left)
2) Create a file and paste code
3) Run analysis

SHORTCUTS
Open file / command palette:  Mac Cmd+P   Windows/Linux Ctrl+P
Save:                         Mac Cmd+S   Windows/Linux Ctrl+S
Run analysis:                 Mac Cmd+Enter   Windows/Linux Ctrl+Enter

TRY THIS (Solidity)
Create: contracts/Hello.sol
Paste:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Hello {
  string public message = "Hello, AuditForge!";
  function setMessage(string calldata next) external { message = next; }
}

WHAT TO LOOK FOR
- Access control assumptions
- Input validation and edge cases
- Gas and style improvements

SUPPORTED FILES
- Solidity: .sol
- JavaScript/TypeScript: .js, .ts, .tsx
- Config and text: .json, .yml, .yaml, .toml, .txt

EDITOR SETTINGS
Settings > Editor lets you change font, size, line height, ligatures, word wrap, and minimap.

`;
