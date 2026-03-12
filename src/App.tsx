/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';

// Lazy-loaded pages — each becomes its own chunk, loaded on demand
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SubscriptionLock = lazy(() => import('./pages/SubscriptionLock'));
const BookDemo = lazy(() => import('./pages/BookDemo'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MembersManagement = lazy(() => import('./pages/MembersManagement'));
const MemberDetail = lazy(() => import('./pages/MemberDetail'));
const AttendanceScanner = lazy(() => import('./pages/AttendanceScanner'));
const MembershipPlans = lazy(() => import('./pages/MembershipPlans'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const CommunicationCenter = lazy(() => import('./pages/CommunicationCenter'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const GymSettings = lazy(() => import('./pages/GymSettings'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const RevenueDashboard = lazy(() => import('./pages/super-admin/RevenueDashboard'));
const SystemHealth = lazy(() => import('./pages/super-admin/SystemHealth'));
const UsageAnalytics = lazy(() => import('./pages/super-admin/UsageAnalytics'));
const SubscriptionManagement = lazy(() => import('./pages/super-admin/SubscriptionManagement'));
const SupportTickets = lazy(() => import('./pages/super-admin/SupportTickets'));
const AuditLogs = lazy(() => import('./pages/super-admin/AuditLogs'));

// Loading spinner shown while a lazy page chunk is being fetched
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-default dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 border-4 border-primary-default/30 border-t-primary-default rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/subscription-locked" element={<SubscriptionLock />} />
              <Route path="/book-demo" element={<BookDemo />} />

              {/* Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/super-admin" element={<AdminLayout><SuperAdminDashboard /></AdminLayout>} />
                <Route path="/super-admin/revenue" element={<AdminLayout><RevenueDashboard /></AdminLayout>} />
                <Route path="/super-admin/system" element={<AdminLayout><SystemHealth /></AdminLayout>} />
                <Route path="/super-admin/usage" element={<AdminLayout><UsageAnalytics /></AdminLayout>} />
                <Route path="/super-admin/subscriptions" element={<AdminLayout><SubscriptionManagement /></AdminLayout>} />
                <Route path="/super-admin/support" element={<AdminLayout><SupportTickets /></AdminLayout>} />
                <Route path="/super-admin/audit" element={<AdminLayout><AuditLogs /></AdminLayout>} />
              </Route>

              {/* Tenant Staff Routes */}
              <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']} />}>
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/members" element={<AdminLayout><MembersManagement /></AdminLayout>} />
                <Route path="/admin/members/:memberId" element={<AdminLayout><MemberDetail /></AdminLayout>} />
                <Route path="/admin/attendance" element={<AdminLayout><AttendanceScanner /></AdminLayout>} />
                <Route path="/admin/plans" element={<AdminLayout><MembershipPlans /></AdminLayout>} />
                <Route path="/admin/payments" element={<AdminLayout><PaymentManagement /></AdminLayout>} />
                <Route path="/admin/analytics" element={<AdminLayout><AdvancedAnalytics /></AdminLayout>} />
                <Route path="/admin/notifications" element={<AdminLayout><CommunicationCenter /></AdminLayout>} />
                <Route path="/admin/staff" element={<AdminLayout><StaffManagement /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><GymSettings /></AdminLayout>} />
              </Route>
            </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
