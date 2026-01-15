# 查询语法替代方案与优化指南

本指南评估当前 ObjectQL 的查询方法，并为不同用例提供建议，以及最大化性能和开发体验的优化策略。

> **📖 完整英文版：** [Query Syntax Alternatives & Optimization Guide](./query-syntax-alternatives.md)

---

## 执行摘要

### 当前查询语法概览

ObjectQL 提供 **三种不同的查询接口**，每种都针对不同场景优化：

| 方式 | 最适合 | 复杂度 | 性能 | AI 友好度 |
|------|--------|--------|------|----------|
| **JSON-DSL（核心）** | 服务端逻辑、AI 代理 | 中等 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **REST API** | 简单 CRUD、移动应用 | 低 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **GraphQL** | 复杂数据图、现代 SPA | 高 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 1. JSON-DSL 协议（推荐默认方式）

### 什么是 JSON-DSL

ObjectQL 的核心查询语言 - 一种结构化的 JSON 表示，作为数据操作的抽象语法树（AST）。

### 何时使用

✅ **最适合：**
- 服务端业务逻辑和钩子
- AI 生成的查询（防止幻觉）
- 跨驱动兼容性（SQL、MongoDB、远程）
- 复杂的嵌套逻辑过滤
- 程序化查询构造

### 基本语法

```typescript
const tasks = await app.object('task').find({
  fields: ['name', 'status', 'due_date'],
  filters: [
    ['status', '=', 'active'],
    'and',
    ['priority', '>=', 3]
  ],
  sort: [['due_date', 'asc']],
  skip: 0,
  limit: 20
});
```

### 优化建议

#### ✅ 使用字段投影

**不好的做法：**
```typescript
// 返回所有字段（低效）
await app.object('user').find({
  filters: [['status', '=', 'active']]
});
```

**好的做法：**
```typescript
// 仅返回需要的字段（高效）
await app.object('user').find({
  fields: ['id', 'name', 'email'],
  filters: [['status', '=', 'active']]
});
```

**影响：** 对于有很多字段的对象，减少 60-80% 的负载大小。

#### ✅ 在过滤器中使用索引字段

**不好的做法：**
```typescript
// 在非索引字段上过滤
filters: [['description', 'contains', '紧急']]
```

**好的做法：**
```typescript
// 首先在索引字段上过滤
filters: [
  ['status', '=', 'open'],        // 有索引
  'and',
  ['priority', '=', 'high']       // 有索引
]
```

**影响：** 根据数据集大小，可以提高 10-100 倍的查询速度。

#### ✅ 使用 expand 替代多次查询

**不好的做法：**
```typescript
// 多次往返
const tasks = await app.object('task').find({});
for (const task of tasks) {
  task.project = await app.object('project').findOne(task.project_id);
  task.assignee = await app.object('user').findOne(task.assignee_id);
}
```

**好的做法：**
```typescript
// 单次查询扩展（JOIN）
const tasks = await app.object('task').find({
  expand: {
    project: { fields: ['name', 'status'] },
    assignee: { fields: ['name', 'email'] }
  }
});
```

**影响：** 通过消除 N+1 查询问题，减少 50-90% 的延迟。

---

## 2. REST API 接口

### 何时使用

✅ **最适合：**
- 简单的 CRUD 操作
- 对查询需求有限的移动应用
- 期望 REST 的第三方集成
- 快速原型和 MVP
- 熟悉 REST 约定的开发者

### 基本用法

```bash
# 简单过滤列出记录
GET /api/data/users?filters={"status":"active"}&limit=20

# 获取单条记录
GET /api/data/users/user_123

# 创建记录
POST /api/data/users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### 优化建议

#### ✅ 选择需要的字段

```bash
# 不好：返回所有字段
GET /api/data/users

