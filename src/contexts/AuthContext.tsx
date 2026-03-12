import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: string | null;
    gymId: string | null;
    gymStatus: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    userRole: null,
    gymId: null,
    gymStatus: null,
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get active session
        supabase.auth.getSession().then(({ data: { session } }) => {
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
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id, session.user.email || null);
            } else {
                setUserRole(null);
                setGymId(null);
                setGymStatus(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId: string, userEmail: string | null) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, gym_id, display_name')
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user role:', error);
            }

            if (data) {
                setUserRole(data.role);
                setGymId(data.gym_id);

                // Auto-populate display_name if missing
                if (!data.display_name && userEmail) {
                    supabase.from('user_roles')
                        .update({ display_name: userEmail })
                        .eq('user_id', userId)
                        .eq('gym_id', data.gym_id)
                        .then(() => { });
                }

                // Fetch gym status for lock detection (skip for super admins)
                if (data.role !== 'SUPER_ADMIN' && data.gym_id) {
                    const { data: gymData } = await supabase
                        .from('gyms')
                        .select('status')
                        .eq('id', data.gym_id)
                        .maybeSingle();
                    setGymStatus(gymData?.status || null);
                }
            }
        } catch (err) {
            console.error('Unexpected error fetching user role', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, userRole, gymId, gymStatus, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
