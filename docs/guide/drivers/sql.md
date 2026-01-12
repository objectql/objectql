# SQL Driver (Knex)

The SQL driver implementation is based on [Knex.js](https://knexjs.org/), a powerful SQL query builder. It supports all major SQL databases including PostgreSQL, MySQL, SQLite3, and SQL Server.

## Installation

```bash
npm install @objectql/driver-sql knex pg
# Replace 'pg' with 'mysql', 'sqlite3', or 'mssql' depending on your database.
```

## Configuration

The `KnexDriver` constructor accepts the standard [Knex configuration object](https://knexjs.org/guide/#configuration-options).

```typescript
import { KnexDriver } from '@objectql/driver-sql';

const driver = new KnexDriver({
  client: 'pg', // 'mysql', 'sqlite3', etc.
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'your_user',
    password: 'your_password',
    database: 'your_app_db'
  },
  // Optional: Connection pool settings
  pool: { min: 2, max: 10 }
});
```

### SQLite Example

For local development or testing with SQLite:

```typescript
const driver = new KnexDriver({
  client: 'sqlite3',
  connection: {
    filename: './local.db'
  },
  useNullAsDefault: true // Required for SQLite support
});
```

## Schema Mapping

The driver automatically maps ObjectQL types to SQL column types:

| ObjectQL Type | SQL Type | Notes |
| :--- | :--- | :--- |
| `text` | `VARCHAR(255)` | |
| `textarea` | `TEXT` | |
| `boolean` | `BOOLEAN` | or `TINYINT` in MySQL |
| `number` | `FLOAT` / `DECIMAL` | |
| `date` | `DATE` | |
| `datetime` | `TIMESTAMP` | |
| `json` | `JSON` | or `TEXT` if not supported |
