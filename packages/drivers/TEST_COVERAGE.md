# Database Driver Test Coverage

This document describes the comprehensive test coverage for ObjectQL database drivers.

## Overview

The test suite ensures all database drivers implement the `Driver` interface correctly and handle edge cases properly.

## Official Production Drivers

### SQL Driver (SqlDriver)

Location: `packages/drivers/sql/test/`

### Test Files

1. **index.test.ts** - Basic CRUD operations (18 tests)
   - Instantiation and configuration
   - Find with filters and sorting
   - FindOne by ID and query
   - Create, Update, Delete operations
   - Count operations
   - Custom ID mapping (_id to id)
   - AND/OR filter logic

2. **schema.test.ts** - Schema synchronization (10 tests)
   - Table creation
   - Column addition (non-destructive)
   - Field type mapping (string, integer, float, boolean, date, datetime, json, etc.)
   - Multiple field handling
   - Special field types (formula, summary, auto_number)
   - Constraints (unique, required)
   - Idempotent operations

3. **advanced.test.ts** - Advanced operations (26 tests)

   #### Aggregate Operations (7 tests)
   - SUM aggregation
   - COUNT aggregation
   - AVG aggregation
   - MIN/MAX aggregation
   - GROUP BY with aggregates
   - Multiple GROUP BY fields
   - Filtered aggregation

   #### Bulk Operations (4 tests)
   - createMany - Insert multiple records
   - updateMany - Update by filters
   - deleteMany - Delete by filters
   - Empty bulk operations handling

   #### Transaction Support (3 tests)
   - Begin and commit transaction
   - Begin and rollback transaction
   - Multiple operations in single transaction

   #### Edge Cases & Error Handling (12 tests)
   - Empty filters
   - Undefined query parameters
   - Null values in data
   - Pagination (skip/limit)
   - Skip beyond total records
   - Complex nested filters
   - Contains filter (LIKE operator)
   - IN filter
   - NIN (NOT IN) filter
   - FindOne with query parameter
   - Non-existent record handling
   - Count with complex filters

### Total SQL Driver Tests: 54 tests

## MongoDB Driver (MongoDriver)

Location: `packages/drivers/mongo/test/`

### Test Files

1. **index.test.ts** - Mocked unit tests (3 tests)
   - Driver instantiation
   - Find with filters
   - OR filter handling

2. **integration.test.ts** - Integration tests (39 tests, skip when MongoDB unavailable)

   #### Basic CRUD Operations (16 tests)
   - Create document
   - Create with custom _id
   - Find with filters
   - Comparison operators (>, <, >=, <=, !=)
   - OR filters
   - IN filter
   - Contains filter (regex)
   - FindOne by ID
   - FindOne by query
   - Update document
   - Update with atomic operators ($inc, $set)
   - Delete document
   - Count with filters
   - Count all documents

   #### Bulk Operations (5 tests)
   - createMany - Insert multiple documents
   - updateMany - Update by filters
   - updateMany with atomic operators
   - deleteMany - Delete by filters
   - Empty bulk operations handling

   #### Query Options (7 tests)
   - Sort ascending
   - Sort descending
   - Limit results
   - Skip results
   - Pagination (skip + limit)
   - Field projection
   - Combined filters, sort, skip, limit

   #### Aggregate Operations (3 tests)
   - Simple aggregation pipeline
   - Count aggregation
   - Average calculation

   #### Edge Cases (8 tests)
   - Empty collection handling
   - Null values
   - Nested objects
   - Arrays
   - Non-existent document
   - Skip beyond total count
   - Complex filter combinations
   - NIN (NOT IN) filter
   - != operator
   - >= and <= operators

### Total MongoDB Driver Tests: 42 tests

---

## Example Driver Implementations

### Redis Driver (RedisDriver) - Example/Template

Location: `packages/drivers/redis/test/`

**Status:** ⚠️ **Example Implementation Only** - Not for production use

The Redis driver is provided as a **reference implementation** to demonstrate how to create custom ObjectQL drivers. It shows the complete pattern but has performance limitations.

#### Test Files

1. **index.test.ts** - Basic functionality (20+ tests)
   - Connection management
   - CRUD operations (Create, Read, Update, Delete)
   - Query filtering (equality, comparison, OR logic, contains)
   - Query options (sorting, pagination, field projection)
   - Count operations

#### Purpose

- Educational reference for driver developers
- Template for creating new database drivers
- Demonstrates ObjectQL driver interface implementation
- Shows filter, sort, and pagination logic

#### Known Limitations

- Uses Redis KEYS command (scans all keys - inefficient for production)
- All filtering and sorting done in-memory
- Not suitable for large datasets (> 10K records)
- No transaction support
- No aggregation support

#### Production Recommendations

For production Redis support, enhance with:
- RedisJSON module for native JSON queries
- RedisSearch for indexed queries
- Secondary indexes using Redis Sets
- Cursor-based pagination
- Connection pooling

### Total Redis Driver Tests: ~20 tests (Example only)

---

## Test Coverage Summary

| Driver | Files | Tests | Status |
|--------|-------|-------|--------|
| SQL (SqlDriver) | 3 | 54 | ✅ All Passing (Production) |
| MongoDB (MongoDriver) | 2 | 42 | ✅ All Passing (Production, 39 skip without MongoDB) |
| Redis (RedisDriver) | 1 | ~20 | ⚠️ Example/Template Only |
| **Production Total** | **5** | **96** | **✅** |

### Run all driver tests
```bash
pnpm -r test
```

### Run SQL driver tests only
```bash
cd packages/drivers/sql
pnpm test
```

### Run MongoDB driver tests only
```bash
cd packages/drivers/mongo
pnpm test
```

### Run specific test file
```bash
cd packages/drivers/sql
pnpm test -- advanced.test.ts
```

## MongoDB Integration Tests

The MongoDB integration tests are designed to:
- Automatically skip when MongoDB is not available
- Connect to a local MongoDB instance (default: mongodb://localhost:27017)
- Clean up test data after each test
- Support custom MongoDB URL via `MONGO_URL` environment variable

### Running with custom MongoDB instance
```bash
MONGO_URL=mongodb://localhost:27017 pnpm test
```

### Running with Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb-test mongo:latest
cd packages/drivers/mongo
pnpm test
```

## Test Coverage Summary

| Driver | Files | Tests | Status |
|--------|-------|-------|--------|
| SQL (SqlDriver) | 3 | 54 | ✅ All Passing |
| MongoDB (MongoDriver) | 2 | 42 | ✅ All Passing (39 skip without MongoDB) |
| **Total** | **5** | **96** | **✅** |

## Coverage Areas

### ✅ Fully Covered
- Basic CRUD operations (Create, Read, Update, Delete)
- Query operations (filters, sorting, pagination)
- Bulk operations (createMany, updateMany, deleteMany)
- Aggregate operations (sum, avg, count, min, max, groupBy)
- Transaction support (SQL only)
- Schema synchronization (SQL only)
- Edge cases (null values, empty collections, nested objects)
- Error handling (constraints, validation)
- All filter operators (=, !=, >, <, >=, <=, in, nin, contains)

### 📝 Notes
- MongoDB integration tests require a running MongoDB instance
- SQLite is used for SQL driver tests (no external dependencies)
- All tests use TypeScript with Jest
- Tests follow the existing project conventions

## Future Enhancements

Potential areas for additional test coverage:
1. Performance benchmarks
2. Concurrent operation testing
3. Connection pooling tests
4. Migration tests
5. Cross-driver compatibility tests
6. Error recovery scenarios
7. Memory leak detection
