import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentPath, onNavigate, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      <footer style={{ padding: '1rem', backgroundColor: '#111827', borderTop: '1px solid #374151', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
        Library Management System Demo &copy; 2026 - OOAD University Project (Phase 4 Foundation)
      </footer>
    </div>
  );
};
