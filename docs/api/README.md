# ObjectQL API Reference

**Version:** 1.0.0

This document provides a comprehensive reference for all ObjectQL API interfaces. Given the extensive metadata capabilities of ObjectQL, we provide multiple API styles to suit different use cases.

## Table of Contents

1. [API Overview](#api-overview)
2. [JSON-RPC Style API](./json-rpc.md)
3. [REST-Style API](./rest.md)
4. [GraphQL API](./graphql.md)
5. [Metadata API](./metadata.md)
6. [File & Attachment API](./attachments.md)
7. [WebSocket API](./websocket.md)
8. [Authentication & Authorization](./authentication.md)
9. [Error Handling](./error-handling.md)
10. [Rate Limiting](./rate-limiting.md)
11. [Examples](./examples.md)

---

## API Overview

ObjectQL provides a **unified query protocol** that can be exposed through multiple API styles:

| API Style | Use Case | Endpoint Pattern |
|-----------|----------|------------------|
| **JSON-RPC** | Universal client, AI agents, microservices | `POST /api/objectql` |
| **REST** | Traditional web apps, mobile apps | `GET/POST/PUT/DELETE /api/data/:object` |
| **Metadata** | Admin interfaces, schema discovery, runtime config | `GET /api/metadata/*` |
| **GraphQL** | Modern frontends with complex data requirements | `POST /api/graphql` |
| **WebSocket** | Real-time apps, live updates | `ws://host/api/realtime` *(Planned)* |

### Design Principles

1. **Protocol-First**: All APIs accept/return structured JSON, never raw SQL
2. **Type-Safe**: Full TypeScript definitions for all requests/responses
3. **AI-Friendly**: Queries include optional `ai_context` for explainability
4. **Secure**: Built-in validation, permission checks, SQL injection prevention
5. **Universal**: Same query works across MongoDB, PostgreSQL, SQLite

### Unified ID Field

ObjectQL uses a **unified `id` field** as the primary key across all database drivers:

- **Consistent Naming**: Always use `id` in API requests and responses
- **Database Agnostic**: Works seamlessly with both MongoDB (which uses `_id` internally) and SQL databases
- **Automatic Mapping**: MongoDB driver transparently converts between `id` (API) and `_id` (database)

**Example:**
```json
// Create with custom ID - works with any driver
{
  "op": "create",
  "object": "users",
  "args": {
    "id": "user-123",
    "name": "Alice"
  }
}

// Query by ID - works with any driver
{
  "op": "find",
  "object": "users",
  "args": {
    "filters": [["id", "=", "user-123"]]
  }
}

// Response always uses 'id'
{
  "data": [
    {
      "id": "user-123",
      "name": "Alice"
    }
  ]
}
```

See the [Driver Documentation](../guide/drivers/index.md) for more details.
