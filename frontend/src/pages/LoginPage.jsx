import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/login.css';

/* ── Google SVG ── */
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.76 2.13c1.61-1.48 2.54-3.67 2.54-6.46z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.76-2.13c-.76.51-1.74.83-3.2.83-2.46 0-4.55-1.66-5.3-3.9L1.08 12.5c1.48 2.94 4.5 4.9 8.01 4.9z"/>
        <path fill="#FBBC05" d="M3.7 10.6c-.2-.6-.31-1.24-.31-1.9s.11-1.3.31-1.9L1.08 5.6C.39 6.96 0 8.52 0 10.1c0 1.58.39 3.14 1.08 4.5l2.62-2z"/>
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.42 0 9 0 5.48 0 2.46 1.96 1.08 4.9l2.62 2.02C4.45 5.24 6.54 3.58 9 3.58z"/>
    </svg>
);

/* ── Password strength ── */
const getStrength = pwd => {
    if (!pwd) return { level: 0, label: '' };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    if (s <= 1) return { level: 1, label: 'দুর্বল' };
    if (s <= 2) return { level: 2, label: 'মাঝারি' };
    return { level: 3, label: 'শক্তিশালী' };
};

/* ── Google account picker modal ── */
const GoogleModal = ({ onSelect, onClose }) => {
    const accounts = [
        { name: 'Sakib Hasan',  email: 'sakibnghs123@gmail.com',      color: '#10b981', initial: 'S' },
        { name: 'Sakib',    email: 'Ug2102052@cse.pstu.ac.bd',  color: '#3b82f6', initial: 'D' },
    ];
    return (
        <div className="auth-google-modal-overlay" onClick={onClose}>
            <div className="auth-google-modal" onClick={e => e.stopPropagation()}>
                <div className="auth-google-modal-header">
                    <GoogleLogo />
                    <h3>Google দিয়ে সাইন-ইন করুন</h3>
                </div>
                <p className="auth-google-modal-sub">Mentora অ্যাপ ব্যবহার করতে একটি Google অ্যাকাউন্ট নির্বাচন করুন</p>
                {accounts.map(acc => (
                    <button key={acc.email} className="auth-google-account" onClick={() => onSelect(acc.email, acc.name)}>
                        <div className="auth-google-account-avatar" style={{ background: acc.color }}>{acc.initial}</div>
                        <div className="auth-google-account-info">
                            <div className="name">{acc.name}</div>
                            <div className="email">{acc.email}</div>
                        </div>
                    </button>
                ))}
                <button className="auth-google-modal-cancel" onClick={onClose}>বাতিল করুন</button>
            </div>
        </div>
    );
};

/* ── Brand Panel ── */
const BrandPanel = () => (
    <div className="auth-brand">
        <div className="auth-brand-bg" />
        <div className="auth-brand-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        <div className="auth-brand-content">
            <div className="auth-brand-logo">
                <div className="auth-brand-logo-icon">🧠</div>
                <div className="auth-brand-logo-name">Mentora</div>
            </div>

            <h1 className="auth-brand-title">
                আপনার মানসিক<br/>
                স্বাস্থ্যের <span>বিশ্বস্ত সঙ্গী</span>
            </h1>
            <p className="auth-brand-sub">
                AI-চালিত মানসিক স্বাস্থ্য বিশ্লেষণ, বিশেষজ্ঞ কনসালট্যান্ট এবং ২৪/৭ সাপোর্ট — সব এক জায়গায়।
            </p>

            <ul className="auth-brand-features">
                <li>AI-ভিত্তিক মানসিক স্বাস্থ্য পরীক্ষা ও বিশ্লেষণ</li>
                <li>অভিজ্ঞ কনসালট্যান্টদের সাথে অ্যাপয়েন্টমেন্ট</li>
                <li>২৪/৭ RAG চ্যাটবট সাপোর্ট</li>
                <li>কমিউনিটি ও ওয়েলনেস হাব</li>
                <li>বাংলাদেশের প্রথম AI মেন্টাল হেলথ প্ল্যাটফর্ম</li>
            </ul>

            <div className="auth-brand-badges">
                <div className="auth-brand-badge">🔒 SSL এনক্রিপ্টেড</div>
                <div className="auth-brand-badge">🇧🇩 Made in Bangladesh</div>
                <div className="auth-brand-badge">🤖 AI Powered</div>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
   ══════════════════════════════════════════════════════════════ */
const LoginPage = () => {
    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [showPwd, setShowPwd]     = useState(false);
    const [rememberMe, setRemember] = useState(true);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [showGoogle, setShowGoogle] = useState(false);

    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!email || !password) { setError('সব তথ্য পূরণ করুন'); return; }
        setLoading(true); setError('');
        const res = await login(email, password, rememberMe);
        setLoading(false);
        if (res.success) navigate('/dashboard');
        else setError(res.error || 'লগইন ব্যর্থ হয়েছে');
    };

    const handleGoogle = async (gEmail, gName) => {
        setShowGoogle(false); setLoading(true);
        try {
            const res = await fetch(`${window.location.protocol}//${window.location.hostname}:8000/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: gEmail, name: gName }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            }
        } catch { setError('Google লগইন ব্যর্থ হয়েছে'); }
        setLoading(false);
    };

    return (
        <div className="auth-root">
            <BrandPanel />
            {showGoogle && <GoogleModal onSelect={handleGoogle} onClose={() => setShowGoogle(false)} />}

            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2 className="auth-card-title">স্বাগতম 👋</h2>
                    <p className="auth-card-sub">আপনার Mentora অ্যাকাউন্টে লগইন করুন</p>

                    <div className="auth-tabs">
                        <button className="auth-tab-btn active">লগইন</button>
                        <button className="auth-tab-btn" onClick={() => navigate('/signup')}>নতুন একাউন্ট</button>
                    </div>

                    {error && <div className="auth-alert error">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label className="auth-field-label">ইমেইল ঠিকানা</label>
                            <span className="auth-field-icon">📧</span>
                            <input
                                id="login-email" type="email" className="auth-input"
                                placeholder="your@email.com" value={email}
                                onChange={e => setEmail(e.target.value)} autoComplete="email"
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-field-label">পাসওয়ার্ড</label>
                            <span className="auth-field-icon">🔑</span>
                            <input
                                id="login-password" type={showPwd ? 'text' : 'password'}
                                className="auth-input" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button type="button" className="auth-show-btn" onClick={() => setShowPwd(p => !p)}>
                                {showPwd ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <div className="auth-row">
                            <label className="auth-remember">
                                <input type="checkbox" checked={rememberMe} onChange={e => setRemember(e.target.checked)} />
                                মনে রাখুন
                            </label>
                            <a href="#" className="auth-forgot">পাসওয়ার্ড ভুলে গেছেন?</a>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? '⏳ লগইন হচ্ছে...' : '🚀 লগইন করুন'}
                        </button>
                    </form>

                    <div className="auth-divider">অথবা</div>

                    <button className="auth-google-btn" onClick={() => setShowGoogle(true)}>
                        <GoogleLogo /> Google দিয়ে লগইন করুন
                    </button>

                    <div className="auth-link-row">
                        নতুন ব্যবহারকারী? <Link to="/signup">একাউন্ট তৈরি করুন →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;