import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-default flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-light rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="size-12 bg-primary-default/10 text-primary-default rounded-xl flex items-center justify-center mb-4">
                            <Mail className="size-6" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-neutral-text">
                            Reset Password
                        </h2>
                        <p className="text-neutral-text/60 text-sm mt-1 text-center">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="size-8" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-text">Check your email</h3>
                            <p className="text-neutral-text/60 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-primary-default hover:text-primary-dark font-semibold text-sm transition-colors"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-100/50 text-red-600 rounded-lg text-sm font-medium border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-text">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-text/40" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-default border border-neutral-dark rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                        placeholder="admin@gym.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary-default hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-default/20 flex items-center justify-center disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-primary-default hover:text-primary-dark font-semibold text-sm transition-colors"
                                >
                                    <ArrowLeft className="size-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-neutral-text/60">
                        LiftLegend OS © 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
