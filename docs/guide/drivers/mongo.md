# MongoDB Driver

The MongoDB driver allows ObjectQL to store data in a MongoDB database (version 4.0+). It takes advantage of MongoDB's document model to store JSON fields natively and flexible schemas.

## Installation

```bash
npm install @objectql/driver-mongo mongodb
```

## Configuration

The `MongoDriver` accepts connection parameters directly.

```typescript
import { MongoDriver } from '@objectql/driver-mongo';

const driver = new MongoDriver({
  url: 'mongodb://localhost:27017', // Connection string
  dbName: 'my_app_db',              // Database name
  options: {
    // Optional MongoDB client options
    maxPoolSize: 10
  }
});
```

## IDs and `_id`

MongoDB uses `_id` as the primary key. ObjectQL will map the standard `_id` field to the ObjectQL `_id` field.
When querying, ObjectQL handles the conversion between string IDs and `ObjectId` automatically.

## Limitations

*   **Joins**: While MongoDB supports `$lookup` (which this driver uses for joins), complex relationships across many collections can be slower than SQL.
*   **Transactions**: Transactions are supported but require a MongoDB Replica Set deployment.
