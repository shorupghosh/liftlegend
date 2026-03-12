import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
    const { session, userRole, gymStatus, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex bg-neutral-default items-center justify-center min-h-screen">
                <div className="size-12 border-4 border-primary-default border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not logged in -> go to login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Logged in, but route requires specific roles
    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        // Determine where to send them based on their actual role (or lack thereof)
        if (userRole === 'SUPER_ADMIN') {
            return <Navigate to="/super-admin" replace />;
        }
        if (userRole) {
            return <Navigate to="/admin" replace />;
        }
        return (
            <div className="flex bg-neutral-default items-center justify-center min-h-screen p-6 text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-slate-600 text-sm mb-4">Your account is not assigned to any gym yet or has no role permissions.</p>
                </div>
            </div>
        );
    }

    // Check if gym is locked (only for tenant staff, not super admins)
    if (userRole !== 'SUPER_ADMIN' && gymStatus === 'LOCKED') {
        return <Navigate to="/subscription-locked" replace />;
    }

    return <Outlet />;
};
