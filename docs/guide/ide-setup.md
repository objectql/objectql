# IDE Setup

To get the best experience developing with ObjectQL, we recommend Visual Studio Code with the following configuration.

## Visual Studio Code

We recommend using [VS Code](https://code.visualstudio.com/) as your primary editor.

### Recommended Extensions

**1. ObjectQL Extension** ⭐  
The official ObjectQL extension provides intelligent IntelliSense, schema validation, and code snippets for all ObjectQL metadata files.

Features:
- Auto-completion for `.object.yml`, `.validation.yml`, `.permission.yml`, `.app.yml` files
- Real-time JSON Schema validation
- 30+ code snippets for common patterns
- Quick commands to create new ObjectQL files
- File icons and syntax highlighting
- TypeScript snippets for hooks and actions

**Installation:**
- From source: See `packages/tools/vscode-objectql/INSTALL.md`
- Will be available on VS Code Marketplace soon

**2. YAML (Red Hat)**  
Essential for editing `*.object.yml` files. Provides syntax highlighting and validation.  
[Install Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

**Note:** The ObjectQL extension depends on the Red Hat YAML extension and will prompt you to install it automatically.

**3. JSON (Official)**  
For editing configuration files.

## AI Assistant Configuration

ObjectQL is designed to be "AI-Native". The most efficient way to write schema and hooks is by pairing with an LLM.

We strongly recommend configuring your AI Coding Assistant (GitHub Copilot, Cursor, Windsurf) with our specialized System Prompts. These prompts teach the AI about ObjectQL's metadata protocol.

[👉 Go to AI Coding Assistant Guide](/ai/coding-assistant)
