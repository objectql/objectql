# Audit Log Plugin Example

This example demonstrates how to maintain a separate Plugin package for ObjectQL with namespace support.

It demonstrates:
1. How to develop an ObjectQL Plugin
2. Listening to global events using `app.on('afterCreate', ...)`
3. How to package the plugin for use in other applications
4. **Using namespaces to prevent table name conflicts**

## Namespace Configuration

This plugin is configured with the namespace `audit` in `package.json`:

```json
{
  "objectql": {
    "namespace": "audit"
  }
}
```

When this package is loaded, all objects will be automatically prefixed:
- `note.object.yml` becomes `audit__note`
- Any `reference_to` fields pointing to `note` within the package become `audit__note`

This prevents conflicts if another package also defines a `note` object.

## Integration

See [preset-usage](../../scenarios/preset-usage) for how this plugin is consumed.

## Testing the Namespace

You can verify the namespace is working by:

1. Building the plugin:
   ```bash
   npm run build
   ```

2. Running the REPL:
   ```bash
   npm run repl
   ```

3. Checking the registered objects:
   ```javascript
   // In the REPL
   db.getConfigs()
   // You should see 'audit__note' instead of just 'note'
   ```
