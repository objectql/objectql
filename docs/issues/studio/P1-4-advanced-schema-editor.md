# [Studio] Implement Advanced Schema Editor

**Priority:** P1 (High)  
**Effort:** High (3 weeks)  
**Labels:** `enhancement`, `studio`, `p1-high`, `developer-experience`  
**Milestone:** Studio v2.1 - Developer Tools

## 📋 Summary

Replace the basic text editor with a full-featured code editor that provides syntax highlighting, validation, autocomplete, and real-time error checking for ObjectQL schema files.

## 🎯 Problem Statement

The current schema editor is a plain textarea with no developer assistance:
- No syntax highlighting
- No autocomplete
- No validation feedback
- No schema structure awareness
- Difficult to spot errors
- No multi-file comparison
- Poor developer experience

This makes schema editing error-prone and inefficient, especially for complex schemas.

## ✅ Acceptance Criteria

### Core Editor Features
- [ ] Syntax highlighting for YAML and JSON
- [ ] Line numbers
- [ ] Code folding
- [ ] Bracket matching
- [ ] Multi-cursor editing
- [ ] Find and replace (with regex support)
- [ ] Format/beautify code
- [ ] Undo/redo with history
- [ ] Minimap for navigation (optional)

### IntelliSense & Autocomplete
- [ ] Field name autocomplete
- [ ] Field type suggestions
- [ ] Property suggestions based on context
- [ ] Snippet support (common patterns)
- [ ] Hover tooltips with documentation
- [ ] Parameter hints
- [ ] Auto-close brackets/quotes

### Validation & Errors
- [ ] Real-time YAML/JSON syntax validation
- [ ] Schema structure validation against ObjectQL spec
- [ ] Error markers in gutter
- [ ] Squiggly underlines for errors
- [ ] Warning indicators for best practices
- [ ] Error list panel
- [ ] Click error to jump to location
- [ ] Validation on save

### Schema-Specific Features
- [ ] Object name inference from filename
- [ ] Relationship visualization (hover on lookup field)
- [ ] Field type information on hover
- [ ] Jump to definition (for referenced objects)
- [ ] Find all references
- [ ] Rename refactoring (with preview)
- [ ] Schema diff view (compare before/after)

### Multi-File Support
- [ ] Tab interface for multiple open files
- [ ] Quick file switcher (Cmd/Ctrl+P)
- [ ] Split editor view (side-by-side)
- [ ] File tree integration
- [ ] Recent files list
- [ ] Unsaved changes indicator (*)

### Keyboard Shortcuts
- [ ] Save: Cmd/Ctrl+S
- [ ] Find: Cmd/Ctrl+F
- [ ] Find and Replace: Cmd/Ctrl+H
- [ ] Comment/Uncomment: Cmd/Ctrl+/
- [ ] Format document: Shift+Alt+F
- [ ] Quick actions: Cmd/Ctrl+.
- [ ] Show shortcuts: Cmd/Ctrl+K, Cmd/Ctrl+S

### Settings & Customization
- [ ] Theme selection (light/dark)
- [ ] Font size adjustment
- [ ] Tab size configuration
- [ ] Spaces vs tabs
- [ ] Line wrap toggle
- [ ] Auto-save on/off
- [ ] Validation strictness level

## 🎨 UI/UX Design

### Editor Layout
```
┌────────────────────────────────────────────────┐
│  Schema Editor                                 │
├────────────────────────────────────────────────┤
│  📁 project.object.yml ×  │  tasks.object.yml  │
├────────────────────────────────────────────────┤
│ 1  # Project Object Definition                 │
│ 2  label: Project                              │
│ 3  icon: folder                                │
│ 4  fields:                                     │
│ 5    name:                                     │
│ 6      type: text                              │
│ 7      required: true                          │
│ 8      validation:                             │
│ 9        min_length: 3                         │
│10        max_length: 100                       │
│11    owner:                                    │
│12      type: lookup                            │
│13      reference_to: users    [Info: Users]   │
│                    ^^^^^^                      │
│                   Autocomplete suggestion      │
├────────────────────────────────────────────────┤
│  ✅ Valid  │  Ln 13, Col 27  │  YAML  │  UTF-8 │
└────────────────────────────────────────────────┘
```

### Error Panel
```
┌────────────────────────────────────────────────┐
│  ⚠️ Problems (2)                                │
├────────────────────────────────────────────────┤
│  ❌ project.object.yml                          │
│     Line 13: Unknown field type 'lokup'        │
│              Did you mean 'lookup'?            │
│                                                │
│  ⚠️  tasks.object.yml                           │
│     Line 8: Field 'priority' missing 'options' │
│            property for select type            │
└────────────────────────────────────────────────┘
```

### Autocomplete Dropdown
```
    type: ┌─────────────────────────┐
          │ text                    │
          │ number                  │
          │ date                    │
          │ select         (Select) │
          │ lookup         (Lookup) │
          │ master_detail  (M-D)    │
          └─────────────────────────┘
```

## 🔧 Technical Implementation

### Monaco Editor Integration
```typescript
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

function SchemaEditor({ filePath, initialContent, onSave }) {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  
  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    
    // Register ObjectQL YAML schema
    monaco.languages.yaml.yamlDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'https://objectql.org/schema/object.json',
        fileMatch: ['*.object.yml'],
        schema: objectSchemaJsonSchema
      }]
    });
    
    // Register custom completion provider
    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: (model, position) => {
        return {
          suggestions: getObjectQLSuggestions(model, position)
        };
      }
    });
    
    // Register hover provider
    monaco.languages.registerHoverProvider('yaml', {
      provideHover: (model, position) => {
        return getObjectQLHover(model, position);
      }
    });
  };
  
  const handleSave = () => {
    const content = editorRef.current?.getValue();
    if (content) {
      onSave(filePath, content);
    }
  };
  
  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <Editor
      height="100%"
      defaultLanguage={filePath.endsWith('.yml') ? 'yaml' : 'json'}
      value={content}
      onChange={(value) => setContent(value || '')}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        rulers: [80],
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        bracketPairColorization: { enabled: true }
      }}
    />
  );
}
```

