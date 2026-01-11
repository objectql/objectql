# 企业级元数据组织结构

> [English Version](./README.md) | **中文版本**

本示例演示了在大型 ObjectQL 项目中**组织元数据的最佳实践**，适用于拥有数百个对象和复杂业务领域的企业级应用。

## 📋 问题陈述

在构建大型应用时，糟糕的元数据组织会导致:
- **难以找到对象** - 文件分散，没有清晰的结构
- **合并冲突** - 多个团队编辑相同的文件
- **所有权不清** - 无法知道哪个团队负责哪个领域
- **部署风险** - 无法独立部署模块
- **维护负担** - 难以理解对象之间的关系

## 🎯 解决方案：领域驱动结构

本示例展示了一种**模块化、基于领域**的组织模式，可扩展至企业级需求。

```
src/
├── core/                      # 共享/基础层
│   ├── objects/              # 跨领域使用的基础对象
│   │   ├── user.object.yml
│   │   ├── organization.object.yml
│   │   └── attachment.object.yml
│   ├── i18n/
│   │   ├── en/
│   │   └── zh-CN/
│   └── index.ts
│
├── modules/                   # 业务领域模块
│   ├── crm/                  # 客户关系管理模块
│   │   ├── objects/
│   │   │   ├── account.object.yml
│   │   │   ├── contact.object.yml
│   │   │   ├── opportunity.object.yml
│   │   │   └── lead.object.yml
│   │   ├── actions/
│   │   │   └── convert-lead.action.ts
│   │   ├── hooks/
│   │   │   └── opportunity.hooks.ts
│   │   ├── i18n/
│   │   │   ├── en/
│   │   │   └── zh-CN/
│   │   ├── README.md
│   │   └── index.ts
│   │
│   ├── hr/                   # 人力资源模块
│   │   ├── objects/
│   │   │   ├── employee.object.yml
│   │   │   ├── department.object.yml
│   │   │   ├── position.object.yml
│   │   │   └── timesheet.object.yml
│   │   ├── actions/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── README.md
│   │   └── index.ts
│   │
│   ├── finance/              # 财务会计模块
│   │   ├── objects/
│   │   │   ├── invoice.object.yml
│   │   │   ├── payment.object.yml
│   │   │   ├── expense.object.yml
│   │   │   └── budget.object.yml
│   │   ├── actions/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── README.md
│   │   └── index.ts
│   │
│   └── project/              # 项目管理模块
│       ├── objects/
│       │   ├── project.object.yml
│       │   ├── task.object.yml
│       │   ├── milestone.object.yml
│       │   └── timesheet-entry.object.yml
│       ├── actions/
│       ├── hooks/
│       ├── i18n/
│       ├── README.md
│       └── index.ts
│
├── extensions/               # 自定义扩展/覆盖
│   ├── user.extension.object.yml
│   └── README.md
│
├── shared/                   # 共享工具
│   ├── constants.ts
│   ├── validators.ts
│   └── utils.ts
│
└── index.ts                  # 应用程序入口
```

## 🏗️ 架构原则

### 1. **关注点分离**
每个模块都是自包含的，拥有自己的：
- 对象定义 (`.object.yml`)
- 业务逻辑 (actions & hooks)
- 翻译文件 (i18n)
- 文档说明

### 2. **清晰的依赖关系**
```
应用层 (modules/*)
        ↓
  基础层 (core/*)
        ↓
   外部插件
```

### 3. **团队所有权**
每个模块可以由不同的团队负责：
- `modules/crm/` → 销售团队
- `modules/hr/` → 人力资源团队
- `modules/finance/` → 财务团队

### 4. **独立部署**
模块可以：
- 并行开发
- 独立测试
- 作为功能开关部署
- 提取为独立包

## 📦 模块结构

每个模块遵循以下模式：

```
modules/[domain]/
├── objects/              # 领域对象定义
├── actions/              # 自定义操作 (*.action.ts)
├── hooks/                # 生命周期钩子 (*.hooks.ts)
├── i18n/                 # 模块特定的翻译
│   ├── en/
│   └── zh-CN/
├── README.md             # 模块文档
└── index.ts              # 模块导出
```

## 🔗 对象命名约定

### 前缀策略
对于大型项目，考虑为对象名称添加前缀：

```yaml
# ❌ 不好：名称冲突风险
name: task

# ✅ 好：清晰的模块所有权
name: project_task
```

**何时使用前缀:**
- ✅ 当多个模块可能有类似概念时
- ✅ 在多租户或插件架构中
- ❌ 当对象明显是核心共享对象时 (例如 `user`, `organization`)

### 文件命名
```
[object_name].object.yml     # 对象定义
[object_name].action.ts      # 该对象的操作
[object_name].hooks.ts       # 该对象的钩子
[object_name].data.yml       # 种子数据（可选）
```

