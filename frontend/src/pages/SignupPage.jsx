import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

/* ── Animated floating particles ── */
const Particles = () => {
    const particles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 15,
        color: i % 3 === 0 ? 'rgba(16,185,129,0.4)' : i % 3 === 1 ? 'rgba(6,182,212,0.3)' : 'rgba(139,92,246,0.25)',
    }));
    return (
        <div className="auth-particles">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="auth-particle"
                    style={{
                        width: p.size, height: p.size,
                        left: `${p.left}%`,
                        bottom: '-10px',
                        background: p.color,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

/* ── Password strength ── */
const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'দুর্বল', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'মাঝারি', color: '#f59e0b' };
    return { level: 3, label: 'শক্তিশালী', color: '#10b981' };
};

/* ── Google SVG logo ── */
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.76 2.13c1.61-1.48 2.54-3.67 2.54-6.46z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.76-2.13c-.76.51-1.74.83-3.2.83-2.46 0-4.55-1.66-5.3-3.9L1.08 12.5c1.48 2.94 4.5 4.9 8.01 4.9z"/>
        <path fill="#FBBC05" d="M3.7 10.6c-.2-.6-.31-1.24-.31-1.9s.11-1.3.31-1.9L1.08 5.6C.39 6.96 0 8.52 0 10.1c0 1.58.39 3.14 1.08 4.5l2.62-2z"/>
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.42 0 9 0 5.48 0 2.46 1.96 1.08 4.9l2.62 2.02C4.45 5.24 6.54 3.58 9 3.58z"/>
    </svg>
);

