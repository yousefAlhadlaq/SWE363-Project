import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/Layouts/AuthLayout';
import AppLayout from '../components/Layouts/AppLayout';

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
import InvestmentsPage from '../components/Investments/InvestmentsPage';
import ZakahCalculator from '../components/Investments/ZakahCalculator';
import ReportsExport from '../components/Investments/ReportsExport';

// Expenses Components (Abdulaziz)
import IncomeEntry from '../components/Expenses/IncomeEntry';
import ExpenseEntry from '../components/Expenses/ExpenseEntry';
import CategoryManager from '../components/Expenses/CategoryManager';
import BudgetsGoals from '../components/Expenses/BudgetsGoals';
import ExpensesPage from '../components/Expenses/ExpensesPage';

// Dashboard Components (Rayan)
import DashboardPage from '../components/Dashboard/DashboardPage';

// Admin Components (Rayan)
import AdminDashboard from '../components/Admin/AdminDashboard';
import NotificationsPanel from '../components/Admin/NotificationsPanel';
import AdvisorAvailability from '../components/Admin/AdvisorAvailability';
import UserManagement from '../components/Admin/UserManagement';
import AdminSettings from '../components/Admin/AdminSettings';

const clientRoles = ['client', 'user'];
const clientAndAdvisorRoles = ['client', 'user', 'advisor'];
const advisorRoles = ['advisor'];
const adminRoles = ['admin'];

function AppRoutes() {
  return (
    <Routes>
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes (Public, No Navbar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* App Routes (Protected, With Navbar) */}
      <Route element={<AppLayout />}>
        
        {/* Dashboard - Client Only */}
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Settings - All Authenticated */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />

        {/* Investments - Client Only */}
        <Route path="/investments" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <InvestmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/zakah-calculator" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <ZakahCalculator />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <ReportsExport />
          </ProtectedRoute>
        } />

        {/* Expenses & Income - Client Only */}
        <Route path="/income" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <IncomeEntry />
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <ExpensesPage />
          </ProtectedRoute>
        } />
        <Route path="/expenses/manual-entry" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <ExpenseEntry />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <CategoryManager />
          </ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute allowedRoles={clientRoles}>
            <BudgetsGoals />
          </ProtectedRoute>
        } />

        {/* Financial Advice - Client & Advisor */}
        <Route path="/financial-advice" element={
          <ProtectedRoute allowedRoles={clientAndAdvisorRoles}>
            <FinancialAdvicePage />
          </ProtectedRoute>
        } />

        {/* Advisor Only Routes */}
        <Route path="/financial-advisor" element={
          <ProtectedRoute allowedRoles={advisorRoles}>
            <FinancialAdvisorPage />
          </ProtectedRoute>
        } />
        <Route path="/financial-settings" element={
          <ProtectedRoute allowedRoles={advisorRoles}>
            <FinancialSettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/advisor-availability" element={
          <ProtectedRoute allowedRoles={advisorRoles}>
            <AdvisorAvailabilitySettings />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={adminRoles}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute allowedRoles={adminRoles}>
            <NotificationsPanel />
          </ProtectedRoute>
        } />
        <Route path="/admin/advisors" element={
          <ProtectedRoute allowedRoles={adminRoles}>
            <AdvisorAvailability />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={adminRoles}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={adminRoles}>
            <AdminSettings />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<div className="p-6 text-center text-white">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
