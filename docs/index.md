---
layout: home

hero:
  name: ObjectQL
  text: The Backend for the AI Coding Era
  tagline: Traditional ORMs were built for humans typing in IDEs. ObjectQL is a structured protocol designed for LLMs to generate perfect, hallucination-free backend logic.
  image:
    src: /logo.svg
    alt: ObjectQL Logo
  actions:
    - theme: brand
      text: 🤖 Setup AI Coding Assistant
      link: /ai/coding-assistant
    - theme: alt
      text: 🚀 Quick Start
      link: /guide/getting-started

features:
  - icon: 🧠
    title: LLM-Native Protocol
    details: Stop asking AI to write SQL or complex Method Chains. ObjectQL uses strict JSON ASTs for logic, reducing hallucinations and injection risks to near zero.
  - icon: 📄
    title: Metadata-Driven
    details: Define your Data Models, Hooks, and Actions in pure YAML/JSON. It's the perfect context format for RAG and Long-term Memory for Agents.
  - icon: 🔌
    title: Universal Runtime
    details: One protocol running on PostgreSQL, MongoDB, or SQLite. Switch underlying engines without rewriting a single line of business logic.
  - icon: ⚡
    title: Federated & Distributed
    details: Seamlessly aggregate data from local databases and remote microservices into a single unified graph. The "GraphQL Federation" for backend logic.
---

## Protocol by Example

See how ObjectQL transforms abstract definitions into working software.

### 1. Logic & Filtering

::: code-group

```yaml [1. Input: account.object.yml]
name: account
fields:
  name: text
  industry: select
  revenue: currency
  status: select
```

```bash [2. Request: Complex Query]
{
  "fields": ["name", "revenue"],
  "filters": [
    ["industry", "=", "tech"], 
    "and", 
    [["revenue", ">", 1000000], "or", ["status", "=", "vip"]]
  ]
}
```

```sql [3. Output: Optimized SQL]
SELECT name, revenue 
FROM account 
WHERE industry = 'tech' 
  AND (revenue > 1000000 OR status = 'vip')
LIMIT 20
:::

### 2. Auto-Joins & Aggregations

ObjectQL automatically handles `JOIN` operations when you group by related fields.

::: code-group

```yaml [1. Input: payment.object.yml]
name: payment
fields:
  amount: currency
  account: 
    type: lookup
    reference_to: account
```

```json [2. Request: JSON Protocol]
{
  "op": "aggregate",
  "from": "payment",
  "group": ["account.industry"],
  "sum": ["amount"]
}
```

```sql [3. Output: SQL Generation]
SELECT t2.industry, SUM(t1.amount)
FROM payment AS t1
LEFT JOIN account AS t2 ON t1.account = t2.id
GROUP BY t2.industry
```

:::

## The Shift to AI Programming

## The Shift to AI Programming

We believe the future of software development isn't about humans writing better code—it's about **Humans architecting systems that AI can implement**.

To achieve this, we need a backend technology that speaks the same language as the AI.

### Why not just use TypeORM/Prisma?

Traditional ORMs are designed for *human ergonomics*. They use complex fluent APIs, generic types, and string templates. For an LLM, these are "fuzzy" targets that lead to:
*   **Hallucinations**: Inventing methods that don't exist.
*   **Context Window Bloat**: Needing huge type definition files to understand the schema.
*   **Injection Risks**: Generating unsafe raw SQL strings.

### The ObjectQL Advantage

ObjectQL abstracts the entire backend into a **Standardized Protocol**:

1.  **Schema is Data**: `user.object.yml` is easier for AI to read/write than `class User extends Entity`.
2.  **Logic is Data**: Queries are ASTs like `{ op: 'find', filters: [['age', '>', 18]] }`. 100% deterministic.
3.  **Self-Describing**: The runtime can introspect any ObjectQL endpoint and explain it to an Agent instantly.

Start building for the future today.

## Next Steps

*   **[🤖 Configure your AI Assistant](/ai/coding-assistant)**: Get the System Prompts to turn Cursor/Copilot into an ObjectQL expert.
*   **[🔌 Building AI Agents](/ai/building-apps)**: Use ObjectQL as the tool interface and memory for your autonomous agents.
*   **[📚 Developer Guide](/guide/getting-started)**: The classic manual for human developers.
