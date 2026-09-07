import React from 'react';

export type StatusVariant = 'AVAILABLE' | 'BORROWED' | 'LOST' | 'ACTIVE' | 'SUSPENDED' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'RETURNED' | 'MEMBER' | 'LIBRARIAN';

export interface BadgeProps {
  status: StatusVariant | string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const getBadgeStyle = (): React.CSSProperties => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'PAID':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'BORROWED':
      case 'MEMBER':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'LIBRARIAN':
        return { backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' };
      case 'UNPAID':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'OVERDUE':
      case 'LOST':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'RETURNED':
      case 'SUSPENDED':
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: '9999px',
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        ...getBadgeStyle(),
      }}
    >
      {label || status}
    </span>
  );
};
