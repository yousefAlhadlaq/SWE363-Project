import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Components (Yousef)
import LoginPage from '../components/Auth/LoginPage';
import SignUpPage from '../components/Auth/SignUpPage';
import ProfileSettings from '../components/Auth/ProfileSettings';
import ForgotPasswordPage from '../components/Auth/ForgotPassword';
import ResetPasswordPage from '../components/Auth/ResetPassword';

// Advisor Components (Yousef)
import FinancialAdvicePage from '../components/Advisor/FinancialAdvicePage';
import FinancialAdvisorPage from '../components/Advisor/FinancialAdvisorPage';
import FinancialSettingsPage from '../components/Advisor/FinancialSettingsPage';

// Dashboard Components (Abdulmajeed)
import DashboardPage from '../components/Dashboard/DashboardPage';
import ZakahCalculator from '../components/Dashboard/ZakahCalculator';
import ReportsExport from '../components/Dashboard/ReportsExport';

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

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/profile" element={<ProfileSettings />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/zakah-calculator" element={<ZakahCalculator />} />
      <Route path="/reports" element={<ReportsExport />} />

      {/* Expense & Income Routes */}
      <Route path="/income" element={<IncomeEntry />} />
      <Route path="/expenses" element={<ExpenseEntry />} />
      <Route path="/categories" element={<CategoryManager />} />
      <Route path="/budgets" element={<BudgetsGoals />} />

      {/* Advisor Routes */}
      <Route path="/financial-advice" element={<FinancialAdvicePage />} />
      <Route path="/financial-advisor" element={<FinancialAdvisorPage />} />
      <Route path="/financial-settings" element={<FinancialSettingsPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/notifications" element={<NotificationsPanel />} />
      <Route path="/admin/advisors" element={<AdvisorAvailability />} />
      <Route path="/admin/users" element={<UserManagement />} />

      {/* 404 Not Found */}
      <Route path="*" element={<div className="p-6 text-center">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
