/**
 * CustomTable Component
 * 
 * A React component that displays ObjectQL data in a table format
 * with Tailwind CSS styling
 * 
 * @example
 * ```tsx
 * <CustomTable
 *   object="projects"
 *   columns={[
 *     { field: 'name', label: 'Project Name' },
 *     { field: 'status', label: 'Status' }
 *   ]}
 *   onRowClick={(row) => console.log('Clicked:', row)}
 * />
 * ```
 */

import React, { useState, useEffect, useMemo } from 'react';

// Type definitions
export interface ColumnDefinition {
  field: string;
  label?: string;
  width?: number;
  sortable?: boolean;
  renderer?: 'text' | 'badge' | 'date' | 'currency';
  format?: string;
}

export interface FilterDefinition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: any;
}

export interface CustomTableProps {
  /** Name of the ObjectQL object to display */
  object: string;
  
  /** Column definitions */
  columns?: ColumnDefinition[];
  
  /** Default filters to apply */
  filters?: FilterDefinition[];
  
  /** Enable column sorting */
  sortable?: boolean;
  
  /** Enable filtering UI */
  filterable?: boolean;
  
  /** Number of records per page */
  pageSize?: number;
  
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  
  /** Show export to CSV/Excel button */
  exportable?: boolean;
  
  /** Function to determine if a row should be highlighted */
  highlightRow?: (row: any) => boolean;
  
  /** Event handlers */
  onRowClick?: (row: any, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: FilterDefinition[]) => void;
  onSelect?: (selectedRows: any[], selectedIds: string[]) => void;
  onExport?: (format: 'csv' | 'excel', data: any[]) => void;
}

/**
 * CustomTable Component with Tailwind CSS
 */
export const CustomTable: React.FC<CustomTableProps> = ({
  object,
  columns = [],
  filters = [],
  sortable = true,
  filterable = true,
  pageSize = 25,
  selectable = false,
  exportable = true,
  highlightRow,
  onRowClick,
  onSort,
  onFilter,
  onSelect,
  onExport,
}) => {
  // State management
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load data (mock implementation - replace with actual ObjectQL query)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual ObjectQL query
        // const result = await objectQL.query(object).find({ filters });
        
        // Mock data for demonstration
        const mockData = Array.from({ length: 50 }, (_, i) => ({
          id: `${i + 1}`,
          name: `Item ${i + 1}`,
          status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'completed',
          priority: i % 2 === 0 ? 'high' : 'low',
          owner: `User ${(i % 5) + 1}`,
          budget: (i + 1) * 1000,
          created_at: new Date(2024, 0, i + 1).toISOString(),
        }));
        
        setData(mockData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [object, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Apply search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handlers
  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection =
      sortConfig?.column === column && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortConfig({ column, direction: newDirection });
    onSort?.(column, newDirection);
  };

  const handleRowClick = (row: any, index: number) => {
    onRowClick?.(row, index);
  };

  const handleSelectRow = (rowId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);

    const selected = data.filter((row) => newSelection.has(row.id));
    onSelect?.(selected, Array.from(newSelection));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelect?.([], []);
    } else {
      const allIds = new Set(paginatedData.map((row) => row.id));
      setSelectedRows(allIds);
      const selected = data.filter((row) => allIds.has(row.id));
      onSelect?.(selected, Array.from(allIds));
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    onExport?.(format, filteredData);
    
    // Simple CSV export implementation
    if (format === 'csv') {
      const headers = columns.map((col) => col.label || col.field).join(',');
      const rows = filteredData.map((row) =>
        columns.map((col) => row[col.field]).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${object}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Render cell value based on renderer type
  const renderCell = (row: any, column: ColumnDefinition) => {
    const value = row[column.field];

    switch (column.renderer) {
      case 'badge':
        const badgeColors: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-blue-100 text-blue-800',
          high: 'bg-red-100 text-red-800',
          low: 'bg-gray-100 text-gray-800',
        };
        const colorClass = badgeColors[value] || 'bg-gray-100 text-gray-800';
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}
          >
            {value}
          </span>
        );

      case 'date':
        return new Date(value).toLocaleDateString();

      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);

      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {object.charAt(0).toUpperCase() + object.slice(1)}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredData.length} records
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            {filterable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}

            {/* Export buttons */}
            {exportable && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.field)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label || column.field}</span>
                    {sortable && column.sortable !== false && (
                      <svg
                        className={`h-4 w-4 ${
                          sortConfig?.column === column.field
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {sortConfig?.column === column.field &&
                        sortConfig.direction === 'asc' ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => {
              const isHighlighted = highlightRow?.(row);
              const isSelected = selectedRows.has(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row, index)}
                  className={`
                    ${isSelected ? 'bg-blue-50' : ''}
                    ${isHighlighted ? 'bg-yellow-50' : ''}
                    ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    transition-colors duration-150
                  `}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(row.id);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.field}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new record'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{' '}
              of <span className="font-medium">{filteredData.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
