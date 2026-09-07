import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <Card title="Member Profile" subtitle="View and manage your personal student details">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
          <Input label="Student ID" value="6712732101" disabled />
          <Input label="Full Name" value="Somchai Jaidee" />
          <Input label="Email" value="somchai.j@student.edu" />
          <Input label="Phone Number" value="089-876-5432" />
          <Input label="Faculty" value="Engineering" />
          <Input label="Major" value="Computer Engineering" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>Membership Status:</span>
            <Badge status="ACTIVE" />
          </div>
          <Button variant="primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
