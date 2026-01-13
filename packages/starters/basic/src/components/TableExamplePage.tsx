/**
 * Example Page Component
 * 
 * Demonstrates how to use the CustomTable component with React and Tailwind CSS
 */

import React from 'react';
import { CustomTable, ColumnDefinition } from './CustomTable';

export const TableExamplePage: React.FC = () => {
  // Define columns for the table
  const columns: ColumnDefinition[] = [
    {
      field: 'name',
      label: 'Project Name',
      width: 300,
      sortable: true,
    },
    {
      field: 'status',
      label: 'Status',
      width: 120,
      renderer: 'badge',
      sortable: true,
    },
    {
      field: 'priority',
      label: 'Priority',
      width: 100,
      renderer: 'badge',
      sortable: true,
    },
    {
      field: 'owner',
      label: 'Owner',
      width: 150,
      sortable: true,
    },
    {
      field: 'budget',
      label: 'Budget',
      width: 120,
      renderer: 'currency',
      sortable: true,
    },
    {
      field: 'created_at',
      label: 'Created',
      width: 120,
      renderer: 'date',
      sortable: true,
    },
  ];

  // Event handlers
  const handleRowClick = (row: any, index: number) => {
    console.log('Row clicked:', row);
    // Navigate to detail page or open modal
    // navigate(`/projects/${row.id}`);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    console.log('Sorted by:', column, direction);
  };

  const handleSelect = (selectedRows: any[], selectedIds: string[]) => {
    console.log('Selected rows:', selectedRows);
    console.log('Selected IDs:', selectedIds);
  };

  const handleExport = (format: 'csv' | 'excel', data: any[]) => {
    console.log(`Exporting ${data.length} rows as ${format}`);
  };

  // Highlight high-priority items
  const highlightRow = (row: any) => {
    return row.priority === 'high' && row.status === 'active';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            CustomTable Component Example
          </h1>
          <p className="mt-2 text-gray-600">
            A fully-featured data table built with React and Tailwind CSS
          </p>
        </div>

        {/* Table Component */}
        <CustomTable
          object="projects"
          columns={columns}
          sortable={true}
          filterable={true}
          selectable={true}
          exportable={true}
          pageSize={10}
          highlightRow={highlightRow}
          onRowClick={handleRowClick}
          onSort={handleSort}
          onSelect={handleSelect}
          onExport={handleExport}
        />

        {/* Feature Documentation */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔍 Search & Filter
              </h3>
              <p className="text-gray-600">
                Full-text search across all columns with instant filtering
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ↕️ Sorting
              </h3>
              <p className="text-gray-600">
                Click column headers to sort ascending or descending
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Row Selection
              </h3>
              <p className="text-gray-600">
                Select individual rows or all rows for bulk operations
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Export
              </h3>
              <p className="text-gray-600">
                Export filtered data to CSV or Excel formats
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📄 Pagination
              </h3>
              <p className="text-gray-600">
                Navigate through large datasets with smart pagination
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎨 Custom Renderers
              </h3>
              <p className="text-gray-600">
                Badge, date, currency, and text renderers with Tailwind styling
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚡ Performance
              </h3>
              <p className="text-gray-600">
                Optimized with React hooks (useMemo, useCallback) for large datasets
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📱 Responsive
              </h3>
              <p className="text-gray-600">
                Fully responsive design that works on all screen sizes
              </p>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Example</h2>
          
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`import { CustomTable, ColumnDefinition } from './CustomTable';

const columns: ColumnDefinition[] = [
  { field: 'name', label: 'Name', width: 300 },
  { field: 'status', label: 'Status', renderer: 'badge' },
  { field: 'budget', label: 'Budget', renderer: 'currency' }
];

function MyPage() {
  return (
    <CustomTable
      object="projects"
      columns={columns}
      sortable={true}
      filterable={true}
      selectable={true}
      exportable={true}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
}`}</code>
          </pre>
        </div>

        {/* Tailwind CSS Classes Used */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tailwind CSS Styling
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Layout & Spacing</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">px-6 py-4</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">space-x-4</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">divide-y</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">min-w-full</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Colors & Backgrounds</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">bg-white</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">bg-gray-50</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">hover:bg-gray-100</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">border-gray-200</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Typography</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">text-sm</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">font-medium</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">uppercase</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">tracking-wider</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Interactive States</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">hover:bg-gray-50</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">focus:ring-2</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">disabled:opacity-50</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">cursor-pointer</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Animations</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">animate-spin</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">transition-colors</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">duration-150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExamplePage;
