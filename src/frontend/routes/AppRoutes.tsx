import React from 'react';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { MemberDashboardPage } from '../pages/member/MemberDashboardPage';
import { ProfilePage } from '../pages/member/ProfilePage';
import { BorrowingHistoryPage } from '../pages/member/BorrowingHistoryPage';
import { FineStatusPage } from '../pages/member/FineStatusPage';
import { LibrarianDashboardPage } from '../pages/librarian/LibrarianDashboardPage';
import { BookManagementPage } from '../pages/librarian/BookManagementPage';
import { MemberManagementPage } from '../pages/librarian/MemberManagementPage';
import { BorrowingPage } from '../pages/librarian/BorrowingPage';
import { ReturnPage } from '../pages/librarian/ReturnPage';
import { FineManagementPage } from '../pages/librarian/FineManagementPage';
import { ReportsPage } from '../pages/librarian/ReportsPage';
import { useAuth } from '../context/AuthContext';

export interface AppRoutesProps {
  currentPath: string;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ currentPath }) => {
  const { role } = useAuth();

  switch (currentPath) {
    // Auth Routes
    case '/auth/login':
      return <LoginPage />;
    case '/auth/register':
      return <RegisterPage />;

    // Member Routes
    case '/member/dashboard':
      return <MemberDashboardPage />;
    case '/member/profile':
      return <ProfilePage />;
    case '/member/borrowings':
      return <BorrowingHistoryPage />;
    case '/member/fines':
      return <FineStatusPage />;

    // Librarian Routes
    case '/librarian/dashboard':
      return <LibrarianDashboardPage />;
    case '/librarian/books':
      return <BookManagementPage />;
    case '/librarian/members':
      return <MemberManagementPage />;
    case '/librarian/borrowing':
      return <BorrowingPage />;
    case '/librarian/returning':
      return <ReturnPage />;
    case '/librarian/fines':
      return <FineManagementPage />;
    case '/librarian/reports':
      return <ReportsPage />;

    // Default Fallback according to role
    default:
      if (role === 'LIBRARIAN') return <LibrarianDashboardPage />;
      if (role === 'MEMBER') return <MemberDashboardPage />;
      return <LoginPage />;
  }
};
