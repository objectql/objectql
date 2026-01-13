# ObjectQL Studio 集成快速指南

## 🚀 5 分钟集成 CustomTable 到 ObjectQL Studio

### 步骤 1：复制组件文件

```bash
cd /home/runner/work/objectql/objectql

# 复制 CustomTable 组件到 Studio
cp packages/starters/basic/src/components/CustomTable.tsx \
   packages/tools/studio/src/components/

# 可选：复制集成示例
cp packages/starters/basic/src/components/StudioIntegrationExample.tsx \
   packages/tools/studio/src/components/
```

### 步骤 2：在 Studio 中创建新页面

创建文件 `packages/tools/studio/src/pages/CustomObjectsPage.tsx`:

```tsx
import React from 'react';
import { CustomTable, ColumnDefinition } from '../components/CustomTable';

export function CustomObjectsPage() {
  const columns: ColumnDefinition[] = [
    { field: 'name', label: 'Object Name', width: 250, sortable: true },
    { field: 'label', label: 'Label', width: 200, sortable: true },
    { field: 'type', label: 'Type', renderer: 'badge', width: 120 },
    { field: 'records', label: 'Records', width: 100, sortable: true },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Objects with CustomTable</h1>
      <CustomTable
        object="objects"
        columns={columns}
        sortable={true}
        filterable={true}
        exportable={true}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
}
```

### 步骤 3：添加到路由

修改 `packages/tools/studio/src/App.tsx`:

```tsx
import { CustomObjectsPage } from './pages/CustomObjectsPage';

// 在你的路由配置中添加
<Route path="/custom-objects" element={<CustomObjectsPage />} />
```

### 步骤 4：添加到导航菜单

修改 `packages/tools/studio/src/components/Sidebar.tsx`:

```tsx
// 添加菜单项
<a href="/custom-objects" className="...">
  <TableIcon className="w-5 h-5" />
  <span>Custom Objects</span>
</a>
```

### 步骤 5：运行 Studio

```bash
cd packages/tools/studio
pnpm run dev
```

访问 `http://localhost:5173/custom-objects` 查看效果！

## 📝 完整示例

### 示例 1：对象浏览器

```tsx
// packages/tools/studio/src/pages/ObjectsBrowser.tsx
import React from 'react';
import { CustomTable } from '../components/CustomTable';

export function ObjectsBrowser() {
  const columns = [
    { field: 'name', label: 'Name', width: 250, sortable: true },
    { field: 'label', label: 'Label', width: 200 },
    { field: 'type', label: 'Type', renderer: 'badge' },
    { field: 'icon', label: 'Icon', width: 80 },
    { field: 'record_count', label: 'Records', width: 100, sortable: true },
    { field: 'created_at', label: 'Created', renderer: 'date', sortable: true },
  ];

  const handleRowClick = (row: any) => {
    // 导航到对象详情
    window.location.href = `/objects/${row.name}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Objects</h1>
        <p className="text-gray-600 mt-1">Manage your ObjectQL objects</p>
      </div>
      
      <div className="flex-1 p-6">
        <CustomTable
          object="objects"
          columns={columns}
          sortable={true}
          filterable={true}
          exportable={true}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
```

### 示例 2：记录管理页面

```tsx
// packages/tools/studio/src/pages/RecordsManager.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { CustomTable, ColumnDefinition } from '../components/CustomTable';

export function RecordsManager() {
  const { objectName } = useParams<{ objectName: string }>();

  // 根据对象类型动态配置列
  const columns: ColumnDefinition[] = [
    { field: 'id', label: 'ID', width: 100 },
    { field: 'name', label: 'Name', width: 250, sortable: true },
    { field: 'status', label: 'Status', renderer: 'badge', sortable: true },
    { field: 'created_at', label: 'Created', renderer: 'date', sortable: true },
    { field: 'updated_at', label: 'Updated', renderer: 'date', sortable: true },
  ];

  const handleRowClick = (row: any) => {
    console.log('View record:', row);
    // 打开记录详情模态框或导航到详情页
  };

  const handleSelect = (selectedRows: any[], selectedIds: string[]) => {
    console.log('Selected:', selectedIds);
    // 启用批量操作按钮
  };

  const handleExport = (format: 'csv' | 'excel', data: any[]) => {
    console.log(`Exporting ${data.length} records as ${format}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">{objectName}</h1>
          <p className="text-gray-600 mt-1">Manage {objectName} records</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New {objectName}
        </button>
      </div>

      <CustomTable
        object={objectName || 'unknown'}
        columns={columns}
        sortable={true}
        filterable={true}
        selectable={true}
        exportable={true}
        pageSize={25}
        onRowClick={handleRowClick}
        onSelect={handleSelect}
        onExport={handleExport}
        highlightRow={(row) => row.is_urgent === true}
      />
    </div>
  );
}
```

### 示例 3：带过滤的仪表板

```tsx
// packages/tools/studio/src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { CustomTable, FilterDefinition } from '../components/CustomTable';

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  const getFilters = (): FilterDefinition[] => {
    switch (activeFilter) {
      case 'active':
        return [{ field: 'status', operator: '=', value: 'active' }];
      case 'completed':
        return [{ field: 'status', operator: '=', value: 'completed' }];
      default:
        return [];
    }
  };

  const columns = [
    { field: 'name', label: 'Task', width: 300, sortable: true },
    { field: 'status', label: 'Status', renderer: 'badge', sortable: true },
    { field: 'priority', label: 'Priority', renderer: 'badge' },
    { field: 'assignee', label: 'Assignee', width: 150 },
    { field: 'due_date', label: 'Due Date', renderer: 'date', sortable: true },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

      {/* 过滤器标签 */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      <CustomTable
        object="tasks"
        columns={columns}
        filters={getFilters()}
        sortable={true}
        filterable={true}
        exportable={true}
        onRowClick={(row) => console.log('Task:', row)}
      />
    </div>
  );
}
```

## 🎯 关键要点

1. **零配置集成**：CustomTable 已经使用 Tailwind CSS，与 Studio 完美兼容
2. **类型安全**：完整的 TypeScript 支持
3. **即插即用**：直接复制文件即可使用
4. **可定制**：通过 props 轻松定制功能和样式

## 🔧 高级定制

### 自定义渲染器

```tsx
// 在 CustomTable.tsx 中添加新的渲染器
case 'link':
  return (
    <a href={value} className="text-blue-600 hover:underline" target="_blank">
      {value}
    </a>
  );

case 'image':
  return (
    <img src={value} alt="" className="h-8 w-8 rounded" />
  );
```

### 连接真实 ObjectQL 数据

修改 `loadData` 函数：

```tsx
const loadData = async () => {
  setLoading(true);
  try {
    // 使用 ObjectQL API
    const response = await fetch(`/api/query/${object}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters,
        limit: pageSize,
        skip: (currentPage - 1) * pageSize,
        sort: sortConfig ? [[sortConfig.column, sortConfig.direction]] : [],
      }),
    });
    
    const result = await response.json();
    setData(result.data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

## 📚 更多资源

- 完整 API 文档：`packages/starters/basic/src/components/README.md`
- 集成指南：`packages/starters/basic/src/components/INTEGRATION.md`
- 示例代码：`packages/starters/basic/src/components/StudioIntegrationExample.tsx`
