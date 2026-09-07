import React from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e5e7eb' }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          backgroundColor: '#1f2937',
          border: `1px solid ${error ? '#ef4444' : '#374151'}`,
          borderRadius: '8px',
          color: '#f9fafb',
          fontSize: '0.95rem',
          outline: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: '#111827' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '0.775rem', color: '#f87171' }}>{error}</span>}
    </div>
  );
};
