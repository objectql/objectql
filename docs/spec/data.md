# Data Seeding Metadata

Data source files allow you to seed the database with initial data. This is useful for lookup tables, configuration, or demo content.

## 1. Overview

- **Implicit Naming**: Name the file `<object_name>.data.yml` to automatically map it to an object.
- **Explicit Naming**: Use the `object` and `records` properties in the YAML content.
- **Auto-deduplication**: Currently, data seeding attempts to create records. Duplicate key errors are typically ignored (depending on driver implementation), allowing for basic idempotency.

## 2. File Format

### Option A: Implicit (Recommended)

File Name: `status.data.yml`
Target Object: `status`

```yaml
- code: "draft"
  label: "Draft"
  is_active: true

- code: "published"
  label: "Published"
  is_active: true
```

### Option B: Explicit

File Name: `initial_setup.data.yml` (can be anything)

```yaml
object: status
records:
  - code: "draft"
    label: "Draft"
  
  - code: "published"
    label: "Published"
```

### Option C: Multiple Objects (Bundled)

Not currently supported in a single file. Please use separate files.

## 3. Best Practices

1.  **Use Immutable IDs**: If possible, provide explicit IDs (`_id`) to ensure consistent referencing across environments.
2.  **Versioning**: Include a metadata field if you need to track data versions.
3.  **Order Matters**: If you have relationships, ensure the parent data is loaded before child data (ObjectQL loads data files in alphabetical order).
