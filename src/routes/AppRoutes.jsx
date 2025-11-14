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



function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes - Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Settings Route - All authenticated users */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      {/* Dashboard Routes - Client only (supports both 'user' and 'client' roles) */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investments"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zakah-calculator"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <ZakahCalculator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <ReportsExport />
          </ProtectedRoute>
        }
      />

      {/* Expense & Income Routes - Client only (supports both 'user' and 'client' roles) */}
      <Route
        path="/income"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <IncomeEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <ExpenseEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <CategoryManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute allowedRoles={['client', 'user']}>
            <BudgetsGoals />
          </ProtectedRoute>
        }
      />

      {/* Financial Advice Routes - Both clients and advisors can access */}
      <Route
        path="/financial-advice"
        element={
          <ProtectedRoute allowedRoles={['client', 'user', 'advisor']}>
            <FinancialAdvicePage />
          </ProtectedRoute>
        }
      />

      {/* Advisor-only Routes */}
      <Route
        path="/financial-advisor"
        element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <FinancialAdvisorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-settings"
        element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <FinancialSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor-availability"
        element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorAvailabilitySettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <NotificationsPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/advisors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdvisorAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<div className="p-6 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
