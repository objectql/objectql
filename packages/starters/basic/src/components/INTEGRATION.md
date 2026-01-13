# 组件集成指南 / Component Integration Guide

[English](#english) | [中文](#中文)

---

## 中文

### 如何在 React 项目中使用 CustomTable 组件

这个指南展示如何将 `CustomTable` 组件集成到任何 React 项目中，包括 ObjectOS React 前端。

## 方法一：直接复制文件（最简单）

### 步骤 1：复制组件文件

将以下文件复制到你的 React 项目中：

```bash
# 从这个仓库
cp packages/starters/basic/src/components/CustomTable.tsx <你的项目>/src/components/

# 可选：也复制示例页面
cp packages/starters/basic/src/components/TableExamplePage.tsx <你的项目>/src/pages/
```

### 步骤 2：确保依赖已安装

在你的项目中安装必要的依赖：

```bash
# React 和 TypeScript（通常已经安装）
npm install react react-dom
npm install -D @types/react @types/react-dom

# Tailwind CSS（如果还没安装）
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 步骤 3：配置 Tailwind CSS

确保你的 `tailwind.config.js` 包含组件路径：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // 确保包含你的组件目录
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

在你的主 CSS 文件中（如 `src/index.css`）导入 Tailwind：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 步骤 4：在你的页面中使用

```tsx
// 在任何 React 页面或组件中
import React from 'react';
import { CustomTable, ColumnDefinition } from '../components/CustomTable';

function ProjectsPage() {
  const columns: ColumnDefinition[] = [
    { field: 'name', label: '项目名称', width: 300 },
    { field: 'status', label: '状态', renderer: 'badge' },
    { field: 'owner', label: '负责人', width: 150 },
    { field: 'budget', label: '预算', renderer: 'currency' },
  ];

  const handleRowClick = (row: any) => {
    console.log('点击了行:', row);
    // 导航到详情页面
    // navigate(`/projects/${row.id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">项目列表</h1>
      <CustomTable
        object="projects"
        columns={columns}
        sortable={true}
        filterable={true}
        exportable={true}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default ProjectsPage;
```

## 方法二：作为 npm 包引用

### 步骤 1：发布为 npm 包

如果你想在多个项目中复用，可以将组件发布为 npm 包：

```bash
# 在 packages/starters/basic/src/components 目录创建 package.json
cd packages/starters/basic/src/components
npm init -y
```

修改 `package.json`:

```json
{
  "name": "@your-org/objectql-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "build": "tsc"
  }
}
```

### 步骤 2：在项目中安装

```bash
npm install @your-org/objectql-components
```

### 步骤 3：使用

```tsx
import { CustomTable } from '@your-org/objectql-components';

function MyPage() {
  return <CustomTable object="projects" columns={[...]} />;
}
```

## 方法三：集成到 ObjectQL Studio

如果你想将组件添加到 ObjectQL Studio 项目中：

### 步骤 1：添加到 Studio 组件目录

```bash
cp packages/starters/basic/src/components/CustomTable.tsx \
   packages/tools/studio/src/components/
```

### 步骤 2：在 Studio 页面中使用

```tsx
// packages/tools/studio/src/pages/ObjectsPage.tsx
import React from 'react';
import { CustomTable } from '../components/CustomTable';

export function ObjectsPage() {
  const columns = [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type', renderer: 'badge' },
    { field: 'records', label: 'Records' },
  ];

  return (
    <div className="p-6">
      <CustomTable
        object="objects"
        columns={columns}
        sortable={true}
        filterable={true}
      />
    </div>
  );
}
```

## 方法四：通过元数据动态加载（高级）

ObjectQL 支持通过元数据动态加载组件。

### 步骤 1：注册组件

```typescript
// 在你的应用初始化代码中
import { ObjectQL } from '@objectql/core';
import { CustomTable } from './components/CustomTable';

const app = new ObjectQL({
  source: './src',
  components: {
    // 注册自定义组件
    custom_table: CustomTable,
    
    // 或者覆盖内置组件
    ObjectTable: CustomTable,
  }
});

await app.init();
```

### 步骤 2：在页面元数据中使用

```yaml
# dashboard.page.yml
name: dashboard
layout: single_column

components:
  - id: projects_table
    component: custom_table  # 使用你注册的组件
    props:
      object: projects
      columns:
        - field: name
          label: 项目名称
        - field: status
          label: 状态
          renderer: badge
```

### 步骤 3：渲染页面

```tsx
// 你的页面渲染器
import { useObjectQL } from '@objectql/react';

function DynamicPage({ pageName }: { pageName: string }) {
  const { renderPage } = useObjectQL();
  
  return renderPage(pageName);
}
```

## 完整示例：ObjectOS React 前端集成

假设你有一个 ObjectOS React 前端项目，完整的集成步骤：

### 1. 项目结构

```
your-objectos-frontend/
├── src/
│   ├── components/
│   │   └── CustomTable.tsx          # 复制的组件
│   ├── pages/
│   │   ├── ProjectsPage.tsx         # 使用组件的页面
│   │   └── TasksPage.tsx
│   ├── App.tsx
│   └── index.css                    # Tailwind CSS 入口
├── tailwind.config.js
└── package.json
```

### 2. 安装依赖

```bash
cd your-objectos-frontend
npm install react react-dom
npm install -D tailwindcss @types/react @types/react-dom
```

### 3. 复制组件

```bash
# 从 ObjectQL 仓库复制到你的项目
cp path/to/objectql/packages/starters/basic/src/components/CustomTable.tsx \
   src/components/
```

### 4. 创建页面组件

```tsx
// src/pages/ProjectsPage.tsx
import React from 'react';
import { CustomTable, ColumnDefinition } from '../components/CustomTable';

export function ProjectsPage() {
  const columns: ColumnDefinition[] = [
    { field: 'name', label: '项目名称', width: 300, sortable: true },
    { field: 'status', label: '状态', renderer: 'badge', sortable: true },
    { field: 'priority', label: '优先级', renderer: 'badge' },
    { field: 'owner', label: '负责人', width: 150 },
    { field: 'budget', label: '预算', renderer: 'currency', sortable: true },
    { field: 'created_at', label: '创建时间', renderer: 'date', sortable: true },
  ];

  const handleRowClick = (row: any, index: number) => {
    console.log('点击项目:', row);
    window.location.href = `/projects/${row.id}`;
  };

  const handleExport = (format: 'csv' | 'excel', data: any[]) => {
    console.log(`导出 ${data.length} 条记录为 ${format}`);
    // 你的导出逻辑
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
          <p className="mt-2 text-gray-600">查看和管理所有项目</p>
        </div>

        <CustomTable
          object="projects"
          columns={columns}
          sortable={true}
          filterable={true}
          selectable={true}
          exportable={true}
          pageSize={25}
          onRowClick={handleRowClick}
          onExport={handleExport}
          highlightRow={(row) => row.priority === 'high'}
        />
      </div>
    </div>
  );
}
```

### 5. 在路由中注册

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectsPage } from './pages/ProjectsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/projects" element={<ProjectsPage />} />
        {/* 其他路由 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 6. 运行项目

```bash
npm run dev
```

访问 `http://localhost:3000/projects` 即可看到组件运行效果。

## 常见问题

### Q: 我的项目已经在使用 Tailwind CSS 了吗？

检查是否有 `tailwind.config.js` 文件，以及 `package.json` 中是否有 `tailwindcss` 依赖。

### Q: 如果不想使用 Tailwind CSS 怎么办？

你需要重写组件的样式部分，将所有 Tailwind 类替换为你自己的 CSS 类或样式方案。

### Q: 如何连接到真实的 ObjectQL 数据源？

修改 `CustomTable.tsx` 中的 `loadData` 函数：

```tsx
// 替换 mock 数据
const loadData = async () => {
  setLoading(true);
  try {
    // 使用 ObjectQL 查询
    const result = await objectQL.query(object).find({
      filters,
      limit: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    setData(result);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};
```

### Q: 可以和其他 UI 库（如 Ant Design）一起使用吗？

可以，但需要注意样式冲突。建议使用 Tailwind 的 `prefix` 配置避免冲突：

```js
// tailwind.config.js
module.exports = {
  prefix: 'tw-',  // 所有 Tailwind 类都加上 tw- 前缀
  // ...
}
```

---

## English

### How to Use CustomTable Component in React Projects

This guide shows how to integrate the `CustomTable` component into any React project, including ObjectOS React frontends.

## Method 1: Direct File Copy (Simplest)

### Step 1: Copy Component Files

Copy the component files to your React project:

```bash
# From this repository
cp packages/starters/basic/src/components/CustomTable.tsx <your-project>/src/components/

# Optional: Copy example page too
cp packages/starters/basic/src/components/TableExamplePage.tsx <your-project>/src/pages/
```

### Step 2: Install Dependencies

Install required dependencies in your project:

```bash
# React and TypeScript (usually already installed)
npm install react react-dom
npm install -D @types/react @types/react-dom

# Tailwind CSS (if not installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Configure Tailwind CSS

Ensure your `tailwind.config.js` includes component paths:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Include your component directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Import Tailwind in your main CSS file (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: Use in Your Pages

```tsx
// In any React page or component
import React from 'react';
import { CustomTable, ColumnDefinition } from '../components/CustomTable';

function ProjectsPage() {
  const columns: ColumnDefinition[] = [
    { field: 'name', label: 'Project Name', width: 300 },
    { field: 'status', label: 'Status', renderer: 'badge' },
    { field: 'owner', label: 'Owner', width: 150 },
    { field: 'budget', label: 'Budget', renderer: 'currency' },
  ];

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
    // Navigate to detail page
    // navigate(`/projects/${row.id}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <CustomTable
        object="projects"
        columns={columns}
        sortable={true}
        filterable={true}
        exportable={true}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default ProjectsPage;
```

## Method 2: As npm Package

### Step 1: Publish as npm Package

To reuse across multiple projects, publish as npm package:

```bash
# Create package.json in components directory
cd packages/starters/basic/src/components
npm init -y
```

Modify `package.json`:

```json
{
  "name": "@your-org/objectql-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### Step 2: Install in Project

```bash
npm install @your-org/objectql-components
```

### Step 3: Use

```tsx
import { CustomTable } from '@your-org/objectql-components';

function MyPage() {
  return <CustomTable object="projects" columns={[...]} />;
}
```

## Method 3: Integrate into ObjectQL Studio

To add component to ObjectQL Studio:

### Step 1: Add to Studio Components

```bash
cp packages/starters/basic/src/components/CustomTable.tsx \
   packages/tools/studio/src/components/
```

### Step 2: Use in Studio Pages

```tsx
// packages/tools/studio/src/pages/ObjectsPage.tsx
import React from 'react';
import { CustomTable } from '../components/CustomTable';

export function ObjectsPage() {
  const columns = [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type', renderer: 'badge' },
  ];

  return (
    <div className="p-6">
      <CustomTable object="objects" columns={columns} />
    </div>
  );
}
```

## Method 4: Dynamic Loading via Metadata (Advanced)

ObjectQL supports dynamic component loading via metadata.

### Step 1: Register Component

```typescript
import { ObjectQL } from '@objectql/core';
import { CustomTable } from './components/CustomTable';

const app = new ObjectQL({
  components: {
    custom_table: CustomTable,
    ObjectTable: CustomTable,  // Override built-in
  }
});
```

### Step 2: Use in Page Metadata

```yaml
# dashboard.page.yml
components:
  - id: projects_table
    component: custom_table
    props:
      object: projects
```

## Complete Example: ObjectOS React Frontend Integration

Full integration steps for an ObjectOS React frontend:

### 1. Project Structure

```
your-objectos-frontend/
├── src/
│   ├── components/
│   │   └── CustomTable.tsx
│   ├── pages/
│   │   └── ProjectsPage.tsx
│   ├── App.tsx
│   └── index.css
├── tailwind.config.js
└── package.json
```

### 2. Install Dependencies

```bash
npm install react react-dom
npm install -D tailwindcss
```

### 3. Copy Component

```bash
cp path/to/objectql/packages/starters/basic/src/components/CustomTable.tsx \
   src/components/
```

### 4. Create Page

```tsx
// src/pages/ProjectsPage.tsx
import React from 'react';
import { CustomTable } from '../components/CustomTable';

export function ProjectsPage() {
  const columns = [
    { field: 'name', label: 'Project Name', width: 300 },
    { field: 'status', label: 'Status', renderer: 'badge' },
  ];

  return (
    <div className="p-8">
      <CustomTable object="projects" columns={columns} />
    </div>
  );
}
```

### 5. Add to Routes

```tsx
// src/App.tsx
import { ProjectsPage } from './pages/ProjectsPage';

function App() {
  return (
    <Routes>
      <Route path="/projects" element={<ProjectsPage />} />
    </Routes>
  );
}
```

## FAQ

**Q: How do I know if my project uses Tailwind?**  
Check for `tailwind.config.js` and `tailwindcss` in `package.json`.

**Q: What if I don't want to use Tailwind?**  
Rewrite the styles using your preferred CSS approach.

**Q: How to connect to real ObjectQL data?**  
Modify the `loadData` function in `CustomTable.tsx` to use ObjectQL queries.
