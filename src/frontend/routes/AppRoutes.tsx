import React from 'react';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { MemberDashboardPage } from '../pages/member/MemberDashboardPage';
import { MemberCatalogPage } from '../pages/member/MemberCatalogPage';
import { ProfilePage } from '../pages/member/ProfilePage';
import { BorrowingHistoryPage } from '../pages/member/BorrowingHistoryPage';
import { FineStatusPage } from '../pages/member/FineStatusPage';
import { LibrarianDashboardPage } from '../pages/librarian/LibrarianDashboardPage';
import { BookManagementPage } from '../pages/librarian/BookManagementPage';
import { MemberManagementPage } from '../pages/librarian/MemberManagementPage';
import { BorrowingPage } from '../pages/librarian/BorrowingPage';
import { ReturnPage } from '../pages/librarian/ReturnPage';
import { LibrarianBorrowingRecordsPage } from '../pages/librarian/LibrarianBorrowingRecordsPage';
import { FineManagementPage } from '../pages/librarian/FineManagementPage';
import { ReportsPage } from '../pages/librarian/ReportsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export interface AppRoutesProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ currentPath, onNavigate }) => {
  const { role, isAuthenticated } = useAuth();

  // Redirect authenticated user away from /auth/login or /auth/register to dashboard
  if (isAuthenticated && (currentPath === '/auth/login' || currentPath === '/auth/register')) {
    const defaultDashboard = role === 'LIBRARIAN' ? '/librarian/dashboard' : '/member/dashboard';
    onNavigate(defaultDashboard);
  }

  switch (currentPath) {
    // Public Auth Routes
    case '/auth/login':
      return <LoginPage onNavigate={onNavigate} />;
    case '/auth/register':
      return <RegisterPage onNavigate={onNavigate} />;

    // Member Protected Routes
    case '/member/catalog':
      return (
        <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
          <MemberCatalogPage />
        </ProtectedRoute>
      );
    case '/member/dashboard':
      return (
        <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
          <MemberDashboardPage onNavigate={onNavigate} />
        </ProtectedRoute>
      );
    case '/member/profile':
      return (
        <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
          <ProfilePage />
        </ProtectedRoute>
      );
    case '/member/borrowings':
      return (
        <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
          <BorrowingHistoryPage />
        </ProtectedRoute>
      );
    case '/member/fines':
      return (
        <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
          <FineStatusPage />
        </ProtectedRoute>
      );

    // Librarian Protected Routes
    case '/librarian/dashboard':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <LibrarianDashboardPage />
        </ProtectedRoute>
      );
    case '/librarian/books':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <BookManagementPage />
        </ProtectedRoute>
      );
    case '/librarian/members':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <MemberManagementPage />
        </ProtectedRoute>
      );
    case '/librarian/borrowing':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <BorrowingPage />
        </ProtectedRoute>
      );
    case '/librarian/returning':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <ReturnPage />
        </ProtectedRoute>
      );
    case '/librarian/records':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <LibrarianBorrowingRecordsPage />
        </ProtectedRoute>
      );
    case '/librarian/fines':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <FineManagementPage />
        </ProtectedRoute>
      );
    case '/librarian/reports':
      return (
        <ProtectedRoute allowedRoles={['LIBRARIAN']} onNavigate={onNavigate}>
          <ReportsPage />
        </ProtectedRoute>
      );

    // Default Fallback
    default:
      if (isAuthenticated) {
        return (
          <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN']} onNavigate={onNavigate}>
            {role === 'LIBRARIAN' ? <LibrarianDashboardPage /> : <MemberDashboardPage />}
          </ProtectedRoute>
        );
      }
      return <LoginPage onNavigate={onNavigate} />;
  }
};
