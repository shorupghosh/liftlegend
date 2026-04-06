import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { safeSessionGet, safeSessionSet } from '../lib/safeStorage';
import { exitDemoMode, isDemoModeActive, setDemoMode } from '../lib/demoUtils';
import { endImpersonation, getImpersonationSession } from '../lib/superAdmin';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: string | null;
    gymId: string | null;
    gymStatus: string | null;
    trialEndsAt: string | null;
    subscriptionTier: string | null;
    dashboardMode: 'basic' | 'advanced' | null;
    gymName: string | null;
    gymLogoUrl: string | null;
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
    trialEndsAt: null,
    subscriptionTier: null,
    dashboardMode: null,
    gymName: null,
    gymLogoUrl: null,
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
    const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
    const [dashboardMode, setDashboardModeState] = useState<'basic' | 'advanced' | null>(null);
    const [gymName, setGymName] = useState<string | null>(null);
    const [gymLogoUrl, setGymLogoUrl] = useState<string | null>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedGymId, setImpersonatedGymId] = useState<string | null>(null);
    const [impersonatedGymName, setImpersonatedGymName] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true); // Default to true while loading
    const [loading, setLoading] = useState(true);
    const fetchInFlightRef = useRef(false);
    const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setDashboardMode = useCallback(async (mode: 'basic' | 'advanced') => {
        setDashboardModeState(mode);
        if (gymId && gymId !== 'demo-gym-id') {
            try {
                await supabase.from('gyms').update({ dashboard_mode: mode }).eq('id', gymId);
            } catch (err) {
                console.error('Failed to update dashboard mode', err);
            }
        } else if (gymId === 'demo-gym-id') {
            safeSessionSet('liftlegend_demo_dashboard_mode', mode);
        }
    }, [gymId]);

    useEffect(() => {
        let mounted = true;

        // Safety timeout — never let loading hang more than 12 seconds
        loadingTimeoutRef.current = setTimeout(() => {
            if (mounted) {
                console.warn('[Auth] Loading timeout reached — forcing loading=false');
                setLoading(false);
            }
        }, 12000);

        // Check for Demo Mode bypass
        const isDemo = isDemoModeActive();
        if (isDemo) {
            setDemoMode(true);
            setUserRole('OWNER');
            setGymId('demo-gym-id');
            setGymStatus('ACTIVE');
            setTrialEndsAt(null);
            setSubscriptionTier('PREMIUM');
            setDashboardModeState((safeSessionGet('liftlegend_demo_dashboard_mode') as 'basic' | 'advanced') || 'advanced');
            setOnboardingCompleted(true);
            setLoading(false);
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            return;
        }

        let initialFetchDone = false;

        // Get active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                initialFetchDone = true;
                fetchUserRole(session.user.id, session.user.email || null);
            } else {
                setLoading(false);
                if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
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
                // Skip duplicate fetch if getSession already triggered one for the same user
                if (initialFetchDone && !fetchInFlightRef.current) {
                    return; // getSession already handled this
                }
                fetchUserRole(session.user.id, session.user.email || null);
            } else {
                setUserRole(null);
                setGymId(null);
                setGymStatus(null);
                setTrialEndsAt(null);
                setSubscriptionTier(null);
                setDashboardModeState(null);
                setGymName(null);
                setGymLogoUrl(null);
                setOnboardingCompleted(true);
                setLoading(false);
                if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        };
    }, []);

    const fetchUserRole = useCallback(async (userId: string, userEmail: string | null) => {
        // Prevent duplicate concurrent fetches (race between getSession + onAuthStateChange)
        if (fetchInFlightRef.current) return;
        fetchInFlightRef.current = true;
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
                setTrialEndsAt(null);
                setSubscriptionTier(null);
                setDashboardModeState(null);
                setGymName(null);
                setGymLogoUrl(null);
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
            setTrialEndsAt(null);
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
            // Single combined query — avoids 3 separate round-trips to gyms table
            if ((!isSuperAdmin || activeImpersonation) && (activeImpersonation?.gymId || selectedRole.gym_id)) {
                try {
                    const { data: gymData, error: gymError } = await supabase
                        .from('gyms')
                        .select('status, trial_ends_at, subscription_tier, onboarding_completed, dashboard_mode, name, branding')
                        .eq('id', activeImpersonation?.gymId || selectedRole.gym_id)
                        .maybeSingle();

                    if (gymError) throw gymError;

                    if (!gymData) {
                        // Gym was deleted — clear state gracefully
                        console.warn('[Auth] Gym not found for user role, gym may have been deleted');
                        setGymStatus(null);
                        setOnboardingCompleted(true);
                        setDashboardModeState('advanced');
                    } else {
                        setGymStatus(gymData.status || null);
                        setTrialEndsAt(gymData.trial_ends_at || null);
                        setSubscriptionTier(gymData.subscription_tier || 'BASIC');
                        setOnboardingCompleted(gymData.onboarding_completed !== false);
                        setDashboardModeState(gymData.dashboard_mode || 'advanced');
                        setGymName(gymData.name || null);
                        setGymLogoUrl((gymData.branding as any)?.logo_url || null);
                    }
                } catch (err) {
                    // Graceful fallback if some columns don't exist yet
                    console.error('Failed to fetch gym data:', err);
                    try {
                        const { data: fallbackData } = await supabase
                            .from('gyms')
                            .select('status, trial_ends_at, subscription_tier, name, branding')
                            .eq('id', activeImpersonation?.gymId || selectedRole.gym_id)
                            .maybeSingle();
                        setGymStatus(fallbackData?.status || null);
                        setTrialEndsAt(fallbackData?.trial_ends_at || null);
                        setSubscriptionTier(fallbackData?.subscription_tier || 'BASIC');
                        setGymName(fallbackData?.name || null);
                        setGymLogoUrl((fallbackData?.branding as any)?.logo_url || null);
                    } catch {
                        // Ultimate fallback
                    }
                    setOnboardingCompleted(true);
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
            setTrialEndsAt(null);
            setSubscriptionTier(null);
            setDashboardModeState(null);
            setGymName(null);
            setGymLogoUrl(null);
            setOnboardingCompleted(true);
            setIsImpersonating(false);
            setImpersonatedGymId(null);
            setImpersonatedGymName(null);
        } finally {
            fetchInFlightRef.current = false;
            setLoading(false);
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        }
    }, []);

    const stopImpersonation = useCallback(async () => {
        await endImpersonation();
        setIsImpersonating(false);
        setImpersonatedGymId(null);
        setImpersonatedGymName(null);
        window.location.href = '/super-admin';
    }, []);

    const signOut = useCallback(async () => {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setGymId(null);
        setGymStatus(null);
        setTrialEndsAt(null);
        setSubscriptionTier(null);
        setDashboardModeState(null);
        setGymName(null);
        setGymLogoUrl(null);
        setOnboardingCompleted(true);
        setIsImpersonating(false);
        setImpersonatedGymId(null);
        setImpersonatedGymName(null);
        if (isDemoModeActive()) {
            exitDemoMode();
            return;
        }
        await supabase.auth.signOut();
    }, []);

    const value = useMemo(() => ({ session, user, userRole, gymId, gymStatus, trialEndsAt, subscriptionTier, dashboardMode, gymName, gymLogoUrl, setDashboardMode, onboardingCompleted, setOnboardingCompleted, isImpersonating, impersonatedGymId, impersonatedGymName, stopImpersonation, loading, signOut }), [session, user, userRole, gymId, gymStatus, trialEndsAt, subscriptionTier, dashboardMode, gymName, gymLogoUrl, onboardingCompleted, isImpersonating, impersonatedGymId, impersonatedGymName, loading, setDashboardMode, setOnboardingCompleted, stopImpersonation, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

