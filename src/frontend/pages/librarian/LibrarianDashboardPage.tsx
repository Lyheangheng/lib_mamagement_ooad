import React from 'react';
import { Card } from '../../components/ui/Card';
import { Book, Users, ArrowRightLeft, CreditCard } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';

export const LibrarianDashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Librarian Admin Dashboard</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Library Operations & System Overview</p>
      </div>

      <Alert
        type="info"
        message="Phase 4 Foundation Shell: Librarian Dashboard overview. Real-time REST endpoints will be bound in Phases 6-9."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card title="Total Books" action={<Book color="#6366f1" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f9fafb' }}>4</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>8 physical copies total</p>
        </Card>

        <Card title="Active Members" action={<Users color="#34d399" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>2</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>100% active accounts</p>
        </Card>

        <Card title="Active Loans" action={<ArrowRightLeft color="#60a5fa" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa' }}>3</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>1 loan currently overdue</p>
        </Card>

        <Card title="Unpaid Fines" action={<CreditCard color="#fbbf24" size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>40.00 THB</div>
          <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>1 pending payment</p>
        </Card>
      </div>
    </div>
  );
};
