import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const LoginPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <Card title="Account Login" subtitle="Enter your credentials to access the Library Management System">
        <Alert
          type="info"
          message="Phase 4 UI Shell Placeholder. Live login authentication will be enabled in Phase 5."
        />
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }} onSubmit={(e) => e.preventDefault()}>
          <Input label="Student ID / Username" placeholder="e.g. 6712732101 or librarian_anan" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};
