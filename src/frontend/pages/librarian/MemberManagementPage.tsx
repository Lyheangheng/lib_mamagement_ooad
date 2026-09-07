import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const MemberManagementPage: React.FC = () => {
  const sampleMembers = [
    { id: 1, studentId: '6712732101', name: 'Somchai Jaidee', faculty: 'Engineering', major: 'Computer Engineering', status: 'ACTIVE' },
    { id: 2, studentId: '6712732102', name: 'Somsri Sookjai', faculty: 'Science', major: 'Information Technology', status: 'ACTIVE' },
  ];

  const columns: Column[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'name', header: 'Name' },
    { key: 'faculty', header: 'Faculty' },
    { key: 'major', header: 'Major' },
    { key: 'status', header: 'Status', render: (m) => <Badge status={m.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: () => <Button size="sm" variant="outline">Edit Status</Button>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Member Management</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>View student accounts, edit status, and review histories</p>
      </div>

      <Card>
        <Table columns={columns} data={sampleMembers} />
      </Card>
    </div>
  );
};
