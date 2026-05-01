import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, APP_SUITE_NAME } from '../lib/branding';
import { BrandLogo } from '../components/BrandLogo';


const Login: React.FC = () => {
    const { user, userRole, gymStatus, loading: authLoading, onboardingCompleted } = useAuth();
    const [searchParams] = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
    const selectedPlan = searchParams.get('plan');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gymName, setGymName] = useState('');
    const [gymAddress, setGymAddress] = useState('');
    const [memberCapacity, setMemberCapacity] = useState('0-100');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // While auth is actively loading/fetching, clear any stale error to avoid flicker
        if (authLoading) {
            setError(null);
            return;
        }

        if (user) {
            if (userRole && !['LOCKED', 'SUSPENDED', 'PAST_DUE', 'EXPIRED', 'DELETED'].includes(gymStatus || '')) {
                if (userRole === 'SUPER_ADMIN') {
                    navigate('/super-admin');
                } else {
                    navigate(onboardingCompleted ? '/admin' : '/setup');
                }
            } else if (!userRole) {
                setError('Account found, but role permissions are missing. Please contact support.');
                setLoading(false);
            } else if (['LOCKED', 'SUSPENDED', 'PAST_DUE', 'EXPIRED', 'DELETED'].includes(gymStatus || '')) {
                setError(`Your account is currently ${gymStatus}. Please contact support.`);
                setLoading(false);
            }
        } else {
            // Ensure local loading state resets if we're not authenticated after loading completes
            setLoading(false);
        }
    }, [user, userRole, gymStatus, authLoading, navigate, onboardingCompleted]);

    useEffect(() => {
        document.title = isSignUp ? 'Start Free Trial | LiftLegend Gym Software Bangladesh' : 'Sign In | LiftLegend Gym Software';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', isSignUp ? 'Start your 30-day free trial of LiftLegend, the most reliable gym management software for Bangladesh. Get started in 2 minutes.' : 'Sign in to access your LiftLegend gym management dashboard.');
    }, [isSignUp]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="size-10 border-4 border-[#1978e5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isSignUp) {
                if (password.length < 6) {
                    setError('Password must be at least 6 characters.');
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }
                if (!gymName.trim()) {
                    setError('Gym Name is required.');
                    setLoading(false);
                    return;
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: {
                            gym_name: gymName.trim(),
                            address: gymAddress.trim(),
                            capacity: memberCapacity,
                            selected_plan_tier: selectedPlan || 'ADVANCED',
                        },
                    },
                });

                if (signUpError) {
                    setError(signUpError.message || 'Unable to create your account right now.');
                    setLoading(false);
                    return;
                }

                setSuccessMessage('Account created! Check your email to confirm, then sign in.');
                setIsSignUp(false);
                setLoading(false);
                return;
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (signInError) {
                let userMsg = signInError.message;
                if (signInError.message === 'Invalid login credentials') {
                    userMsg = 'Invalid email or password.';
                } else if (signInError.message.toLowerCase().includes('confirm') || signInError.message.toLowerCase().includes('verified')) {
                    userMsg = 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
                }
                setError(userMsg);
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Unable to sign in right now. Please try again.');
                setLoading(false);
                return;
            }

            // Authentication successful. AuthContext will update states and useEffect will redirect.
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#0a0f16] flex items-center justify-center p-4 relative overflow-hidden font-display selection:bg-primary-default/20 selection:text-primary-default">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-md w-full bg-white/80 dark:bg-[#111821]/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 dark:border-slate-800/50 overflow-hidden relative z-10">
                {/* Subtle gradient border effect at the top */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-primary-default to-emerald-500"></div>
                
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col items-center justify-center mb-10">
                        <div className="mb-6">
                            <BrandLogo className="h-16 sm:h-20 w-auto object-contain mx-auto" variant="auto" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                            {isSignUp ? 'Create an Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center">
                            {isSignUp ? 'Start your 30-day free trial. Setup in 2 minutes.' : `Sign in to ${APP_NAME} Dashboard`}
                        </p>
                        {isSignUp && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
                                {selectedPlan ? `Selected plan: ${selectedPlan}` : "You'll start on Advanced Plan (Trial)"}
                            </div>
                        )}
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
                                        autoComplete="organization"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="LiftZone Fitness"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="login-gym-address" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Location (Optional)</label>
                                    <input
                                        id="login-gym-address"
                                        type="text"
                                        value={gymAddress}
                                        onChange={(e) => setGymAddress(e.target.value)}
                                        autoComplete="street-address"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="Banani, Dhaka"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="login-gym-capacity" className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Member Count</label>
                                    <select
                                        id="login-gym-capacity"
                                        value={memberCapacity}
                                        onChange={(e) => setMemberCapacity(e.target.value)}
                                        autoComplete="off"
                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
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
                                    autoComplete="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
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
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="********"
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

                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="login-confirm-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                    <input
                                        id="login-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                                        placeholder="********"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

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
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-primary-default hover:from-blue-700 hover:to-blue-600 text-white font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-xl shadow-primary-default/25 flex items-center justify-center disabled:opacity-70 active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                        
                        {isSignUp && (
                            <div className="mt-4 flex flex-col items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        No credit card required
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Cancel anytime
                                    </span>
                                </div>
                            </div>
                        )}
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
                        {APP_SUITE_NAME} (c) 2026
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
