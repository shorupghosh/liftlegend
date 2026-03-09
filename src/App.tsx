/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MembersManagement from './pages/MembersManagement';
import AttendanceScanner from './pages/AttendanceScanner';
import MembershipPlans from './pages/MembershipPlans';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import CommunicationCenter from './pages/CommunicationCenter';
import StaffManagement from './pages/StaffManagement';
import GymSettings from './pages/GymSettings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/members" element={<MembersManagement />} />
        <Route path="/admin/attendance" element={<AttendanceScanner />} />
        <Route path="/admin/plans" element={<MembershipPlans />} />
        <Route path="/admin/analytics" element={<AdvancedAnalytics />} />
        <Route path="/admin/notifications" element={<CommunicationCenter />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/settings" element={<GymSettings />} />
      </Routes>
    </Router>
  );
}
