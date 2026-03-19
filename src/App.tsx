/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DemoDataProvider } from './contexts/DemoDataContext';
import { PlanProvider } from './contexts/PlanContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import FeatureRoute from './components/auth/FeatureRoute';
import AdminLayout from './components/layout/AdminLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { PageLoader } from './components/ui/PageLoader';
import PlanUpgradeModal from './components/plan/PlanUpgradeModal';

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
const GymDetails = lazy(() => import('./pages/super-admin/GymDetails'));
const SetupWizard = lazy(() => import('./pages/SetupWizard'));
const SubscriptionBilling = lazy(() => import('./pages/SubscriptionBilling'));
// Loading spinner shown while a lazy page chunk is being fetched
function RouteLoader() {
  return (
    <div className="min-h-screen bg-neutral-default p-6 dark:bg-slate-950">
      <PageLoader label="Loading page..." />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <DemoDataProvider>
            <AuthProvider>
            <PlanProvider>
            <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/subscription-locked" element={<SubscriptionLock />} />
              <Route path="/book-demo" element={<BookDemo />} />
              <Route path="/demo" element={<AdminLayout><AdminDashboard /></AdminLayout>} />

              {/* Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/super-admin" element={<AdminLayout><SuperAdminDashboard /></AdminLayout>} />
                <Route path="/super-admin/revenue" element={<AdminLayout><RevenueDashboard /></AdminLayout>} />
                <Route path="/super-admin/system" element={<AdminLayout><SystemHealth /></AdminLayout>} />
                <Route path="/super-admin/usage" element={<AdminLayout><UsageAnalytics /></AdminLayout>} />
                <Route path="/super-admin/subscriptions" element={<AdminLayout><SubscriptionManagement /></AdminLayout>} />
                <Route path="/super-admin/support" element={<AdminLayout><SupportTickets /></AdminLayout>} />
                <Route path="/super-admin/audit" element={<AdminLayout><AuditLogs /></AdminLayout>} />
                <Route path="/super-admin/gyms/:gymId" element={<AdminLayout><GymDetails /></AdminLayout>} />
              </Route>

              {/* Tenant Staff Routes */}
              <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']} />}>
                <Route path="/setup" element={<AdminLayout><SetupWizard /></AdminLayout>} />
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/members" element={<AdminLayout><MembersManagement /></AdminLayout>} />
                <Route path="/admin/members/:memberId" element={<AdminLayout><MemberDetail /></AdminLayout>} />
                <Route path="/admin/attendance" element={<AdminLayout><FeatureRoute feature="qrCheckin"><AttendanceScanner /></FeatureRoute></AdminLayout>} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']} />}>
                <Route path="/admin/plans" element={<AdminLayout><MembershipPlans /></AdminLayout>} />
                <Route path="/admin/payments" element={<AdminLayout><PaymentManagement /></AdminLayout>} />
                <Route path="/admin/analytics" element={<AdminLayout><FeatureRoute feature="analyticsAdvanced"><AdvancedAnalytics /></FeatureRoute></AdminLayout>} />
                <Route path="/admin/staff" element={<AdminLayout><FeatureRoute feature="staffManagement"><StaffManagement /></FeatureRoute></AdminLayout>} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                <Route path="/admin/notifications" element={<AdminLayout><FeatureRoute feature="notifications"><CommunicationCenter /></FeatureRoute></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><GymSettings /></AdminLayout>} />
                <Route path="/admin/settings/subscription" element={<AdminLayout><SubscriptionBilling /></AdminLayout>} />
              </Route>
            </Routes>
            </Suspense>
            <PlanUpgradeModal />
            </PlanProvider>
            </AuthProvider>
          </DemoDataProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}