### ObjectQL JSON Schema for Validation
```typescript
const objectSchemaJsonSchema = {
  type: 'object',
  required: ['fields'],
  properties: {
    label: {
      type: 'string',
      description: 'Human-readable label for the object'
    },
    description: {
      type: 'string',
      description: 'Description of this object'
    },
    icon: {
      type: 'string',
      description: 'Icon identifier'
    },
    fields: {
      type: 'object',
      description: 'Field definitions',
      patternProperties: {
        '^[a-z_][a-z0-9_]*$': {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              enum: [
                'text', 'textarea', 'number', 'currency',
                'date', 'datetime', 'boolean', 'select',
                'lookup', 'master_detail', 'email', 'url'
              ],
              description: 'Field type'
            },
            label: { type: 'string' },
            required: { type: 'boolean' },
            validation: { type: 'object' }
          }
        }
      }
    },
    validation: {
      type: 'object',
      description: 'Object-level validation rules'
    }
  }
};
```

### Custom Autocomplete Provider
```typescript
function getObjectQLSuggestions(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): monaco.languages.CompletionItem[] {
  const wordInfo = model.getWordUntilPosition(position);
  const range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: wordInfo.startColumn,
    endColumn: wordInfo.endColumn
  };
  
  // Field type suggestions
  const fieldTypes = [
    { label: 'text', kind: monaco.languages.CompletionItemKind.Keyword },
    { label: 'number', kind: monaco.languages.CompletionItemKind.Keyword },
    { label: 'date', kind: monaco.languages.CompletionItemKind.Keyword },
    { label: 'select', kind: monaco.languages.CompletionItemKind.Keyword },
    { label: 'lookup', kind: monaco.languages.CompletionItemKind.Keyword }
  ];
  
  // Detect context and provide relevant suggestions
  const lineContent = model.getLineContent(position.lineNumber);
  
  if (lineContent.includes('type:')) {
    return fieldTypes.map(type => ({
      ...type,
      range,
      insertText: type.label
    }));
  }
  
  // More context-aware suggestions...
  return [];
}
```

### Diff View Component
```typescript
import { DiffEditor } from '@monaco-editor/react';

function SchemaDiffView({ original, modified }) {
  return (
    <DiffEditor
      height="100%"
      language="yaml"
      original={original}
      modified={modified}
      options={{
        readOnly: true,
        renderSideBySide: true
      }}
    />
  );
}
```

## 📦 Dependencies

### New Dependencies
```json
{
  "@monaco-editor/react": "^4.6.0",  // Monaco React wrapper
  "monaco-editor": "^0.46.0",        // VS Code editor
  "monaco-yaml": "^5.1.1",           // YAML support
  "js-yaml": "^4.1.0"                // YAML parsing
}
```

### Bundle Size Consideration
Monaco Editor is large (~2MB). Implement:
- Code splitting (lazy load editor)
- CDN hosting for Monaco assets
- Tree shaking

## 🧪 Testing Requirements

- [ ] Unit tests for custom providers (autocomplete, hover)
- [ ] Integration tests for save functionality
- [ ] E2E tests for editing workflows
- [ ] Test schema validation
- [ ] Test multi-file editing
- [ ] Test keyboard shortcuts
- [ ] Performance tests (large files)
- [ ] Accessibility tests

## 📚 Documentation Needed

- [ ] User guide: Using the schema editor
- [ ] User guide: Keyboard shortcuts
- [ ] User guide: Schema validation
- [ ] Developer guide: Adding custom snippets
- [ ] Developer guide: Extending autocomplete

## 🔗 Related Issues

- Related to: #TBD Schema Validation
- Related to: #TBD File Management
- Blocks: #TBD Live Preview

## 💡 Future Enhancements (Out of Scope)

- Live preview of object (split view with rendered form)
- Git integration (commit, diff, history)
- Collaborative editing (multiplayer)
- AI-powered code completion
- Schema generation from natural language
- Migration script generator
- Schema testing/linting
- Import/export schema formats

## 🎯 Success Metrics

- Developers spend 50% less time fixing schema errors
- 90% reduction in syntax errors
- Developer satisfaction score > 4.5/5
- Time to write schema reduced by 30%
- Autocomplete usage > 60% of developers

## 👥 Assignee Suggestions

Good for:
- Senior frontend developers
- Developers experienced with Monaco/code editors
- Those passionate about developer experience

## 📝 Implementation Checklist

### Week 1: Monaco Integration
- [ ] Install and configure Monaco Editor
- [ ] Replace textarea with Monaco
- [ ] Set up YAML/JSON language support
- [ ] Implement save functionality
- [ ] Add basic keyboard shortcuts

### Week 2: IntelliSense & Validation
- [ ] Create ObjectQL JSON Schema
- [ ] Implement autocomplete provider
- [ ] Implement hover provider
- [ ] Add real-time validation
- [ ] Create error panel

### Week 3: Advanced Features
- [ ] Multi-file tabs
- [ ] Diff view
- [ ] Find and replace
- [ ] Settings panel
- [ ] Performance optimization
- [ ] Tests and documentation

---

**Estimated Timeline:** 3 weeks
**Risk Level:** Medium (Monaco can be complex to configure)
**Dependencies:** None