/* ── Google account modal ── */
const GoogleModal = ({ onSelect, onClose }) => {
    const accounts = [
        { name: 'New User', email: 'new.user@gmail.com', color: '#ec4899', initial: 'N' },
        { name: 'Dev Tester', email: 'dev.test@gmail.com', color: '#f59e0b', initial: 'D' },
    ];
    return (
        <div className="auth-google-modal-overlay" onClick={onClose}>
            <div className="auth-google-modal" onClick={e => e.stopPropagation()}>
                <div className="auth-google-modal-header">
                    <GoogleLogo />
                    <h3>Google দিয়ে সাইন-আপ করুন</h3>
                </div>
                <p className="auth-google-modal-sub">
                    Mentora অ্যাপে যোগ দিতে একটি Google অ্যাকাউন্ট নির্বাচন করুন
                </p>
                {accounts.map(acc => (
                    <button
                        key={acc.email}
                        className="auth-google-account"
                        onClick={() => onSelect(acc.email, acc.name)}
                        type="button"
                    >
                        <div className="auth-google-account-avatar" style={{ background: acc.color }}>
                            {acc.initial}
                        </div>
                        <div className="auth-google-account-info">
                            <div className="name">{acc.name}</div>
                            <div className="email">{acc.email}</div>
                        </div>
                    </button>
                ))}
                <button className="auth-google-modal-cancel" onClick={onClose} type="button">
                    বাতিল করুন
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   MAIN SIGNUP COMPONENT
═══════════════════════════════════════════ */
const SignupPage = () => {
    const { user, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed]       = useState(false);
    const [error,   setError]       = useState('');
    const [success, setSuccess]     = useState('');
    const [loading, setLoading]     = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);

    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    const strength = getStrength(form.password);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name.trim()) { setError('আপনার নাম দিন'); return; }
        if (form.password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }
        if (form.password !== form.confirm) { setError('পাসওয়ার্ড দুটি মিলছে না'); return; }
        if (!agreed) { setError('শর্তাবলী মেনে নিন'); return; }

        setLoading(true);
        const res = await signup(form.name.trim(), form.email.trim(), form.password, false, false);
        if (res.success) {
            setSuccess('✅ অ্যাকাউন্ট তৈরি হয়েছে! লগইন পেজে যাচ্ছি...');
            setForm({ name: '', email: '', password: '', confirm: '' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(res.error || 'অ্যাকাউন্ট তৈরি করতে পারেনি');
        }
        setLoading(false);
    };

    const handleGoogleSelect = async (selEmail, selName) => {
        setShowGoogleModal(false);
        setError('');
        setLoading(true);
        try {
            const res = await loginWithGoogle(selEmail, selName);
            if (res.success) navigate('/dashboard');
            else setError(res.error || 'Google সাইনআপ ব্যর্থ হয়েছে');
        } catch {
            setError('Google সার্ভারে সংযোগ সমস্যা।');
        } finally {
            setLoading(false);
        }
    };

    const pwdBarClass = (bar) => {
        if (strength.level === 0) return 'auth-pwd-strength-bar';
        if (bar === 1) return 'auth-pwd-strength-bar active-weak';
        if (bar === 2 && strength.level >= 2) return 'auth-pwd-strength-bar active-medium';
        if (bar === 3 && strength.level >= 3) return 'auth-pwd-strength-bar active-strong';
        if (bar <= strength.level && strength.level === 1) return 'auth-pwd-strength-bar active-weak';
        if (bar <= strength.level && strength.level === 2) return 'auth-pwd-strength-bar active-medium';
        if (bar <= strength.level && strength.level === 3) return 'auth-pwd-strength-bar active-strong';
        return 'auth-pwd-strength-bar';
    };

    return (
        <div className="auth-page">
            {showGoogleModal && (
                <GoogleModal
                    onSelect={handleGoogleSelect}
                    onClose={() => setShowGoogleModal(false)}
                />
            )}

            {/* ── LEFT BRAND PANEL ── */}
            <div className="auth-brand-panel">
                <Particles />
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <div className="auth-brand-logo-icon">🧠</div>
                        <div className="auth-brand-logo-text">
                            <h2>মেন্টাল সাথী</h2>
                            <p>by Mentora</p>
                        </div>
                    </div>

                    <h1 className="auth-brand-headline">
                        আজই শুরু করুন<br />
                        <span>বিনামূল্যে!</span>
                    </h1>

                    <p className="auth-brand-sub">
                        হাজারো বাংলাদেশী যুক্ত হয়েছেন। আপনার মানসিক স্বাস্থ্যের যাত্রা
                        শুরু করুন আজই — কোনো ক্রেডিট কার্ড লাগবে না।
                    </p>

                    <div className="auth-features">
                        {[
                            { icon: '🆓', title: 'বিনামূল্যে শুরু', desc: 'ফ্রি প্ল্যানে সব মূল ফিচার ব্যবহার করুন' },
                            { icon: '⚡', title: 'মাত্র ৩০ সেকেন্ড', desc: 'দ্রুত রেজিস্ট্রেশন, কোনো ঝামেলা নেই' },
                            { icon: '🛡️', title: 'সম্পূর্ণ গোপনীয়', desc: 'আপনার ডেটা কখনো শেয়ার হবে না' },
                            { icon: '📱', title: 'মোবাইল ফ্রেন্ডলি', desc: 'Android ও iOS উভয়ে PWA হিসেবে ব্যবহার' },
                        ].map((f, i) => (
                            <div key={i} className="auth-feature-item">
                                <div className="auth-feature-icon">{f.icon}</div>
                                <div className="auth-feature-text">
                                    <h4>{f.title}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="auth-trust-badge">
                    ⭐⭐⭐⭐⭐ &nbsp;৪.৯/৫ রেটিং &nbsp;•&nbsp; ৫০,০০০+ ব্যবহারকারী
                </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="auth-form-panel">
                <div className="auth-form-inner">

                    {/* Mobile logo */}
                    <div className="auth-mobile-logo">
                        <span className="logo-icon">🧠</span>
                        <h2>মেন্টাল সাথী</h2>
                        <p>আপনার মানসিক স্বাস্থ্যের সঙ্গী</p>
                    </div>

                    <h2 className="auth-form-title">অ্যাকাউন্ট তৈরি করুন</h2>
                    <p className="auth-form-subtitle">বিনামূল্যে যোগ দিন, আজই শুরু করুন</p>

                    {/* Alerts */}
                    {error && (
                        <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                            <span className="auth-alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
                            <span className="auth-alert-icon">✅</span>
                            <span>{success}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {/* Name */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="signup-name">আপনার নাম</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">👤</span>
                                <input
                                    id="signup-name"
                                    name="name"
                                    className="auth-input"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="আপনার পুরো নাম"
                                    autoComplete="name"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="signup-email">ইমেইল ঠিকানা</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">✉️</span>
                                <input
                                    id="signup-email"
                                    name="email"
                                    className="auth-input"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="signup-password">পাসওয়ার্ড</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">🔑</span>
                                <input
                                    id="signup-password"
                                    name="password"
                                    className="auth-input"
                                    type={showPwd ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="কমপক্ষে ৬ অক্ষর"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                                <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {form.password && (
                                <>
                                    <div className="auth-pwd-strength">
                                        {[1, 2, 3].map(bar => (
                                            <div key={bar} className={pwdBarClass(bar)} />
                                        ))}
                                    </div>
                                    <span className="auth-pwd-strength-label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="signup-confirm">পাসওয়ার্ড নিশ্চিত করুন</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon">
                                    {form.confirm && form.confirm === form.password ? '✅' : '🔑'}
                                </span>
                                <input
                                    id="signup-confirm"
                                    name="confirm"
                                    className="auth-input"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirm}
                                    onChange={handleChange}
                                    placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                    style={{
                                        borderColor: form.confirm
                                            ? form.confirm === form.password
                                                ? 'rgba(16,185,129,0.5)'
                                                : 'rgba(239,68,68,0.4)'
                                            : undefined
                                    }}
                                />
                                <button type="button" className="auth-pwd-toggle" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}>
                                    {showConfirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="auth-terms">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                            <span>
                                আমি{' '}
                                <a href="#terms" onClick={e => e.preventDefault()}>শর্তাবলী</a>
                                {' '}ও{' '}
                                <a href="#privacy" onClick={e => e.preventDefault()}>গোপনীয়তা নীতি</a>
                                {' '}মেনে নিচ্ছি
                            </span>
                        </label>

                        <button className="auth-submit-btn" type="submit" disabled={loading || !agreed}>
                            {loading
                                ? <><span className="auth-spinner" />একাউন্ট তৈরি হচ্ছে...</>
                                : '🎉 বিনামূল্যে শুরু করুন'
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">অথবা</div>

                    {/* Google button */}
                    <button
                        className="auth-google-btn"
                        type="button"
                        onClick={() => setShowGoogleModal(true)}
                        disabled={loading}
                    >
                        <GoogleLogo />
                        Google অ্যাকাউন্ট দিয়ে সাইন-আপ করুন
                    </button>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>
                            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                            <Link to="/login">লগইন করুন</Link>
                        </p>
                        <Link to="/" className="auth-back-home">← হোম পেজে ফিরুন</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
