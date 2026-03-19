import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { exitDemoMode, isDemoModeActive, setDemoMode } from '../lib/demoUtils';
import { endImpersonation, getImpersonationSession } from '../lib/superAdmin';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: string | null;
    gymId: string | null;
    gymStatus: string | null;
    subscriptionTier: string | null;
    dashboardMode: 'basic' | 'advanced' | null;
    setDashboardMode: (mode: 'basic' | 'advanced') => void;
    onboardingCompleted: boolean;
    setOnboardingCompleted: (completed: boolean) => void;
    isImpersonating: boolean;
    impersonatedGymId: string | null;
    impersonatedGymName: string | null;
    stopImpersonation: () => Promise<void>;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    userRole: null,
    gymId: null,
    gymStatus: null,
    subscriptionTier: null,
    dashboardMode: null,
    setDashboardMode: () => {},
    onboardingCompleted: true, // Default true to prevent locking existing users temporarily
    setOnboardingCompleted: () => {},
    isImpersonating: false,
    impersonatedGymId: null,
    impersonatedGymName: null,
    stopImpersonation: async () => {},
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [gymId, setGymId] = useState<string | null>(null);
    const [gymStatus, setGymStatus] = useState<string | null>(null);
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
    const [dashboardMode, setDashboardModeState] = useState<'basic' | 'advanced' | null>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedGymId, setImpersonatedGymId] = useState<string | null>(null);
    const [impersonatedGymName, setImpersonatedGymName] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true); // Default to true while loading
    const [loading, setLoading] = useState(true);

    const setDashboardMode = async (mode: 'basic' | 'advanced') => {
        setDashboardModeState(mode);
        if (gymId && gymId !== 'demo-gym-id') {
            try {
                await supabase.from('gyms').update({ dashboard_mode: mode }).eq('id', gymId);
            } catch (err) {
                console.error('Failed to update dashboard mode', err);
            }
        } else if (gymId === 'demo-gym-id') {
            sessionStorage.setItem('liftlegend_demo_dashboard_mode', mode);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Check for Demo Mode bypass
        const isDemo = isDemoModeActive();
        if (isDemo) {
            setDemoMode(true);
            setUserRole('OWNER');
            setGymId('demo-gym-id');
            setGymStatus('ACTIVE');
            setSubscriptionTier('ELITE LEGEND');
            setDashboardModeState((window.sessionStorage.getItem('liftlegend_demo_dashboard_mode') as 'basic' | 'advanced') || 'advanced');
            setOnboardingCompleted(true);
            setLoading(false);
            return;
        }

        // Get active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id, session.user.email || null);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            // Re-check demo mode on auth change (in case of sign out)
            const demoActive = isDemoModeActive();
            if (demoActive) return;

            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id, session.user.email || null);
            } else {
                setUserRole(null);
                setGymId(null);
                setGymStatus(null);
                setSubscriptionTier(null);
                setDashboardModeState(null);
                setOnboardingCompleted(true);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId: string, userEmail: string | null) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, gym_id, display_name')
                .eq('user_id', userId);

            if (error) throw error;

            if (!data || data.length === 0) {
                setUserRole(null);
                setGymId(null);
                setGymStatus(null);
                setSubscriptionTier(null);
                setDashboardModeState(null);
                setOnboardingCompleted(true);
                return;
            }

            const selectedRole = data.find((row) => row.role === 'SUPER_ADMIN') || data[0];
            const isSuperAdmin = selectedRole.role === 'SUPER_ADMIN';
            const activeImpersonation = isSuperAdmin ? getImpersonationSession() : null;

            setIsImpersonating(Boolean(activeImpersonation));
            setImpersonatedGymId(activeImpersonation?.gymId || null);
            setImpersonatedGymName(activeImpersonation?.gymName || null);

            setUserRole(activeImpersonation ? 'OWNER' : selectedRole.role);
            setGymId(activeImpersonation?.gymId || selectedRole.gym_id);
            setGymStatus(null);
            setSubscriptionTier(activeImpersonation?.subscriptionTier || null);

            // Auto-populate display_name if missing
            if (!selectedRole.display_name && userEmail) {
                supabase.from('user_roles')
                    .update({ display_name: userEmail })
                    .eq('user_id', userId)
                    .eq('gym_id', selectedRole.gym_id)
                    .then(() => { });
            }

            // Fetch gym status for lock detection (skip for super admins)
            if ((!isSuperAdmin || activeImpersonation) && (activeImpersonation?.gymId || selectedRole.gym_id)) {
                // First get the core gym data that we KNOW exists
                const { data: gymData, error: gymError } = await supabase
                    .from('gyms')
                    .select('status, subscription_tier')
                    .eq('id', activeImpersonation?.gymId || selectedRole.gym_id)
                    .maybeSingle();
                if (gymError) throw gymError;
                setGymStatus(gymData?.status || null);
                setSubscriptionTier(gymData?.subscription_tier || 'BASIC');
                
                // Then try to get onboarding_completed, handling failure gracefully if column is missing
                try {
                    const { data: onboardingData, error: onboardingError } = await supabase
                        .from('gyms')
                        .select('onboarding_completed')
                        .eq('id', activeImpersonation?.gymId || selectedRole.gym_id)
                        .maybeSingle();
                    
                    if (!onboardingError && onboardingData) {
                        setOnboardingCompleted(onboardingData.onboarding_completed !== false);
                    } else {
                        setOnboardingCompleted(true); // Default to true if missing to avoid breaking logins
                    }
                } catch {
                    setOnboardingCompleted(true);
                }
                
                // Attempt to fetch dashboard mode from database cleanly
                try {
                    const { data: modeData, error: modeError } = await supabase
                        .from('gyms')
                        .select('dashboard_mode')
                        .eq('id', activeImpersonation?.gymId || selectedRole.gym_id)
                        .maybeSingle();

                    if (!modeError && modeData) {
                        setDashboardModeState(modeData.dashboard_mode || 'advanced');
                    } else {
                        setDashboardModeState('advanced');
                    }
                } catch {
                    setDashboardModeState('advanced');
                }
            } else {
               setOnboardingCompleted(true);
            }
        } catch (err) {
            console.error('Unexpected error fetching user role', err);
            setUserRole(null);
            setGymId(null);
            setGymStatus(null);
            setSubscriptionTier(null);
            setDashboardModeState(null);
            setOnboardingCompleted(true);
            setIsImpersonating(false);
            setImpersonatedGymId(null);
            setImpersonatedGymName(null);
        } finally {
            setLoading(false);
        }
    };

    const stopImpersonation = async () => {
        await endImpersonation();
        setIsImpersonating(false);
        setImpersonatedGymId(null);
        setImpersonatedGymName(null);
        window.location.href = '/super-admin';
    };

    const signOut = async () => {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setGymId(null);
        setGymStatus(null);
        setSubscriptionTier(null);
        setDashboardModeState(null);
        setOnboardingCompleted(true);
        setIsImpersonating(false);
        setImpersonatedGymId(null);
        setImpersonatedGymName(null);
        if (isDemoModeActive()) {
            exitDemoMode();
            return;
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, userRole, gymId, gymStatus, subscriptionTier, dashboardMode, setDashboardMode, onboardingCompleted, setOnboardingCompleted, isImpersonating, impersonatedGymId, impersonatedGymName, stopImpersonation, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
