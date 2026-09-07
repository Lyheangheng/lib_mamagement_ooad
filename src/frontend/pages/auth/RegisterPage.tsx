import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const RegisterPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <Card title="Member Registration" subtitle="Register a new student account for library borrowing">
        <Alert
          type="info"
          message="Phase 4 UI Shell Placeholder. Live member registration API integration belongs to Phase 5."
        />
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }} onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name" placeholder="e.g. Somchai Jaidee" />
          <Input label="Student ID (Used as Username)" placeholder="e.g. 6712732101" />
          <Input label="Faculty" placeholder="e.g. Engineering" />
          <Input label="Major" placeholder="e.g. Computer Engineering" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Register Member Account
          </Button>
        </form>
      </Card>
    </div>
  );
};
