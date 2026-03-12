import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
    const { user, userRole, gymStatus, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gymName, setGymName] = useState('');
    const [gymAddress, setGymAddress] = useState('');
    const [memberCapacity, setMemberCapacity] = useState('0-100');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    // BUG-02 FIXED: Redirect if authenticated (but NOT if gym is locked)
    useEffect(() => {
        if (!authLoading && user && userRole && gymStatus !== 'LOCKED') {
            if (userRole === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else {
                navigate('/admin');
            }
        }
    }, [user, userRole, gymStatus, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="size-10 border-4 border-[#1978e5] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (isSignUp) {
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                setLoading(false);
                return;
            }
            if (!gymName) {
                setError('Gym Name is required.');
                setLoading(false);
                return;
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        gym_name: gymName,
                        address: gymAddress,
                        capacity: memberCapacity,
                    }
                }
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setSuccessMessage('Account created! Check your email to confirm, then sign in.');
            setIsSignUp(false);
            setLoading(false);
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // Fetch role immediately to redirect correctly
            if (data.user) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', data.user.id)
                    .single();

                if (roleData?.role === 'SUPER_ADMIN') {
                    navigate('/super-admin');
                } else {
                    navigate('/admin');
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="mb-6">
                            <img src="/main-logo.png" alt="LiftLegend Logo" className="h-12 object-contain" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                            {isSignUp ? 'Create an Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {isSignUp ? 'Sign up to LiftLegend Dashboard' : 'Sign in to LiftLegend Dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-100/50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 bg-green-100/50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                                {successMessage}
                            </div>
                        )}

                        {isSignUp && (
                            <>
                                <div className="space-y-2">
                                    <label htmlFor="login-gym-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
                                    <input
                                        id="login-gym-name"
                                        type="text"
                                        required={isSignUp}
                                        value={gymName}
                                        onChange={(e) => setGymName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                        placeholder="Awesome Gym"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="login-gym-address" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Address (Optional)</label>
                                    <input
                                        id="login-gym-address"
                                        type="text"
                                        value={gymAddress}
                                        onChange={(e) => setGymAddress(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                        placeholder="123 Fitness St"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="login-gym-capacity" className="text-sm font-medium text-slate-700 dark:text-slate-300">Approx Member Size</label>
                                    <select
                                        id="login-gym-capacity"
                                        value={memberCapacity}
                                        onChange={(e) => setMemberCapacity(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                    >
                                        <option value="0-100">0 - 100 Members</option>
                                        <option value="100-500">100 - 500 Members</option>
                                        <option value="500+">500+ Members</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                    placeholder="admin@gym.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password — only show on sign-in mode */}
                        {!isSignUp && (
                            <div className="flex justify-end">
                                <Link
                                    to="/reset-password"
                                    className="text-sm text-primary-default hover:text-primary-dark font-semibold transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-default hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-default/20 flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-primary-default hover:text-primary-dark font-semibold text-sm transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        LiftLegend OS © 2026
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
