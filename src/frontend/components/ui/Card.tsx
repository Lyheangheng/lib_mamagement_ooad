import React from 'react';

export interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, footer, style, className = '' }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(75, 85, 99, 0.4)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...style,
      }}
      className={className}
    >
      {(title || subtitle || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {title && (typeof title === 'string' ? <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f9fafb' }}>{title}</h3> : title)}
            {subtitle && <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
      {footer && <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #374151' }}>{footer}</div>}
    </div>
  );
};