## 🌐 大规模国际化

### 三层策略

1. **核心层** (`core/i18n/`)
   - 共享对象 (user, organization)
   - 通用 UI 标签
   
2. **模块层** (`modules/[domain]/i18n/`)
   - 领域特定对象
   - 业务术语

3. **扩展层** (`extensions/i18n/`)
   - 客户特定的自定义
   - 区域变体

### 示例结构
```
core/i18n/
  en/
    user.json
    organization.json
  zh-CN/
    user.json
    organization.json

modules/crm/i18n/
  en/
    account.json
    opportunity.json
  zh-CN/
    account.json
    opportunity.json
```

## 🔐 索引和性能策略

### 字段级索引（简单）
用于单列查询：
```yaml
fields:
  email:
    type: text
    unique: true    # 创建唯一索引
  status:
    type: select
    index: true     # 创建常规索引
```

### 复合索引（高级）
在对象根部定义，用于多列查询：
```yaml
indexes:
  # 用于查询: WHERE status = 'open' ORDER BY created_at DESC
  status_created_idx:
    fields: [status, created_at]
  
  # 用于唯一约束: UNIQUE(company_id, email)
  company_email_unique:
    fields: [company_id, email]
    unique: true
```

### 按模块的索引策略

**高流量模块** (CRM, Finance):
- 在每个过滤字段上添加索引
- 为常见查询模式使用复合索引
- 定期监控查询性能

**低流量模块** (HR, Admin):
- 在主要查找字段上添加基本索引
- 根据使用情况按需添加更多索引

## 🧩 扩展模式

使用扩展来自定义对象，而无需修改核心定义：

**核心定义** (`core/objects/user.object.yml`):
```yaml
name: user
fields:
  name: { type: text }
  email: { type: text }
```

**扩展** (`extensions/user.extension.object.yml`):
```yaml
name: user  # 相同名称触发合并
fields:
  # 添加自定义字段
  employee_id:
    type: text
    label: 员工编号
  
  # 覆盖现有字段
  email:
    required: true
    unique: true
```

## 🧪 测试策略

### 单元测试
测试单个对象模式：
```typescript
// modules/crm/objects/__tests__/account.test.ts
describe('Account Object', () => {
  it('should have required fields', () => {
    const account = loadObject('account');
    expect(account.fields.name.required).toBe(true);
  });
});
```

### 集成测试
测试模块交互：
```typescript
// modules/crm/__tests__/integration.test.ts
describe('CRM Module', () => {
  it('should convert lead to opportunity', async () => {
    // 测试跨对象逻辑
  });
});
```

## 📊 实际规模参考

| 项目规模 | 对象数 | 模块数 | 团队数 | 结构 |
|---------|--------|--------|-------|------|
| **小型** (初创公司) | 10-30 | 1-2 | 1 | 扁平 `/objects/` |
| **中型** (成长期) | 30-100 | 3-5 | 2-3 | 按领域 `/modules/` |
| **大型** (企业) | 100-500 | 8-15 | 5-10 | `/modules/` + `/plugins/` |
| **超大型** (平台) | 500+ | 15+ | 10+ | Monorepo with packages |

## 🚀 迁移路径

### 从扁平到模块化

1. **分析** - 按业务领域分组对象
2. **创建** - 创建模块目录
3. **移动** - 将对象重定位到适当的模块
4. **测试** - 验证导入和引用仍然有效
5. **文档** - 更新 README 文件

### 渐进式方法
您不必一次性重组所有内容：
```
src/
├── objects/          # 遗留扁平结构（已弃用）
├── modules/          # 新的模块化结构
│   └── crm/          # 从一个模块开始
└── index.ts          # 从两者加载
```

## 💡 专业提示

1. **从简单开始** - 对于 10 个对象不要过度设计。当达到 30-50 个对象时使用模块。

2. **文档化边界** - 每个模块的 README 应该说明：
   - 涵盖哪个业务领域
   - 关键对象和关系
   - 团队所有权
   - 对其他模块的依赖

3. **避免循环依赖** - 使用 `core/` 中的共享对象来打破循环。

4. **版本控制** - 使用 `.gitignore` 排除生成的文件：
   ```
   dist/
   *.generated.ts
   node_modules/
   ```

5. **代码生成** - 运行 `objectql generate` 为每个模块单独创建 TypeScript 类型。

## 📚 另请参阅

- [数据建模指南](../../../docs/guide/data-modeling.md)
- [插件开发](../../../docs/guide/plugins.md)
- [ObjectQL 架构](../../../docs/guide/architecture.md)

## 🤝 贡献

这是一个活生生的例子。如果您有关于企业级模式的建议，请开启 issue 或 PR！
