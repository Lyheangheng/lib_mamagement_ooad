import React from 'react';
import { BookOpen, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Header: React.FC = () => {
  const { user, role, logout, setGuestRole } = useAuth();

  return (
    <header
      style={{
        height: '65px',
        backgroundColor: '#111827',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.5rem', backgroundColor: '#6366f1', borderRadius: '8px', display: 'flex' }}>
          <BookOpen color="#ffffff" size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.01em' }}>
            Library System
          </h1>
          <span style={{ fontSize: '0.725rem', color: '#9ca3af' }}>OOAD University Project</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Switcher Demo Control for Phase 4 foundation testing */}
        {!user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1f2937', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid #374151' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Demo View:</span>
            <Button
              size="sm"
              variant={role === 'MEMBER' ? 'primary' : 'ghost'}
              onClick={() => setGuestRole('MEMBER')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Member
            </Button>
            <Button
              size="sm"
              variant={role === 'LIBRARIAN' ? 'primary' : 'ghost'}
              onClick={() => setGuestRole('LIBRARIAN')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Librarian
            </Button>
            <Button
              size="sm"
              variant={role === 'GUEST' ? 'primary' : 'ghost'}
              onClick={() => setGuestRole('GUEST')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              Guest
            </Button>
          </div>
        )}

        <Badge status={role} />

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f9fafb' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.username}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} icon={<LogOut size={16} />}>
              Logout
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={18} color="#9ca3af" />
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Guest Mode</span>
          </div>
        )}
      </div>
    </header>
  );
};
