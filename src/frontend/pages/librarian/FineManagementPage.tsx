import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const FineManagementPage: React.FC = () => {
  const sampleFines = [
    { id: 1, fineId: 'FINE-2026-001', studentId: '6712732102', name: 'Somsri Sookjai', days: 4, amount: 40.0, status: 'UNPAID' },
    { id: 2, fineId: 'FINE-2026-002', studentId: '6712732102', name: 'Somsri Sookjai', days: 3, amount: 30.0, status: 'PAID' },
  ];

  const columns: Column[] = [
    { key: 'fineId', header: 'Fine ID' },
    { key: 'studentId', header: 'Student ID' },
    { key: 'name', header: 'Member Name' },
    { key: 'days', header: 'Overdue Days' },
    { key: 'amount', header: 'Amount', render: (f) => <span style={{ fontWeight: 600, color: '#fbbf24' }}>{f.amount.toFixed(2)} THB</span> },
    { key: 'status', header: 'Status', render: (f) => <Badge status={f.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (f) => (
        f.status === 'UNPAID' ? <Button size="sm" variant="primary">Record Payment</Button> : <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Paid</span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Fine Management & Payment</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Record overdue fine payments and review transaction logs</p>
      </div>

      <Card>
        <Table columns={columns} data={sampleFines} />
      </Card>
    </div>
  );
};
