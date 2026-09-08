import React from 'react';
import { BookOpen, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export interface HeaderProps {
  onNavigate?: (path: string) => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onNavigate) {
      onNavigate('/auth/login');
    }
  };

  return (
    <header
      style={{
        height: '65px',
        backgroundColor: '#111827',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 50,
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            style={{ padding: '0.4rem', color: '#9ca3af' }}
            className="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        )}

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate(role === 'LIBRARIAN' ? '/librarian/dashboard' : role === 'MEMBER' ? '/member/dashboard' : '/auth/login')}
        >
          <div style={{ padding: '0.5rem', backgroundColor: '#6366f1', borderRadius: '8px', display: 'flex' }}>
            <BookOpen color="#ffffff" size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Library System
            </h1>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>OOAD Project</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Badge status={role} />

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f9fafb' }}>{user.name}</div>
              <div style={{ fontSize: '0.725rem', color: '#9ca3af' }}>{user.username}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut size={16} />} aria-label="Log out">
              Logout
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              <UserIcon size={16} />
              <span style={{ display: 'inline-block' }}>Guest</span>
            </div>
            <Button variant="primary" size="sm" onClick={() => onNavigate && onNavigate('/auth/login')}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

