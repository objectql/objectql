# Object Definition

Object files are typically defined in YAML (or JSON) and represent a business entity or database table.

Files should use **Snake Case** filenames (e.g., `project_tasks.object.yml`).

## 1. Root Properties
| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | **Required.** Unique API name of the object. Should match filename. |
| `label` | `string` | Human-readable label (e.g., "Project Task"). |
| `icon` | `string` | SLDS icon string (e.g., `standard:task`). |
| `description` | `string` | Internal description of the object. |
| `fields` | `Map` | Dictionary of field definitions. |
| `actions` | `Map` | Dictionary of custom action definitions. |

## 2. Field Definitions

Fields are defined under the `fields` key. The key for each entry corresponds to the field's API name.

```yaml
fields:
  field_name:
    type: text
    label: Field Label
```

### 2.1 Common Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | **Required.** Data type of the field. |
| `label` | `string` | Display label for UI validation messages. |
| `required` | `boolean` | If `true`, the field cannot be null/undefined. Default: `false`. |
| `unique` | `boolean` | If `true`, enforces unique values in the database. Default: `false`. |
| `defaultValue` | `any` | Default value if not provided during creation. |
| `index` | `boolean` | Creates a database index for this field. |
| `searchable` | `boolean` | Hint to include this field in global search. |
| `sortable` | `boolean` | Hint that this field can be used for sorting in UI. |
| `description` | `string` | Help text or documentation for the field. |

### 2.2 Supported Field Types

| Type | Description | Specific Properties |
| :--- | :--- | :--- |
| **Basic Types** | | |
| `text` | Single line text. | `min_length`, `max_length`, `regex` |
| `textarea` | Multiline text. | `rows`, `min_length`, `max_length` |
| `markdown` | Markdown formatted text. | |
| `html` | Rich text content (HTML). | |
| `number` | Numeric value (integer or float). | `precision`, `min`, `max` |
| `currency` | Monetary value. | `scale`, `min`, `max` |
| `percent` | Percentage value (0-1). | `scale`, `min`, `max` |
| `boolean` | `true` or `false`. | |
| **System/Format Types** | | |
| `email` | Email address with validation. | |
| `phone` | Phone number formatting. | |
| `url` | Web URL validation. | |
| `password` | Encrypted or masked string. | |
| **Date & Time** | | |
| `date` | Date only (YYYY-MM-DD). | |
| `datetime` | Date and time (ISO string). | |
| `time` | Time only (HH:mm:ss). | |
| **Complex/Media** | | |
| `file` | File attachment (stored as JSON). | `multiple` |
| `image` | Image attachment (stored as JSON). | `multiple` |
| `avatar` | User avatar image. | |
| `location` | Geolocation (lat/lng JSON). | |
| **Relationships** | | |
| `select` | Selection from a list. | `options`, `multiple` |
| `lookup` | Reference to another object. | `reference_to`, `multiple` |
| `master_detail` | Strong ownership relationship. | `reference_to` (Required) |
| **Advanced** | | |
| `formula` | Read-only calculated field. | `expression`, `data_type` |
| `summary` | Roll-up summary of child records. | `summary_object`, `summary_type`, `summary_field`, `summary_filters` |
| `auto_number` | Auto-incrementing unique identifier. | `auto_number_format` |
| `object` | JSON object structure. | |
| `grid` | Array of objects/rows. | |
| `vector` | Vector embedding for AI search. | `dimension` |

### 2.3 Relationship Fields

Key properties for `lookup` or `master_detail`:

*   **reference_to**: The `name` of the target object.

```yaml
owner:
  type: lookup
  reference_to: users
  label: Owner
```

### 2.4 Select Options

Options for `select` can be a simple list or label/value pairs.

```yaml
status:
  type: select
  options:
    - label: Planned
      value: planned
    - label: In Progress
      value: in_progress
```

## 3. Indexes

Indexes can be defined at the field level (for single-field indexes) or at the object level (for composite indexes).

### 3.1 Field-Level Indexes

You can define simple indexes directly on the field:

```yaml
fields:
  email:
    type: email
    index: true   # Creates a standard index
    unique: true  # Creates a unique index (constraint)
```

### 3.2 Object-Level Indexes

For composite indexes (spanning multiple fields), define them under the `indexes` key at the root of the file.

```yaml
indexes:
  # Index Name: Index Definition
  
  # Composite Index
  project_status_idx:
    fields: [project_id, status]
  
  # Unique Composite Index
  unique_task_name:
    fields: [project_id, name]
    unique: true
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `fields` | `string[]` | **Required.** List of field names to include in the index. |
| `unique` | `boolean` | If `true`, requires values to be unique combination. Default: `false`. |

## 4. AI & Vector Search

ObjectQL supports AI-native features like semantic search and vector embeddings directly in the schema definition.

### 4.1 AI Configuration

You can enable semantic search and other AI capabilities using the `ai` property at the root of the file.

```yaml
# Enable Semantic Search for this object
ai:
  search:
    enabled: true
    # Fields to generate embeddings from
    fields: [title, description, content]
    # Optional: Specify embedding model
    model: text-embedding-3-small
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `search.enabled` | `boolean` | Enables semantic search. System will automatically manage vector storage. |
| `search.fields` | `string[]` | List of text fields to concatenate and embed. |
| `search.model` | `string` | Model ID (e.g. `openai/text-embedding-3-small`). Defaults to system setting. |
| `search.target_field` | `string` | Optional. The name of a manual `vector` field to store embeddings in. |

### 4.2 Vector Fields

For more granular control, you can define explicit `vector` fields. This is useful if you want to store embeddings from external sources or multiple embeddings per record.

```yaml
fields:
  # Metadata
  title:
    type: text

  # Explicit Vector Storage
  content_embedding:
    type: vector
    dimension: 1536  # Required: Dimension of the vector
    index: true      # Creates a vector index (IVFFlat / HNSW)
```


