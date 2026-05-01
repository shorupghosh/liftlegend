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
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { PageLoader } from './components/ui/PageLoader';

// Lazy-load layout & modal — they only matter after auth, not on landing page
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const PlanUpgradeModal = lazy(() => import('./components/plan/PlanUpgradeModal'));

// Lazy-loaded pages — each becomes its own chunk, loaded on demand
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SubscriptionLock = lazy(() => import('./pages/SubscriptionLock'));
const BookDemo = lazy(() => import('./pages/BookDemo'));
const LeaveReview = lazy(() => import('./pages/LeaveReview'));
const CompareMySoftHeaven = lazy(() => import('./pages/marketing/CompareMySoftHeaven'));
const FeaturePaymentTracking = lazy(() => import('./pages/marketing/FeaturePaymentTracking'));
const FeatureAttendance = lazy(() => import('./pages/marketing/FeatureAttendance'));
const BlogHub = lazy(() => import('./pages/marketing/BlogHub'));
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
import { SkeletonLayout } from './components/layout/SkeletonLayout';

// Loading spinner shown while a lazy page chunk is being fetched
function RouteLoader() {
  return <SkeletonLayout />;
}

export default function App() {
  return (
    <div style={{ fontFamily: '"Manrope", sans-serif' }} className="antialiased">
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
              <Route path="/leave-review" element={<LeaveReview />} />
              <Route path="/compare/mysoftheaven-alternative" element={<CompareMySoftHeaven />} />
              <Route path="/features/gym-billing-software-bangladesh" element={<FeaturePaymentTracking />} />
              <Route path="/features/qr-code-gym-attendance-bangladesh" element={<FeatureAttendance />} />
              <Route path="/blog" element={<BlogHub />} />
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
                <Route path="/admin/attendance" element={<AdminLayout><FeatureRoute feature="attendanceTracking"><AttendanceScanner /></FeatureRoute></AdminLayout>} />
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
            <Suspense fallback={null}>
              <PlanUpgradeModal />
            </Suspense>
            {/* Global WhatsApp Floating Button */}
            <a 
              href="https://wa.me/8801756625762" 
              target="_blank" 
              rel="noreferrer" 
              className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
              aria-label="Contact us on WhatsApp"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </a>
            </PlanProvider>
            </AuthProvider>
          </DemoDataProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
    </div>
  );
}
