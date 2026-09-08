import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export interface LoginPageProps {
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Username/Student ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await ApiClient.post('/auth/login', {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.success && res.token && res.user) {
        login(res.token, {
          accountId: res.user.accountId,
          userId: res.user.userId,
          username: res.user.username,
          name: res.user.name || res.user.username,
          email: res.user.email,
          role: res.user.role,
          memberId: res.user.memberId,
          librarianId: res.user.librarianId,
        });

        // Role-based redirection
        if (onNavigate) {
          if (res.user.role === 'LIBRARIAN') {
            onNavigate('/librarian/dashboard');
          } else {
            onNavigate('/member/dashboard');
          }
        }
      } else {
        setErrorMsg(res.error || 'Invalid username or password.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <Card title="Account Login" subtitle="Enter your credentials to access the Library Management System">
        {errorMsg && <Alert type="error" message={errorMsg} />}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }} onSubmit={handleSubmit}>
          <Input
            label="Student ID / Username"
            placeholder="e.g. 6712732101 or librarian_anan"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button variant="primary" type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign In
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            Don't have a member account?{' '}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/auth/register')}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}
            >
              Register Student ID
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
