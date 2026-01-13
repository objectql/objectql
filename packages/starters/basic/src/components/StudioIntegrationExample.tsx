/**
 * Example: How to use CustomTable in ObjectQL Studio
 * 
 * This file demonstrates integrating the CustomTable component
 * into the ObjectQL Studio React application.
 */

import React, { useState, useEffect } from 'react';
import { CustomTable, ColumnDefinition } from './CustomTable';

/**
 * Example Page: Objects Browser
 * 
 * This shows how to create a page in ObjectQL Studio that uses CustomTable
 * to display and manage ObjectQL objects (like tables/collections).
 */
export function ObjectsBrowserPage() {
  const columns: ColumnDefinition[] = [
    {
      field: 'name',
      label: 'Object Name',
      width: 250,
      sortable: true,
    },
    {
      field: 'label',
      label: 'Display Label',
      width: 200,
      sortable: true,
    },
    {
      field: 'type',
      label: 'Type',
      width: 120,
      renderer: 'badge',
      sortable: true,
    },
    {
      field: 'record_count',
      label: 'Records',
      width: 100,
      sortable: true,
    },
    {
      field: 'created_at',
      label: 'Created',
      width: 150,
      renderer: 'date',
      sortable: true,
    },
  ];

  const handleRowClick = (row: any) => {
    // Navigate to object detail page
    window.location.href = `/studio/objects/${row.name}`;
  };

  const handleExport = (format: 'csv' | 'excel', data: any[]) => {
    console.log(`Exporting ${data.length} objects as ${format}`);
    // Implement export logic
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Objects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and manage your ObjectQL objects
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + New Object
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 p-6 bg-gray-50">
        <CustomTable
          object="objects"
          columns={columns}
          sortable={true}
          filterable={true}
          selectable={false}
          exportable={true}
          pageSize={25}
          onRowClick={handleRowClick}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}

/**
 * Example Page: Records Browser
 * 
 * Shows how to display records from a specific ObjectQL object
 */
export function RecordsBrowserPage({ objectName }: { objectName: string }) {
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);

  // Load column definitions from object metadata
  useEffect(() => {
    // TODO: Fetch object metadata from ObjectQL API
    // const metadata = await fetch(`/api/metadata/objects/${objectName}`);
    // const fields = metadata.fields;
    
    // For now, use example columns
    setColumns([
      { field: 'name', label: 'Name', width: 250, sortable: true },
      { field: 'status', label: 'Status', renderer: 'badge', sortable: true },
      { field: 'created_at', label: 'Created', renderer: 'date', sortable: true },
    ]);
  }, [objectName]);

  const handleRowClick = (row: any) => {
    // Open record detail modal or navigate to detail page
    console.log('View record:', row);
  };

  const handleSelect = (selectedRows: any[], selectedIds: string[]) => {
    console.log('Selected records:', selectedIds);
    // Enable bulk actions
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {objectName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage {objectName} records
        </p>
      </div>

      <CustomTable
        object={objectName}
        columns={columns}
        sortable={true}
        filterable={true}
        selectable={true}
        exportable={true}
        pageSize={25}
        onRowClick={handleRowClick}
        onSelect={handleSelect}
        highlightRow={(row) => row.is_important === true}
      />
    </div>
  );
}

/**
 * Integration with React Router
 */
export function StudioRoutes() {
  return (
    <>
      {/* Add to your React Router configuration */}
      {/* 
      <Route path="/studio/objects" element={<ObjectsBrowserPage />} />
      <Route path="/studio/objects/:objectName" element={
        <RecordsBrowserPage objectName={useParams().objectName} />
      } />
      */}
    </>
  );
}

/**
 * Example: Custom Hook for ObjectQL Data
 * 
 * This shows how to create a custom hook to fetch data from ObjectQL
 * and use it with CustomTable
 */
export function useObjectQLData(objectName: string, filters?: any[]) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Call ObjectQL API
        const response = await fetch(`/api/query/${objectName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters }),
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [objectName, filters]);

  return { data, loading, error };
}

/**
 * Example: Using CustomTable with ObjectQL Hook
 */
export function ProjectsPageWithHook() {
  const { data, loading, error } = useObjectQLData('projects', [
    { field: 'status', operator: '!=', value: 'archived' }
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const columns: ColumnDefinition[] = [
    { field: 'name', label: 'Project Name', sortable: true },
    { field: 'status', label: 'Status', renderer: 'badge' },
  ];

  return (
    <div className="p-6">
      <CustomTable
        object="projects"
        columns={columns}
        sortable={true}
        filterable={true}
      />
    </div>
  );
}

export default ObjectsBrowserPage;
