import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../domain/Account';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';

export interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
  onNavigate?: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children, onNavigate }) => {
  const { user, role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication session..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <Alert
          type="warning"
          title="Authentication Required"
          message="You must be logged in to view this protected page. Please sign in to continue."
        />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => onNavigate && onNavigate('/auth/login')}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role as UserRole)) {
    return (
      <div style={{ maxWidth: '550px', margin: '3rem auto' }}>
        <Alert
          type="error"
          title="Access Denied (403 Forbidden)"
          message={`Your account role (${role}) does not have permission to access this page. Required role: ${allowedRoles.join(' or ')}.`}
        />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => onNavigate && onNavigate(role === 'LIBRARIAN' ? '/librarian/dashboard' : '/member/dashboard')}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return to {role === 'LIBRARIAN' ? 'Librarian Dashboard' : 'Member Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return children;
};
