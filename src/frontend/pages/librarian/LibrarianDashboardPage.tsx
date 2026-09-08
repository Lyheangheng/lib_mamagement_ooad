import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Book, Users, ArrowRightLeft, CreditCard, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const LibrarianDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.get('/reports/stats');
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to load dashboard statistics.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Librarian Admin Dashboard</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Real-time library operations & database analytics summary</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={fetchStats}>
          Refresh Metrics
        </Button>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      {isLoading ? (
        <LoadingSpinner message="Calculating database analytics..." />
      ) : (
        stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top KPI Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <Card title="Book Catalog" action={<Book color="#6366f1" size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f9fafb' }}>{stats.totalBooks}</div>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {stats.totalBookCopies} Total Physical Copies
                </p>
              </Card>

              <Card title="Member Directory" action={<Users color="#34d399" size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{stats.activeMembers}</div>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {stats.suspendedMembers} Suspended ({stats.totalMembers} Total Members)
                </p>
              </Card>

              <Card title="Active Book Loans" action={<ArrowRightLeft color="#60a5fa" size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>{stats.activeBorrowings}</div>
                <p style={{ fontSize: '0.825rem', color: stats.overdueBorrowings > 0 ? '#ef4444' : '#9ca3af', marginTop: '0.25rem', fontWeight: stats.overdueBorrowings > 0 ? 600 : 400 }}>
                  {stats.overdueBorrowings} Overdue Loans
                </p>
              </Card>

              <Card title="Unpaid Fine Balance" action={<CreditCard color="#fbbf24" size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                  {stats.totalUnpaidFineAmount.toFixed(2)} THB
                </div>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {stats.unpaidFinesCount} Pending Fine Records
                </p>
              </Card>
            </div>

            {/* Inventory Breakdown Details Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <Card title="Physical Copy Inventory Distribution">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle color="#10b981" size={16} />
                      <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Available Copies</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{stats.availableCopies} Copies</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ArrowRightLeft color="#60a5fa" size={16} />
                      <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Borrowed Copies</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#60a5fa' }}>{stats.borrowedCopies} Copies</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle color="#ef4444" size={16} />
                      <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Lost / Damaged Copies</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{stats.lostCopies} Copies</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'right', marginTop: '0.25rem' }}>
                    Mathematical Verification: {stats.availableCopies} + {stats.borrowedCopies} + {stats.lostCopies} = {stats.totalBookCopies} Total Physical Copies
                  </div>
                </div>
              </Card>

              <Card title="System Operational Readiness">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Member Accounts Status</span>
                    <span style={{ fontWeight: 600, color: '#34d399' }}>{stats.activeMembers} / {stats.totalMembers} Active</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Overdue Loans Health</span>
                    <span style={{ fontWeight: 600, color: stats.overdueBorrowings > 0 ? '#ef4444' : '#10b981' }}>
                      {stats.overdueBorrowings} Overdue
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#111827', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Unpaid Fines Health</span>
                    <span style={{ fontWeight: 600, color: stats.unpaidFinesCount > 0 ? '#ef4444' : '#10b981' }}>
                      {stats.totalUnpaidFineAmount.toFixed(2)} THB ({stats.unpaidFinesCount} Records)
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
};