# 好：只选择需要的字段
GET /api/data/users?fields=id,name,email
```

#### ✅ 利用 HTTP 缓存

```bash
# 为静态/读多的数据启用缓存头
GET /api/data/products?status=active
Cache-Control: public, max-age=300
```

**影响：** 可以消除读多端点 70-90% 的重复查询。

---

## 3. GraphQL 接口

### 何时使用

✅ **最适合：**
- 数据需求复杂的现代 SPA
- 在一个请求中获取多表数据
- 实时应用程序（带订阅）
- 需要自省的开发工具
- 带宽受限的移动应用

### 基本用法

```graphql
query GetTasksWithDetails {
  taskList(
    filters: { status: "active", priority: { gte: 3 } }
    limit: 20
    sort: { due_date: ASC }
  ) {
    items {
      id
      name
      status
      project {
        name
        owner {
          name
          email
        }
      }
      assignee {
        name
        avatar_url
      }
    }
  }
}
```

### 优化建议

#### ✅ 只请求需要的字段

**不好的做法：**
```graphql
query {
  userList {
    items {
      # 返回 20+ 个字段
      id name email phone address ... 
    }
  }
}
```

**好的做法：**
```graphql
query {
  userList {
    items {
      id
      name
      email
    }
  }
}
```

**影响：** 对于宽表，减少 70-90% 的负载大小。

#### ✅ 批量处理多个查询

**不好的做法：**
```javascript
const user = await graphql(`query { user(id: "123") { name } }`);
const tasks = await graphql(`query { taskList { items { name } } }`);
const projects = await graphql(`query { projectList { items { name } } }`);
```

**好的做法：**
```graphql
query GetDashboardData {
  user(id: "123") { name email }
  taskList(filters: { assignee_id: "123" }) { items { name status } }
  projectList(filters: { owner_id: "123" }) { items { name progress } }
}
```

**影响：** 通过消除往返，减少 60-80% 的延迟。

---

## 4. 查询方式对比

### 场景 1：简单 CRUD 操作

**用例：** 创建新用户账户

**推荐：** REST API

**原因：** 最简单的方法，标准约定，无开销。

---

### 场景 2：多数据源复杂仪表板

**用例：** 显示任务、项目和团队成员及关系的仪表板

**推荐：** GraphQL

**原因：** 单次请求，精确字段选择，优雅处理嵌套数据。

---

### 场景 3：服务端业务逻辑

**用例：** 根据工作负载自动分配任务的自动化工作流

**推荐：** JSON-DSL

**原因：** 类型安全，驱动不可知，程序化组合。

---

### 场景 4：AI 生成的查询

**用例：** LLM 从自然语言生成查询："显示逾期的高优先级任务"

**推荐：** JSON-DSL

**原因：** 结构化格式防止幻觉，自动验证。

```typescript
// AI 生成（安全、已验证）
{
  "object": "tasks",
  "ai_context": {
    "intent": "查找逾期的高优先级任务",
    "natural_language": "显示逾期的高优先级任务"
  },
  "filters": [
    ["due_date", "<", "$today"],
    "and",
    ["priority", "=", "high"],
    "and",
    ["status", "!=", "completed"]
  ],
  "sort": [["due_date", "asc"]]
}
```

---

## 5. 高级优化技术

### 5.1 使用聚合进行分析

**不好的做法（应用层聚合）：**
```typescript
const orders = await app.object('order').find({
  filters: [['status', '=', 'paid']]
});

// 慢：在应用代码中迭代
let totalRevenue = 0;
for (const order of orders) {
  totalRevenue += order.amount;
}
```

**好的做法（数据库层聚合）：**
```typescript
const stats = await app.object('order').aggregate({
  filters: [['status', '=', 'paid']],
  groupBy: ['customer_id'],
  aggregate: [
    { func: 'sum', field: 'amount', alias: 'total_revenue' },
    { func: 'count', field: 'id', alias: 'order_count' }
  ]
});
```

**影响：** 对于大数据集，快 100-1000 倍。

---

### 5.2 使用 DISTINCT 获取唯一值

**不好的做法：**
```typescript
const orders = await app.object('order').find({
  fields: ['customer_id']
});
const uniqueCustomers = [...new Set(orders.map(o => o.customer_id))];
```

**好的做法：**
```typescript
const uniqueCustomers = await app.object('order').distinct('customer_id', {
  filters: [['year', '=', 2024]]
});
```

**影响：** 对于高重复字段，减少 90%+ 的数据传输。

---

### 5.3 使用合适的索引

```yaml
# task.object.yml
name: task
fields:
  status:
    type: select
    options: [open, in_progress, completed]
  assignee_id:
    type: lookup
    reference_to: users
  due_date:
    type: date

