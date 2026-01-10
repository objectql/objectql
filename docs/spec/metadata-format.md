# ObjectQL Metadata Specification

**Version:** 1.0.0

## 1. Architecture Overview

ObjectQL is a **query transpiler** that converts a standardized JSON-DSL into native database queries.

* **Pattern:** Repository Pattern with a Multi-Datasource strategy.
* **Datasources:**
  * **MongoDB:** Schema-less, fast iteration.
  * **PostgreSQL/Knex:** Schema-strict, JSONB hybrid storage.
* **Execution Flow:** `Client -> JSON DSL -> ObjectQL Core -> Driver -> Native Query -> DB`.

## 3. Object Definition

Object files are typically defined in YAML (or JSON) and represent a business entity or database table.

Files should use **Snake Case** filenames (e.g., `project_tasks.object.yml`).

### 3.2 Root Properties
| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | **Required.** Unique API name of the object. Should match filename. |
| `label` | `string` | Human-readable label (e.g., "Project Task"). |
| `icon` | `string` | SLDS icon string (e.g., `standard:task`). |
| `description` | `string` | Internal description of the object. |
| `fields` | `Map` | Dictionary of field definitions. |
| `actions` | `Map` | Dictionary of custom action definitions. See Section 5. |
| `customizable` | `boolean` | Whether this object can be modified or deleted. System objects (e.g., `user`, `session`) should be set to `false`. **Default: `true`** (if not specified, the object is customizable). |

## 4. Field Definitions

Fields are defined under the `fields` key. The key for each entry corresponds to the field's API name.

```yaml
fields:
  field_name:
    type: text
    label: Field Label
```

### 4.1 Common Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | **Required.** Data type of the field. See Section 4.2. |
| `label` | `string` | Display label for UI validation messages. |
| `required` | `boolean` | If `true`, the field cannot be null/undefined. Default: `false`. |
| `defaultValue` | `any` | Default value if not provided during creation. |
| `index` | `boolean` | Hint to create a database index. |
| `searchable` | `boolean` | Hint to include this field in global search. |
| `sortable` | `boolean` | Hint that this field can be used for sorting in UI. |
| `description` | `string` | Help text or documentation for the field. |
| `customizable` | `boolean` | Whether this field can be modified or deleted. System fields (e.g., `_id`, `createdAt`, `updatedAt`) should be set to `false`. **Default: `true`** (if not specified, the field is customizable). |

### 4.2 Supported Field Types

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

### 4.6 Field Attributes

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `required` | `boolean` | If true, database enforces NOT NULL. |
| `unique` | `boolean` | If true, database enforces UNIQUE constraint. |
| `readonly` | `boolean` | UI hint: Field should not be editable by users. |
| `hidden` | `boolean` | UI/API hint: Field should be hidden by default. |
| `defaultValue` | `any` | Default value on creation. |
| `help_text` | `string` | Tooltip for end-users. |
| `multiple` | `boolean` | Allows multiple values (stored as JSON array). |
| `min`, `max` | `number` | Range validation for numeric types. |
| `min_length`, `max_length` | `number` | Length validation for text types. |
| `regex` | `string` | Custom regular expression validation. |


### 4.3 Relationship Fields

Key properties for `lookup` or `master_detail`:

*   **reference_to**: The `name` of the target object.

```yaml
owner:
  type: lookup
  reference_to: users
  label: Owner
```

### 4.4 Select Options

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

## 5. Actions (RPC)

Custom business logic can be defined in the `actions` section.

```yaml
actions:
  approve:
    label: Approve Request
    description: Approves the current record.
    params:
      comment:
        type: textarea
        label: Approval Comments
    result:
      type: boolean
```