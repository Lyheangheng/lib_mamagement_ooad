import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export interface RegisterPageProps {
  onNavigate?: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    faculty: '',
    major: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!formData.name || !formData.studentId || !formData.faculty || !formData.major || !formData.password) {
      setErrorMsg('All fields (Name, Student ID, Faculty, Major, Password) are required.');
      return;
    }

    if (formData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await ApiClient.post('/auth/register', formData);

      if (res.success) {
        setSuccessMsg('Registration successful! Redirecting to Member Dashboard...');
        if (res.token && res.user) {
          login(res.token, {
            accountId: res.user.accountId,
            userId: res.user.userId,
            memberId: res.user.memberId,
            username: res.user.studentId,
            name: res.user.name,
            role: 'MEMBER',
          });
        }
        setTimeout(() => {
          if (onNavigate) onNavigate('/member/dashboard');
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check input values.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <Card title="Member Registration" subtitle="Register a new student account for library borrowing">
        {errorMsg && <Alert type="error" message={errorMsg} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }} onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Somchai Jaidee"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Student ID (Used as Username)"
            name="studentId"
            placeholder="e.g. 6712732101"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
          <Input
            label="Faculty"
            name="faculty"
            placeholder="e.g. Engineering"
            value={formData.faculty}
            onChange={handleChange}
            required
          />
          <Input
            label="Major"
            name="major"
            placeholder="e.g. Computer Engineering"
            value={formData.major}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button variant="primary" type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Register Member Account
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/auth/login')}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
