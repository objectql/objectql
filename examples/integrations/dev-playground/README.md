# ObjectQL Development Playground

A browser-based development environment for ObjectQL that enables code browsing, editing, and API testing in the browser - similar to shadcn's approach.

## Features

✨ **File Browser**
- Tree view of your ObjectQL project structure
- Filter by file type (`.object.yml`, `.validation.yml`, `.action.ts`, etc.)
- Real-time file list refresh

📝 **Code Editor**
- Multi-tab editing interface
- Syntax highlighting for YAML, TypeScript, and JSON
- Auto-save detection (Ctrl+S / Cmd+S)
- Modified file indicators

🧪 **API Testing Playground**
- Interactive API testing panel
- Test CRUD operations (find, findOne, create, update, delete)
- JSON request/response viewer
- Real-time execution

🔒 **Security**
- Only enabled in development mode
- File operation restrictions to `src/` directory
- Whitelisted file extensions
- Path traversal protection

## Quick Start

### 1. Start the Backend Server

```bash
cd examples/integrations/dev-playground
pnpm install
pnpm run server
```

The server will start on `http://localhost:3000` with:
- Dev API: `http://localhost:3000/api/dev/`
- REST API: `http://localhost:3000/api/data/`

### 2. Start the Frontend (in another terminal)

```bash
pnpm run dev
```

The UI will open on `http://localhost:5173`

## API Endpoints

### Development API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dev/files` | List all files in src directory |
| GET | `/api/dev/files/:path` | Read file content |
| PUT | `/api/dev/files/:path` | Update file content |
| POST | `/api/dev/files` | Create new file |
| DELETE | `/api/dev/files/:path` | Delete file |
| GET | `/api/dev/metadata` | Get ObjectQL metadata |

### Example: List Files

```bash
curl http://localhost:3000/api/dev/files
```

Response:
```json
{
  "baseDir": "/path/to/project/src",
  "tree": [
    {
      "name": "objects",
      "path": "objects",
      "type": "directory",
      "children": [
        {
          "name": "project.object.yml",
          "path": "objects/project.object.yml",
          "type": "file",
          "size": 1234,
          "modified": "2024-01-17T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

### Example: Read File

```bash
curl http://localhost:3000/api/dev/files/objects/project.object.yml
```

Response:
```json
{
  "path": "objects/project.object.yml",
  "content": "name: project\nlabel: Project\n...",
  "size": 1234,
  "modified": "2024-01-17T10:30:00.000Z",
  "extension": ".yml"
}
```

### Example: Update File

```bash
curl -X PUT http://localhost:3000/api/dev/files/objects/project.object.yml \
  -H "Content-Type: application/json" \
  -d '{"content": "name: project\nlabel: Updated Project\n..."}'
```

### Example: Create File

```bash
curl -X POST http://localhost:3000/api/dev/files \
  -H "Content-Type: application/json" \
  -d '{
    "path": "objects/task.object.yml",
    "content": "name: task\nlabel: Task\n..."
  }'
```

## Integration with Your Project

To add the dev playground to your existing ObjectQL project:

### 1. Install Dependencies

```bash
pnpm add @objectql/server
```

### 2. Add Dev Handler to Your Server

```typescript
import { createDevHandler } from '@objectql/server';

const devHandler = createDevHandler({
    enabled: process.env.NODE_ENV !== 'production',
    baseDir: process.cwd()
});

// In your HTTP server handler:
if (req.url?.startsWith('/api/dev/')) {
    await devHandler(req, res);
}
```

### 3. Copy the HTML UI

Copy `index.html` to your project's static directory and serve it.

## Configuration

### DevHandlerOptions

```typescript
interface DevHandlerOptions {
    /** Base directory for file operations (defaults to process.cwd()) */
    baseDir?: string;
    
    /** Enable dev mode (must be explicitly enabled) */
    enabled?: boolean;
    
    /** Allowed file extensions for editing */
    allowedExtensions?: string[];
}
```

### Example Configuration

```typescript
const devHandler = createDevHandler({
    baseDir: '/path/to/your/project',
    enabled: process.env.NODE_ENV === 'development',
    allowedExtensions: [
        '.yml', '.yaml', '.ts', '.js', '.json', '.md',
        '.object.yml', '.validation.yml', '.permission.yml',
        '.hook.ts', '.action.ts', '.app.yml'
    ]
});
```

## Security Considerations

⚠️ **IMPORTANT**: This dev handler should ONLY be enabled in development environments.

The handler includes several security measures:
- Only enabled when `enabled: true` is explicitly set
- Defaults to production-safe (disabled) mode
- Restricts file operations to the `src/` directory
- Validates file extensions against a whitelist
- Protects against path traversal attacks
- Requires explicit file paths (no wildcards)

**Never enable this in production!**

## Use Cases

### 1. Remote Development
Work on ObjectQL projects from any device with just a browser - perfect for cloud IDEs, Chromebooks, or tablets.

### 2. Live Workshops & Training
Teach ObjectQL concepts with live code editing and immediate API testing feedback.

### 3. Rapid Prototyping
Quickly iterate on object definitions and test them immediately without switching contexts.

### 4. Code Review
Review and comment on ObjectQL metadata files in a collaborative environment.

### 5. Documentation
Embed live, editable examples in documentation websites.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save current file |
| `Ctrl+W` / `Cmd+W` | Close current tab |

## Architecture

```
┌─────────────────────────────────────────┐
│         Browser UI (Vite + HTML)        │
│  ┌────────────┬────────────┬──────────┐ │
│  │ File Tree  │   Editor   │ API Test │ │
│  └────────────┴────────────┴──────────┘ │
└─────────────────────────────────────────┘
                    ↕ HTTP
┌─────────────────────────────────────────┐
│         Node.js Server (HTTP)           │
│  ┌────────────┬────────────────────────┐│
│  │ Dev Handler│  REST Handler (ObjectQL││
│  │  (Files)   │       CRUD API)        ││
│  └────────────┴────────────────────────┘│
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│      File System (src/ directory)       │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Files not loading
- Check that the server is running on port 3000
- Verify the `baseDir` points to your project root
- Ensure the `src/` directory exists

### Cannot save files
- Verify file extension is in `allowedExtensions`
- Check file permissions on the file system
- Ensure the path is within the `src/` directory

### API tests failing
- Verify your ObjectQL app is initialized
- Check that objects are registered in the app
- Ensure the REST handler is configured correctly

## License

MIT - Part of the ObjectQL project
