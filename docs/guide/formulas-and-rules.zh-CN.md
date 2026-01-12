# 公式和规则语法指南

本指南涵盖了 ObjectQL 中公式和验证规则的完整语法。理解这些模式将帮助您创建强大的计算字段并执行业务规则。

## 目录

1. [公式语法](#公式语法)
2. [验证规则语法](#验证规则语法)
3. [权限规则语法](#权限规则语法)
4. [表达式求值](#表达式求值)
5. [常用操作符](#常用操作符)
6. [最佳实践](#最佳实践)

## 公式语法

公式用于创建计算字段，其值从其他字段或表达式派生。它们是只读的，会自动计算。

### 基本公式结构

```yaml
fields:
  field_name:
    type: formula
    expression: "field1 + field2"
    data_type: number  # 结果类型: number, text, date, boolean
```

### 表达式语法

ObjectQL 公式使用 **JavaScript 风格的表达式**和字段引用：

#### 字段引用

```yaml
# 简单字段引用 - 直接使用字段名
calc_total:
  type: formula
  expression: "price * quantity"
  data_type: number

# 使用花括号（替代语法）
calc_total_alt:
  type: formula
  expression: "{price} * {quantity}"
  data_type: number
```

#### 算术运算

```yaml
# 加法
profit:
  type: formula
  expression: "revenue - cost"
  data_type: currency

# 乘法
area:
  type: formula
  expression: "width * height"
  data_type: number

# 除法
average_score:
  type: formula
  expression: "total_score / num_attempts"
  data_type: number

# 百分比
profit_margin:
  type: formula
  expression: "(revenue - cost) / revenue * 100"
  data_type: percent
```

#### 字符串操作

```yaml
# 连接
full_name:
  type: formula
  expression: "first_name + ' ' + last_name"
  data_type: text

# 字符串方法
uppercase_name:
  type: formula
  expression: "name.toUpperCase()"
  data_type: text
```

#### 日期计算

```yaml
# 日期差异
days_open:
  type: formula
  expression: "$today - created_date"
  data_type: number

# 日期比较
is_overdue:
  type: formula
  expression: "due_date < $today && status != 'completed'"
  data_type: boolean
```

#### 条件公式

```yaml
# 简单 if/else
priority_label:
  type: formula
  expression: "score > 80 ? 'High' : 'Low'"
  data_type: text

# 多条件
status_category:
  type: formula
  expression: |
    if (amount > 10000) {
      return 'High Value';
    } else if (amount > 1000) {
      return 'Medium Value';
    } else {
      return 'Low Value';
    }
  data_type: text
```

#### 查找字段引用

```yaml
# 使用点表示法访问相关对象字段
account_owner_name:
  type: formula
  expression: "customer.account.owner.name"
  data_type: text

# 嵌套查找
region_manager:
  type: formula
  expression: "account.region.manager.email"
  data_type: text
```

### 特殊变量

| 变量 | 描述 | 示例 |
|------|------|------|
| `$today` | 当前日期 (YYYY-MM-DD) | `$today - created_date` |
| `$now` | 当前时间戳 | `$now` |
| `$current_user.id` | 当前用户 ID | `owner_id == $current_user.id` |
| `$current_user.name` | 当前用户名 | `$current_user.name` |

### 公式示例

#### 收入计算

```yaml
# 简单利润
profit:
  type: formula
  expression: "revenue - cost"
  data_type: currency

# 利润率百分比
profit_margin:
  type: formula
  expression: "(revenue - cost) / revenue * 100"
  data_type: percent

# 折扣价格
final_price:
  type: formula
  expression: "list_price * (1 - discount_rate)"
  data_type: currency
```

#### 日期和时间

```yaml
# 年龄计算
days_since_created:
  type: formula
  expression: "$today - created_date"
  data_type: number

# 是否过期
is_expired:
  type: formula
  expression: "expiration_date < $today"
  data_type: boolean

# 持续时间
project_duration_days:
  type: formula
  expression: "end_date - start_date"
  data_type: number
```

#### 状态和分类

```yaml
# 基于多个因素的风险级别
risk_level:
  type: formula
  expression: |
    if (amount > 100000 && customer.credit_score < 600) {
      return 'High Risk';
    } else if (amount > 50000 || customer.credit_score < 700) {
      return 'Medium Risk';
    } else {
      return 'Low Risk';
    }
  data_type: text

# 优先级分数
priority_score:
  type: formula
  expression: |
    (urgency_level * 0.4) + 
    (impact_level * 0.4) + 
    (customer_tier * 0.2)
  data_type: number
```

## 验证规则语法

验证规则强制执行数据质量和业务逻辑。它们可以是简单的字段检查或复杂的跨字段验证。

### 规则类型

ObjectQL 支持多种类型的验证规则：

1. **字段验证** - 单字段约束
2. **跨字段验证** - 比较多个字段
3. **条件验证** - 基于条件应用规则
4. **状态机** - 强制状态转换
5. **业务规则** - 复杂业务逻辑
6. **自定义验证** - JavaScript 函数

### 字段验证

直接在字段配置中定义：

```yaml
# 在 object.yml 中
fields:
  email:
    type: email
    required: true
    validation:
      format: email
      message: "请输入有效的电子邮件地址"
  
  age:
    type: number
    validation:
      min: 0
      max: 150
      message: "年龄必须在 0 到 150 之间"
  
  username:
    type: text
    required: true
    validation:
      min_length: 3
      max_length: 20
      pattern: "^[a-zA-Z0-9_]+$"
      message: "用户名必须是 3-20 个字母数字字符"
```

### 跨字段验证

比较多个字段之间的值：

```yaml
# 在 project.validation.yml 中
rules:
  - name: valid_date_range
    type: cross_field
    rule:
      field: end_date
      operator: ">="
      compare_to: start_date
    message: "结束日期必须在开始日期之后或相同"
    error_code: "INVALID_DATE_RANGE"
```

#### 支持的操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `=` | 等于 | `field: status, operator: "=", value: "active"` |
| `!=` | 不等于 | `field: status, operator: "!=", value: null` |
| `>` | 大于 | `field: end_date, operator: ">", compare_to: start_date` |
| `>=` | 大于或等于 | `field: budget, operator: ">=", value: 0` |
| `<` | 小于 | `field: age, operator: "<", value: 18` |
| `<=` | 小于或等于 | `field: discount, operator: "<=", value: 1` |
| `in` | 在数组中 | `field: status, operator: "in", value: ["active", "pending"]` |
| `not_in` | 不在数组中 | `field: status, operator: "not_in", value: ["deleted"]` |
| `contains` | 字符串/数组包含 | `field: tags, operator: "contains", value: "urgent"` |
| `not_empty` | 字段不为空 | `field: description, operator: "not_empty"` |

### 条件验证

仅在满足某些条件时应用验证：

```yaml
rules:
  - name: description_required_for_high_budget
    type: conditional
    description: "高预算项目需要描述"
    condition:
      field: budget
      operator: ">"
      value: 10000
    rule:
      field: description
      operator: "not_empty"
    message: "预算超过 $10,000 的项目需要描述"
```

### 状态机验证

强制执行有效的状态转换：

```yaml
rules:
  - name: status_transition
    type: state_machine
    field: status
    transitions:
      planning:
        allowed_next: [active, cancelled]
      active:
        allowed_next: [on_hold, completed, cancelled]
      on_hold:
        allowed_next: [active, cancelled]
      completed:
        allowed_next: []
        is_terminal: true
      cancelled:
        allowed_next: []
        is_terminal: true
    message: "从 {{old_status}} 到 {{new_status}} 的状态转换无效"
    error_code: "INVALID_STATE_TRANSITION"
```

### 业务规则验证

具有多个条件的复杂业务逻辑：

```yaml
rules:
  - name: budget_within_limits
    type: business_rule
    constraint:
      expression: "budget <= department.budget_limit OR executive_approval = true"
      relationships:
        department:
          via: department_id
          fields: [budget_limit]
    message: "预算超过部门限制。需要高管批准。"
    error_code: "BUDGET_LIMIT_EXCEEDED"
    trigger: [create, update]
    fields: [budget, department_id, executive_approval]
```

### 自定义验证

用于复杂逻辑的 JavaScript 验证函数：

```yaml
rules:
  - name: credit_check
    type: custom
    message: "客户信用额度超限"
    error_code: "CREDIT_LIMIT_EXCEEDED"
    trigger: [create, update]
    fields: [amount, customer_id]
    validator: |
      async function validate(record, context) {
        const customer = await context.api.findOne('customers', record.customer_id);
        const totalOrders = await context.api.sum('orders', 'amount', [
          ['customer_id', '=', record.customer_id],
          ['status', 'in', ['pending', 'processing']]
        ]);
        
        return (totalOrders + record.amount) <= customer.credit_limit;
      }
```

## 权限规则语法

权限规则根据用户角色和记录条件控制数据访问。

### 基本权限规则

```yaml
# 在 project.permission.yml 中
rules:
  - name: owner_full_access
    description: "记录所有者拥有完全访问权限"
    priority: 10
    condition:
      field: owner_id
      operator: "="
      value: $current_user.id
    permissions:
      read: true
      create: true
      update: true
      delete: true
```

### 复杂条件

```yaml
rules:
  - name: public_approved_read_only
    description: "公开批准的记录是只读的"
    condition:
      all_of:
        - field: status
          operator: "="
          value: approved
        - field: is_public
          operator: "="
          value: true
    permissions:
      read: true
      update: false
      delete: false
```

### 条件操作符

| 操作符 | 描述 |
|--------|------|
| `all_of` | 所有条件必须为真（AND） |
| `any_of` | 任何条件必须为真（OR） |
| `none_of` | 没有条件可以为真（NOT） |

## 表达式求值

### 表达式上下文

当表达式被求值时，它们可以访问：

1. **记录字段** - 当前记录数据
2. **相关记录** - 通过查找/主从关系
3. **系统变量** - `$today`、`$now`、`$current_user`
4. **先前值** - 用于更新操作（在验证中）

### 求值顺序

1. 字段级验证（必填、格式、范围）
2. 跨字段验证
3. 业务规则验证
4. 自定义验证
5. 状态机验证

### 错误处理

```yaml
rules:
  - name: safe_division
    type: custom
    validator: |
      function validate(record) {
        if (record.denominator === 0) {
          return false;
        }
        return (record.numerator / record.denominator) < 100;
      }
    message: "结果必须小于 100（不允许除以零）"
```

## 常用操作符

### 比较操作符

```javascript
// 相等性
field = value
field != value

// 数值比较
field > value
field >= value
field < value
field <= value

// 集合成员资格
field in [value1, value2, value3]
field not_in [value1, value2]

// 字符串操作
field contains "substring"
field starts_with "prefix"
field ends_with "suffix"

// 存在性
field is_null
field is_not_null
field not_empty
```

### 逻辑操作符

```yaml
# AND - 所有条件必须为真
condition:
  all_of:
    - field: status
      operator: "="
      value: active
    - field: budget
      operator: ">"
      value: 1000

# OR - 至少一个条件必须为真
condition:
  any_of:
    - field: priority
      operator: "="
      value: high
    - field: amount
      operator: ">"
      value: 10000

# NOT - 条件必须为假
condition:
  none_of:
    - field: status
      operator: "="
      value: deleted
```

### 数组过滤器

在查询语言中用于过滤记录：

```javascript
// 基本过滤器 - [field, operator, value]
["status", "=", "active"]

// 使用 AND 的多个过滤器
[
  ["status", "=", "active"],
  "and",
  ["amount", ">", 1000]
]

// 使用 OR 的多个过滤器
[
  ["priority", "=", "high"],
  "or",
  ["amount", ">", 50000]
]

// 复杂的嵌套条件
[
  ["status", "=", "active"],
  "and",
  [
    ["priority", "=", "high"],
    "or",
    ["amount", ">", 10000]
  ]
]
```

## 最佳实践

### 公式最佳实践

1. **保持公式简单** - 复杂逻辑应该在钩子或动作中
2. **使用适当的数据类型** - 为结果指定正确的 `data_type`
3. **处理空值** - 对可选字段使用条件检查
4. **记录复杂公式** - 添加注释解释业务逻辑
5. **测试边界情况** - 验证除以零、空值等

```yaml
# 好 - 简单明了
discount_amount:
  type: formula
  expression: "list_price * discount_rate"
  data_type: currency

# 好 - 处理空值
full_name:
  type: formula
  expression: "(first_name || '') + ' ' + (last_name || '')"
  data_type: text

# 避免 - 对于公式来说太复杂
complex_score:
  type: formula
  expression: |
    var base = weight * coefficient;
    for (var i = 0; i < iterations; i++) {
      base = base * (1 + rate);
    }
    return base;
  data_type: number
  # 更好：移到钩子或动作中
```

### 验证规则最佳实践

1. **尽可能使用声明式规则** - 优先使用 `cross_field` 而不是 `custom`
2. **提供清晰的错误消息** - 帮助用户理解问题所在
3. **设置适当的严重性** - 使用 `error`、`warning` 或 `info`
4. **按失败可能性排序规则** - 快速失败优化
5. **使用 AI 上下文** - 帮助 AI 工具理解业务意图

```yaml
# 好 - 清晰的消息和意图
rules:
  - name: valid_date_range
    type: cross_field
    ai_context:
      intent: "确保时间线合乎逻辑"
      business_rule: "项目不能在开始之前结束"
    rule:
      field: end_date
      operator: ">="
      compare_to: start_date
    message: "结束日期必须在开始日期之后或相同"
    severity: error

# 好 - 条件验证
  - name: approval_required_for_high_value
    type: conditional
    condition:
      field: amount
      operator: ">"
      value: 50000
    rule:
      field: approved_by
      operator: "not_empty"
    message: "超过 $50,000 的交易需要批准"
    severity: error
```

### 性能优化

1. **最小化异步验证** - 它们会减慢操作速度
2. **使用索引** - 对验证查找中使用的字段
3. **缓存验证结果** - 在适当的时候
4. **批量验证** - 用于批量操作

```yaml
rules:
  - name: inventory_check
    type: custom
    batch_enabled: true
    batch_size: 100
    validator: |
      async function validateBatch(records, context) {
        const skus = records.map(r => r.sku);
        const inventory = await context.api.find('inventory', {
          filters: [['sku', 'in', skus]]
        });
        
        return records.map(record => {
          const inv = inventory.find(i => i.sku === record.sku);
          return inv && inv.available_quantity >= record.quantity;
        });
      }
```

## 相关文档

- [对象定义](../spec/object.md) - 完整的对象元数据参考
- [验证规则](../spec/validation.md) - 详细的验证规范
- [权限规则](../spec/permission.md) - 访问控制文档
- [查询语言](../spec/query-language.md) - 查询语法和过滤器
- [钩子和动作](./logic-hooks.md) - 自定义业务逻辑

## 示例

有关工作示例，请参见：

- `/packages/starters/basic/src/modules/projects/` - 项目验证示例
- `/packages/starters/enterprise/src/modules/crm/` - CRM 业务规则
- `/examples/tutorials/` - 带有公式和规则的教程项目