indexes:
  # 常见查询的复合索引
  - fields: [status, assignee_id, due_date]
    name: idx_task_active_query
  
  # 排序索引
  - fields: [created_at]
    name: idx_task_created
```

**影响：** 带索引过滤器的查询快 10-100 倍。

---

### 5.4 尽可能避免 OR 过滤器

**不好的做法（OR 需要多次索引扫描）：**
```typescript
filters: [
  ['status', '=', 'pending'],
  'or',
  ['status', '=', 'active']
]
```

**好的做法（IN 使用单次索引扫描）：**
```typescript
filters: [
  ['status', 'in', ['pending', 'active']]
]
```

**影响：** 对于大表，快 2-5 倍。

---

## 6. 性能最佳实践总结

| 实践 | 影响 | 难度 |
|------|------|------|
| 使用字段投影 | 高 | 简单 |
| 为过滤/排序字段添加索引 | 非常高 | 中等 |
| 使用聚合进行分析 | 非常高 | 简单 |
| 用 expand 消除 N+1 查询 | 非常高 | 简单 |
| 实现分页 | 高 | 简单 |
| 为大集合使用基于游标的分页 | 高 | 中等 |
| 使用 `in` 操作符替代多个 `or` | 中等 | 简单 |
| 在 GraphQL 中批量查询 | 高 | 简单 |
| 使用 `distinct` 获取唯一值 | 高 | 简单 |
| 为 REST 启用 HTTP 缓存 | 高 | 中等 |

---

## 7. 选择正确方法：决策树

```
开始
│
├─ 这是服务端逻辑还是 AI 生成的？
│  └─ 是 → 使用 JSON-DSL ✅
│
├─ 需要在一个请求中获取复杂的嵌套数据吗？
│  └─ 是 → 使用 GraphQL ✅
│
├─ 这是简单的 CRUD 操作吗？
│  └─ 是 → 使用 REST ✅
│
└─ 需要最大的灵活性？
   └─ 使用 JSON-DSL ✅（最通用）
```

---

## 8. 结论

**关键要点：**

1. **JSON-DSL** 是通用核心 - 用于服务端逻辑、AI 集成和跨驱动兼容性。

2. **GraphQL** 在具有嵌套关系的复杂数据需求方面表现出色，非常适合现代前端。

3. **REST** 非常适合简单的 CRUD 操作和第三方集成。

4. **优化比接口更重要** - 无论使用哪种方法，都要专注于索引、字段投影和分页。

5. **可以混合方法** - 前端仪表板使用 GraphQL，后端工作流使用 JSON-DSL。

**推荐的默认技术栈：**
- **服务端：** JSON-DSL（类型安全，驱动不可知）
- **客户端（复杂）：** GraphQL（高效，灵活）
- **客户端（简单）：** REST（快速，熟悉）
- **AI 集成：** JSON-DSL（防幻觉）

---

## 9. 延伸阅读

- [查询语言规范](../spec/query-language.md) - 完整的 JSON-DSL 参考
- [查询指南](./querying.md) - 逐步查询示例
- [GraphQL API 文档](../api/graphql.md) - GraphQL 设置和使用
- [REST API 文档](../api/rest.md) - REST 端点参考
- [完整英文版指南](./query-syntax-alternatives.md) - 详细的英文版本

---

**需要帮助？**

- 📖 [文档](https://objectql.org/docs)
- 💬 [社区 Discord](https://discord.gg/objectql)
- 🐛 [报告问题](https://github.com/objectstack-ai/objectql/issues)
