import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, style, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        {label && (
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e5e7eb' }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span style={{ position: 'absolute', left: '0.75rem', color: '#9ca3af', display: 'flex' }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            style={{
              width: '100%',
              padding: icon ? '0.6rem 0.75rem 0.6rem 2.5rem' : '0.6rem 0.75rem',
              backgroundColor: '#1f2937',
              border: `1px solid ${error ? '#ef4444' : '#374151'}`,
              borderRadius: '8px',
              color: '#f9fafb',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              ...style,
            }}
            {...props}
          />
        </div>
        {error && <span style={{ fontSize: '0.775rem', color: '#f87171' }}>{error}</span>}
        {helperText && !error && <span style={{ fontSize: '0.775rem', color: '#9ca3af' }}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
