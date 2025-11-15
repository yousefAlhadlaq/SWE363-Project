import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Components (Yousef)
import LoginPage from '../components/Auth/LoginPage';
import SignUpPage from '../components/Auth/SignUpPage';
import ProfileSettings from '../components/Auth/ProfileSettings';
import ForgotPasswordPage from '../components/Auth/ForgotPassword';
import ResetPasswordPage from '../components/Auth/ResetPassword';
import EmailVerification from '../components/Auth/EmailVerification';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

// Advisor Components (Yousef)
import FinancialAdvicePage from '../components/Advisor/FinancialAdvicePage';
import FinancialAdvisorPage from '../components/Advisor/FinancialAdvisorPage';
import FinancialSettingsPage from '../components/Advisor/FinancialSettingsPage';
import AdvisorAvailabilitySettings from '../components/Advisor/AdvisorAvailabilitySettings';

// Investment Components (Abdulmajeed)
import DashboardPage from '../components/Investments/DashboardPage';
import ZakahCalculator from '../components/Investments/ZakahCalculator';
import ReportsExport from '../components/Investments/ReportsExport';

// Expenses Components (Abdulaziz)
import IncomeEntry from '../components/Expenses/IncomeEntry';
import ExpenseEntry from '../components/Expenses/ExpenseEntry';
import CategoryManager from '../components/Expenses/CategoryManager';
import BudgetsGoals from '../components/Expenses/BudgetsGoals';

// Admin Components (Rayan)
import AdminDashboard from '../components/Admin/AdminDashboard';
import NotificationsPanel from '../components/Admin/NotificationsPanel';
import AdvisorAvailability from '../components/Admin/AdvisorAvailability';
import UserManagement from '../components/Admin/UserManagement';

const clientRoles = ['client', 'user'];
const clientAndAdvisorRoles = ['client', 'user', 'advisor'];
const advisorRoles = ['advisor'];
const adminRoles = ['admin'];

const createProtectedElement = (Component, allowedRoles) => (
  <ProtectedRoute {...(allowedRoles ? { allowedRoles } : {})}>
    <Component />
  </ProtectedRoute>
);

const defaultRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
];

const authRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/verify-email', element: <EmailVerification /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
];

const settingsRoutes = [
  { path: '/settings', element: createProtectedElement(ProfileSettings) },
];

const dashboardRoutes = [
  { path: '/home', element: createProtectedElement(DashboardPage, clientRoles) },
  { path: '/dashboard', element: createProtectedElement(DashboardPage, clientRoles) },
  { path: '/investments', element: createProtectedElement(DashboardPage, clientRoles) },
  { path: '/zakah-calculator', element: createProtectedElement(ZakahCalculator, clientRoles) },
  { path: '/reports', element: createProtectedElement(ReportsExport, clientRoles) },
];

const expenseAndIncomeRoutes = [
  { path: '/income', element: createProtectedElement(IncomeEntry, clientRoles) },
  { path: '/expenses', element: createProtectedElement(ExpenseEntry, clientRoles) },
  { path: '/categories', element: createProtectedElement(CategoryManager, clientRoles) },
  { path: '/budgets', element: createProtectedElement(BudgetsGoals, clientRoles) },
];

const financialAdviceRoutes = [
  { path: '/financial-advice', element: createProtectedElement(FinancialAdvicePage, clientAndAdvisorRoles) },
];

const advisorRoutes = [
  { path: '/financial-advisor', element: createProtectedElement(FinancialAdvisorPage, advisorRoles) },
  { path: '/financial-settings', element: createProtectedElement(FinancialSettingsPage, advisorRoles) },
  { path: '/advisor-availability', element: createProtectedElement(AdvisorAvailabilitySettings, advisorRoles) },
];

const adminRoutes = [
  { path: '/admin', element: createProtectedElement(AdminDashboard, adminRoles) },
  { path: '/admin/notifications', element: createProtectedElement(NotificationsPanel, adminRoles) },
  { path: '/admin/advisors', element: createProtectedElement(AdvisorAvailability, adminRoles) },
  { path: '/admin/users', element: createProtectedElement(UserManagement, adminRoles) },
];

const renderRoutes = (routes) =>
  routes.map(({ path, element }) => <Route key={path} path={path} element={element} />);

function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      {renderRoutes(defaultRoutes)}

      {/* Auth Routes - Public */}
      {renderRoutes(authRoutes)}

      {/* Protected Settings Route - All authenticated users */}
      {renderRoutes(settingsRoutes)}

      {/* Dashboard Routes - Client only (supports both 'user' and 'client' roles) */}
      {renderRoutes(dashboardRoutes)}

      {/* Expense & Income Routes - Client only (supports both 'user' and 'client' roles) */}
      {renderRoutes(expenseAndIncomeRoutes)}

      {/* Financial Advice Routes - Both clients and advisors can access */}
      {renderRoutes(financialAdviceRoutes)}

      {/* Advisor-only Routes */}
      {renderRoutes(advisorRoutes)}

      {/* Admin Routes - Admin only */}
      {renderRoutes(adminRoutes)}

      {/* 404 Not Found */}
      <Route path="*" element={<div className="p-6 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
