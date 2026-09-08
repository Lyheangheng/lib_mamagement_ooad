import React, { useState } from 'react';
import { AuthProvider } from './frontend/context/AuthContext';
import { MainLayout } from './frontend/layouts/MainLayout';
import { AppRoutes } from './frontend/routes/AppRoutes';
import './frontend/styles/theme.css';

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/auth/login');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <MainLayout currentPath={currentPath} onNavigate={handleNavigate}>
      <AppRoutes currentPath={currentPath} onNavigate={handleNavigate} />
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
