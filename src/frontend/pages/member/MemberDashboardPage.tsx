import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

export const MemberDashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Member Dashboard</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Welcome to your personal library portal</p>
      </div>

      <Alert
        type="info"
        message="Phase 4 Foundation Shell: Member Dashboard layout view. Live statistical data widgets will connect in Phase 8."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Card title="Active Borrowings" action={<BookOpen color="#6366f1" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f9fafb' }}>1 / 3</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>Maximum limit: 3 active books</p>
        </Card>

        <Card title="Account Status" action={<CheckCircle color="#34d399" size={24} />}>
          <div style={{ marginTop: '0.5rem' }}>
            <Badge status="ACTIVE" label="Account Active" />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.5rem' }}>Eligible to borrow books</p>
        </Card>

        <Card title="Unpaid Fines" action={<AlertTriangle color="#fbbf24" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>0.00 THB</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.25rem' }}>No blocking fines recorded</p>
        </Card>
      </div>
    </div>
  );
};
