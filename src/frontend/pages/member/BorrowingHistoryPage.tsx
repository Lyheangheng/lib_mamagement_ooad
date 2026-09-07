import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const BorrowingHistoryPage: React.FC = () => {
  const sampleBorrowings = [
    {
      id: 1,
      borrowing_id: 'BRW-2026-001',
      title: 'Clean Architecture',
      copy_id: 'BC-1001-01',
      borrow_date: '2026-08-18',
      due_date: '2026-08-25',
      return_date: '2026-08-23',
      status: 'RETURNED',
    },
    {
      id: 2,
      borrowing_id: 'BRW-2026-002',
      title: 'Introduction to Algorithms',
      copy_id: 'BC-1002-01',
      borrow_date: '2026-09-05',
      due_date: '2026-09-12',
      return_date: null,
      status: 'ACTIVE',
    },
  ];

  const columns: Column[] = [
    { key: 'borrowing_id', header: 'Transaction ID' },
    { key: 'title', header: 'Book Title' },
    { key: 'copy_id', header: 'Copy ID' },
    { key: 'borrow_date', header: 'Borrow Date' },
    { key: 'due_date', header: 'Due Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge status={item.status} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Borrowing History</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Track all your current and past book loans</p>
      </div>

      <Card>
        <Table columns={columns} data={sampleBorrowings} />
      </Card>
    </div>
  );
};
