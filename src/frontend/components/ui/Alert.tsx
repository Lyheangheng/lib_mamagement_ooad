import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message }) => {
  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', icon: <CheckCircle color="#10b981" size={20} /> };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', icon: <AlertCircle color="#ef4444" size={20} /> };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', icon: <AlertTriangle color="#f59e0b" size={20} /> };
      case 'info':
      default:
        return { bg: 'rgba(99, 102, 241, 0.12)', border: '#6366f1', icon: <Info color="#6366f1" size={20} /> };
    }
  };

  const style = getTypeStyle();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: '6px',
        width: '100%',
      }}
    >
      <div style={{ marginTop: '2px' }}>{style.icon}</div>
      <div>
        {title && <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f9fafb', marginBottom: '0.15rem' }}>{title}</h4>}
        <p style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>{message}</p>
      </div>
    </div>
  );
};
