import React from 'react';
import {
  LayoutDashboard,
  Book,
  Users,
  ArrowRightLeft,
  RotateCcw,
  CreditCard,
  FileText,
  User,
  History,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { role } = useAuth();

  const memberNav = [
    { label: 'Dashboard', path: '/member/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Profile', path: '/member/profile', icon: <User size={18} /> },
    { label: 'Borrowing History', path: '/member/borrowings', icon: <History size={18} /> },
    { label: 'Fine Status', path: '/member/fines', icon: <CreditCard size={18} /> },
  ];

  const librarianNav = [
    { label: 'Dashboard', path: '/librarian/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Books', path: '/librarian/books', icon: <Book size={18} /> },
    { label: 'Members', path: '/librarian/members', icon: <Users size={18} /> },
    { label: 'Borrowing', path: '/librarian/borrowing', icon: <ArrowRightLeft size={18} /> },
    { label: 'Returning', path: '/librarian/returning', icon: <RotateCcw size={18} /> },
    { label: 'Fine Management', path: '/librarian/fines', icon: <CreditCard size={18} /> },
    { label: 'Reports', path: '/librarian/reports', icon: <FileText size={18} /> },
  ];

  const publicNav = [
    { label: 'Login', path: '/auth/login', icon: <LogIn size={18} /> },
    { label: 'Register', path: '/auth/register', icon: <UserPlus size={18} /> },
  ];

  const getNavItems = () => {
    if (role === 'LIBRARIAN') return librarianNav;
    if (role === 'MEMBER') return memberNav;
    return publicNav;
  };

  const navItems = getNavItems();

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#111827',
        borderRight: '1px solid #374151',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {role} NAVIGATION
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#6366f1' : 'transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: isActive ? '#ffffff' : '#6b7280' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
