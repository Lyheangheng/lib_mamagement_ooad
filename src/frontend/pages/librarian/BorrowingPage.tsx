import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const BorrowingPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <Card title="Process Book Borrowing" subtitle="Issue a physical book copy to a library member">
        <Alert
          type="info"
          message="Phase 4 Foundation Shell: Borrowing workflow container. Rules validation (max 3 books, 7-day limit, unpaid fine block) will be processed in Phase 7."
        />
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }} onSubmit={(e) => e.preventDefault()}>
          <Input label="Member Student ID" placeholder="Scan or enter student ID (e.g. 6712732101)" />
          <Input label="Book Copy ID" placeholder="Scan barcode or enter Copy ID (e.g. BC-1001-01)" />
          <Button variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Confirm Borrowing Transaction (7-Day Loan)
          </Button>
        </form>
      </Card>
    </div>
  );
};
