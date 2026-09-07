import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const ReturnPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <Card title="Process Book Return" subtitle="Scan returned physical book copy to calculate overdue fines">
        <Alert
          type="info"
          message="Phase 4 Foundation Shell: Return workflow container. Overdue fine calculation (10 THB/day) will process in Phase 7."
        />
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }} onSubmit={(e) => e.preventDefault()}>
          <Input label="Book Copy ID or Borrowing Transaction ID" placeholder="Scan barcode or enter Copy ID (e.g. BC-1002-01)" />
          <Button variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Process Return & Calculate Fine
          </Button>
        </form>
      </Card>
    </div>
  );
};
