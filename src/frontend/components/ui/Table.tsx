import React from 'react';
import { EmptyState } from './EmptyState';

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptyTitle?: string;
}

export function Table<T = any>({
  columns,
  data,
  emptyMessage = 'No matching records available.',
  emptyTitle = 'No Data Found',
}: TableProps<T>) {
  return (
    <div className="table-responsive-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151', color: '#9ca3af' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '1rem' }}>
                <EmptyState title={emptyTitle} description={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((item: any, idx) => (
              <tr
                key={item.id || idx}
                style={{
                  borderBottom: '1px solid #1f2937',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(31, 41, 55, 0.3)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', color: '#f9fafb' }}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

