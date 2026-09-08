import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export const BorrowingHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.memberId) return;
    const fetchHistory = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await ApiClient.get(`/borrowings/member/${user.memberId}`);
      if (res.success && res.data) {
        setBorrowings(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to fetch borrowing history.');
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [user]);

  const columns: Column[] = [
    { key: 'borrowing_id', header: 'Transaction ID' },
    { key: 'book_title', header: 'Book Title' },
    { key: 'copy_id', header: 'Copy ID' },
    {
      key: 'borrow_date',
      header: 'Borrow Date',
      render: (b) => new Date(b.borrow_date).toLocaleDateString(),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (b) => new Date(b.due_date).toLocaleDateString(),
    },
    {
      key: 'return_date',
      header: 'Return Date',
      render: (b) => (b.return_date ? new Date(b.return_date).toLocaleDateString() : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <Badge status={b.status} />,
    },
    {
      key: 'fine',
      header: 'Fine Status',
      render: (b) => {
        if (!b.fine_id) return <span style={{ color: '#9ca3af' }}>None</span>;
        return (
          <Badge
            status={b.fine_status === 'PAID' ? 'PAID' : 'UNPAID'}
            label={`${b.fine_amount} THB (${b.fine_status})`}
          />
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Borrowing History</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Track all your active book loans and historical transactions</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Fetching your borrowing history..." />
        ) : (
          <Table columns={columns} data={borrowings} emptyMessage="No borrowing records found." />
        )}
      </Card>
    </div>
  );
};
