import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    faculty: '',
    major: '',
  });

  const fetchProfile = async () => {
    if (!user?.memberId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.get(`/members/${user.memberId}`);
    if (res.success && res.data) {
      setMemberData(res.data);
      setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        faculty: res.data.faculty || '',
        major: res.data.major || '',
      });
    } else {
      setErrorMsg(res.error || 'Failed to fetch member profile.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await ApiClient.put(`/members/${user.memberId}`, form);
    setIsSaving(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully.');
      fetchProfile();
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading member profile..." />;
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <Card title="Member Self-Service Profile" subtitle="Manage your student contact information and view academic status">
        {errorMsg && <Alert type="error" message={errorMsg} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }} onSubmit={handleSubmit}>
          <Input label="Student ID (Account Username)" value={memberData?.student_id || user?.username || ''} disabled />
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 089-123-4567" />
          <Input label="Faculty" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} required />
          <Input label="Major" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} required />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>Membership Status:</span>
            <Badge status={memberData?.status || 'ACTIVE'} />
          </div>

          <Button variant="primary" type="submit" isLoading={isSaving} style={{ marginTop: '1rem', width: 'fit-content' }}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
