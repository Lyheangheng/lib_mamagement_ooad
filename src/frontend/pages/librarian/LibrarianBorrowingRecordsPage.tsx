import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Search } from 'lucide-react';

export const LibrarianBorrowingRecordsPage: React.FC = () => {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBorrowings = async (search = '', status = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    let query = '/borrowings?';
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (status) query += `status=${encodeURIComponent(status)}&`;
    const res = await ApiClient.get(query);
    if (res.success && res.data) {
      setBorrowings(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch borrowing records.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBorrowings(searchTerm, statusFilter);
  };

  const columns: Column[] = [
    { key: 'borrowing_id', header: 'Transaction ID' },
    {
      key: 'member',
      header: 'Member',
      render: (b) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{b.member_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{b.student_id}</div>
        </div>
      ),
    },
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
      header: 'Fine',
      render: (b) => {
        if (!b.fine_id) return <span style={{ color: '#9ca3af' }}>-</span>;
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Global Borrowing Records</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Inspect active and historical library borrowing transactions</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      <Card>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search Student ID, Member Name, Copy ID, Book Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'RETURNED', label: 'RETURNED' },
                { value: 'OVERDUE', label: 'OVERDUE' },
              ]}
            />
          </div>
          <Button type="submit" variant="secondary" icon={<Search size={16} />}>
            Filter
          </Button>
        </form>

        {isLoading ? (
          <LoadingSpinner message="Fetching transaction logs..." />
        ) : (
          <Table columns={columns} data={borrowings} emptyMessage="No borrowing transactions found." />
        )}
      </Card>
    </div>
  );
};
