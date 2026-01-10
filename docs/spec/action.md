# Action Definitions (RPC)

Custom business logic can be defined in the `actions` section. Actions act as Remote Procedure Calls (RPC) scoped to the object.

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

## 1. Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Display label (e.g., for buttons). |
| `icon` | `string` | Icon name. |
| `description` | `string` | Help text. |
| `confirmText` | `string` | Confirmation message before execution. |
| `params` | `Map<string, FieldConfig>` | Input parameters schema. Same structure as Object fields. |
| `result` | `FieldConfig` | The shape of the return value. |
