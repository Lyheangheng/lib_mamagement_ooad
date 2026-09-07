import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const FineStatusPage: React.FC = () => {
  const sampleFines = [
    {
      id: 1,
      fine_id: 'FINE-2026-002',
      book_title: 'Database System Concepts',
      overdue_days: 3,
      amount: 30.0,
      status: 'PAID',
    },
  ];

  const columns: Column[] = [
    { key: 'fine_id', header: 'Fine Reference' },
    { key: 'book_title', header: 'Book Title' },
    { key: 'overdue_days', header: 'Overdue Days' },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span style={{ fontWeight: 600, color: '#fbbf24' }}>{item.amount.toFixed(2)} THB</span>,
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (item) => <Badge status={item.status} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Fine Status</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Overview of overdue fines and payment records</p>
      </div>

      <Card title="Your Fine Records">
        <Table columns={columns} data={sampleFines} />
      </Card>
    </div>
  );
};
