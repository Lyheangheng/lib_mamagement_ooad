import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CheckCircle, AlertTriangle, User, Compass, ArrowRight } from 'lucide-react';

export interface MemberDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.memberId) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      const [sumRes, borRes] = await Promise.all([
        ApiClient.get(`/members/${user.memberId}/summary`),
        ApiClient.get(`/borrowings/member/${user.memberId}`),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      } else {
        setErrorMsg(sumRes.error || 'Failed to load member portal summary.');
      }

      if (borRes.success && borRes.data) {
        // Filter only active borrowings for current loans widget
        const activeLoans = borRes.data.filter((b: any) => b.status === 'ACTIVE' || b.status === 'OVERDUE');
        setBorrowings(activeLoans);
      }

      setIsLoading(false);
    };
    fetchDashboardData();
  }, [user]);

  const activeCount = summary?.activeCount ?? 0;
  const remainingCapacity = Math.max(0, 3 - activeCount);

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
      key: 'status',
      header: 'Loan Status',
      render: (b) => <Badge status={b.status} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>
          Welcome, {user?.name || 'Member'}!
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Personal Library Account Portal & Active Book Loans</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      {isLoading ? (
        <LoadingSpinner message="Loading your personal library portal..." />
      ) : (
        summary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Account Identity Header Card */}
            <div style={{ background: '#111827', padding: '1rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={24} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight: 700, color: '#f9fafb', fontSize: '1.05rem' }}>{summary.member.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                    Student ID: {summary.member.student_id} | Faculty: {summary.member.faculty} ({summary.member.major})
                  </div>
                </div>
              </div>
              <Badge status={summary.member.status} label={`Account ${summary.member.status}`} />
            </div>

            {/* Quick Library Catalog Action Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(17, 24, 39, 0.9) 100%)',
                border: '1px solid #6366f1',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Compass color="#ffffff" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>Explore Library Book Catalog</h3>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    Browse available titles, read synopses, and borrow books directly online.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                icon={<ArrowRight size={18} />}
                onClick={() => onNavigate && onNavigate('/member/catalog')}
              >
                Browse Library Catalog
              </Button>
            </div>

            {/* KPI Summary Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <Card title="Active Borrowings" action={<BookOpen color="#6366f1" size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: activeCount >= 3 ? '#ef4444' : '#6366f1' }}>
                  {activeCount} / {summary.maxLimit} Books
                </div>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  Remaining Capacity: <strong>{remainingCapacity} Book(s)</strong>
                </p>
              </Card>

              <Card title="Account Eligibility Status" action={<CheckCircle color={summary.isBlocked ? '#ef4444' : '#34d399'} size={24} />}>
                <div style={{ marginTop: '0.25rem' }}>
                  {summary.isBlocked ? (
                    <Badge status="SUSPENDED" label="Borrowing Blocked" />
                  ) : (
                    <Badge status="ACTIVE" label="Eligible to Borrow" />
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: summary.isBlocked ? '#ef4444' : '#34d399', marginTop: '0.5rem', fontWeight: 500 }}>
                  {summary.isBlocked ? summary.reasons[0] : 'All library requirements satisfied'}
                </p>
              </Card>

              <Card title="Pending Unpaid Fines" action={<AlertTriangle color={summary.unpaidFineAmount > 0 ? '#ef4444' : '#fbbf24'} size={24} />}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: summary.unpaidFineAmount > 0 ? '#ef4444' : '#10b981' }}>
                  {summary.unpaidFineAmount.toFixed(2)} THB
                </div>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {summary.unpaidFineAmount > 0 ? 'Outstanding fine balance' : 'No blocking fines recorded'}
                </p>
              </Card>
            </div>

            {/* Currently Borrowed Books Table */}
            <Card title="Your Currently Borrowed Books">
              <Table columns={columns} data={borrowings} emptyMessage="You have no active borrowed books at this time. Click 'Browse Library Catalog' above to borrow your first book!" />
            </Card>
          </div>
        )
      )}
    </div>
  );
};

