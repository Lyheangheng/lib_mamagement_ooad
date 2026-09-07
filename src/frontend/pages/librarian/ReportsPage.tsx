import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Download } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';

export const ReportsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Library Operations Reports</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Generate and export system activity reports</p>
      </div>

      <Alert
        type="info"
        message="Phase 4 Foundation Shell: Reports view layout. Live reporting API queries will be linked in Phase 9."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Card title="Current Borrowing Report" subtitle="All active loans and due dates">
          <Button variant="outline" icon={<FileText size={16} />} style={{ width: '100%', marginTop: '1rem' }}>
            Generate Report
          </Button>
        </Card>

        <Card title="Overdue Borrowings Report" subtitle="Loans past the 7-day borrowing limit">
          <Button variant="outline" icon={<FileText size={16} />} style={{ width: '100%', marginTop: '1rem' }}>
            Generate Report
          </Button>
        </Card>

        <Card title="Unpaid Fines Report" subtitle="Members with outstanding fine balances">
          <Button variant="outline" icon={<FileText size={16} />} style={{ width: '100%', marginTop: '1rem' }}>
            Generate Report
          </Button>
        </Card>

        <Card title="Transaction History Report" subtitle="Complete borrowing and return activity log">
          <Button variant="outline" icon={<Download size={16} />} style={{ width: '100%', marginTop: '1rem' }}>
            Export Transactions
          </Button>
        </Card>
      </div>
    </div>
  );
};
