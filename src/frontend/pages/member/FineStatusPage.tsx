import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const FineStatusPage: React.FC = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.memberId) return;
    const fetchMemberFines = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await ApiClient.get('/fines');
      if (res.success && res.data) {
        setFines(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to fetch fine status.');
      }
      setIsLoading(false);
    };
    fetchMemberFines();
  }, [user]);

  const unpaidFines = fines.filter((f) => f.status === 'UNPAID');
  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  const columns: Column[] = [
    { key: 'fine_id', header: 'Fine Reference' },
    { key: 'book_title', header: 'Book Title' },
    { key: 'overdue_days', header: 'Overdue Days', render: (item) => `${item.overdue_days} Days` },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span style={{ fontWeight: 700, color: '#fbbf24' }}>{item.amount.toFixed(2)} THB</span>,
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (item) => <Badge status={item.status} />,
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      render: (item) => (item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '-'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Fine Status</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Overview of overdue fine obligations and payment history</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      {/* Unpaid Balance Banner */}
      {!isLoading && (
        <div>
          {totalUnpaidAmount > 0 ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f87171', fontSize: '1rem' }}>
                  YOU HAVE UNPAID FINES TOTALING {totalUnpaidAmount.toFixed(2)} THB
                </div>
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Unpaid fines block new book borrowings. Please contact the library counter to clear your outstanding fine balance.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle color="#10b981" size={22} />
              <div>
                <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem' }}>
                  NO PENDING UNPAID FINES
                </div>
                <div style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>Your account has zero outstanding fine balance.</div>
              </div>
            </div>
          )}
        </div>
      )}

      <Card title="Your Fine History Records">
        {isLoading ? (
          <LoadingSpinner message="Loading fine records..." />
        ) : (
          <Table columns={columns} data={fines} emptyMessage="No fine records found for your account." />
        )}
      </Card>
    </div>
  );
};
