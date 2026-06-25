import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
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
    if (!pwd) return { level: 0, label: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'দুর্বল' };
    if (score <= 2) return { level: 2, label: 'মাঝারি' };
    return { level: 3, label: 'শক্তিশালী' };
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
        { name: 'Sakib Hasan', email: 'sakib@gmail.com', color: '#10b981', initial: 'S' },
        { name: 'Demo User', email: 'demo.user@gmail.com', color: '#3b82f6', initial: 'D' },
    ];
    return (
        <div className="auth-google-modal-overlay" onClick={onClose}>
            <div className="auth-google-modal" onClick={e => e.stopPropagation()}>
                <div className="auth-google-modal-header">
                    <GoogleLogo />
                    <h3>Google দিয়ে সাইন-ইন করুন</h3>
                </div>
                <p className="auth-google-modal-sub">
                    Mentora অ্যাপ ব্যবহার করতে একটি Google অ্যাকাউন্ট নির্বাচন করুন
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
   MAIN LOGIN COMPONENT
═══════════════════════════════════════════ */
const LoginPage = () => {
    const { user, login, loginWithOTP, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [method, setMethod] = useState('email'); // 'email' | 'otp'
    const [email, setEmail]   = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd]   = useState(false);
    const [phone, setPhone]   = useState('');
    const [otp, setOtp]       = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [debugOtp, setDebugOtp] = useState('');

    const [error,   setError]   = useState('');
    const [info,    setInfo]    = useState('');
    const [loading, setLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);

    // Redirect if already logged in
    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    const clearMessages = () => { setError(''); setInfo(''); };

    const switchMethod = (m) => {
        setMethod(m);
        clearMessages();
        setOtpSent(false);
        setOtp('');
        setPhone('');
        setEmail('');
        setPassword('');
    };

    /* ── Email login ── */
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!email.trim() || !password.trim()) {
            setError('ইমেইল এবং পাসওয়ার্ড দিন');
            return;
        }
        setLoading(true);
        try {
            const res = await login(email.trim(), password);
            if (res.success) navigate('/dashboard');
            else setError(res.error || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে');
        } catch {
            setError('সার্ভারে সংযোগ করতে পারেনি। আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    /* ── Send OTP ── */
    const handleSendOTP = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!phone.trim()) { setError('মোবাইল নম্বর দিন'); return; }
        setLoading(true);
        try {
            const data = await api.post('/auth/otp/send', { phone });
            if (data.success) {
                setOtpSent(true);
                setDebugOtp(data.debug_otp || '');
                setInfo(`ওটিপি পাঠানো হয়েছে।${data.debug_otp ? ` (টেস্ট ওটিপি: ${data.debug_otp})` : ''}`);
            } else {
                setError(data.message || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে');
            }
        } catch {
            setError('ওটিপি পাঠাতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    /* ── Verify OTP ── */
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!otp.trim()) { setError('ওটিপি কোড টাইপ করুন'); return; }
        setLoading(true);
        try {
            const res = await loginWithOTP(phone, otp);
            if (res.success) navigate('/dashboard');
            else setError(res.error || 'ভুল ওটিপি। আবার চেষ্টা করুন।');
        } catch {
            setError('সার্ভার সংযোগ সমস্যা।');
        } finally {
            setLoading(false);
        }
    };

    /* ── Google select ── */
    const handleGoogleSelect = async (selEmail, selName) => {
        setShowGoogleModal(false);
        clearMessages();
        setLoading(true);
        try {
            const res = await loginWithGoogle(selEmail, selName);
            if (res.success) navigate('/dashboard');
            else setError(res.error || 'Google লগইন ব্যর্থ হয়েছে');
        } catch {
            setError('Google সার্ভারে সংযোগ সমস্যা।');
        } finally {
            setLoading(false);
        }
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
                        মানসিক সুস্থতার<br />
                        <span>ডিজিটাল সঙ্গী</span>
                    </h1>

                    <p className="auth-brand-sub">
                        AI-চালিত মানসিক স্বাস্থ্য সহায়তা — যেকোনো সময়, যেকোনো জায়গায়।
                        আপনার মনের যত্ন নেওয়ার সবচেয়ে সহজ উপায়।
                    </p>

                    <div className="auth-features">
                        {[
                            { icon: '🧠', title: 'AI মানসিক বিশ্লেষণ', desc: 'বিজ্ঞানভিত্তিক মূল্যায়ন ও পরামর্শ' },
                            { icon: '💬', title: '২৪/৭ সাপোর্ট চ্যাট', desc: 'Groq AI দিয়ে যেকোনো সময় সাহায্য' },
                            { icon: '📊', title: 'প্রগ্রেস ট্র্যাকিং', desc: 'আপনার উন্নতি পর্যবেক্ষণ করুন' },
                            { icon: '🔒', title: 'সম্পূর্ণ গোপনীয়', desc: 'আপনার ডেটা সুরক্ষিত ও এনক্রিপ্টেড' },
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
                    🔐 SSL এনক্রিপ্টেড &nbsp;•&nbsp; GDPR কমপ্লায়েন্ট &nbsp;•&nbsp; ৫০,০০০+ ব্যবহারকারী
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

                    <h2 className="auth-form-title">আবার স্বাগতম 👋</h2>
                    <p className="auth-form-subtitle">আপনার অ্যাকাউন্টে লগইন করুন</p>

                    {/* Method tabs */}
                    <div className="auth-method-tabs">
                        <button
                            className={`auth-method-tab ${method === 'email' ? 'active' : ''}`}
                            onClick={() => switchMethod('email')}
                            disabled={loading}
                            type="button"
                        >
                            📧 ইমেইল
                        </button>
                        <button
                            className={`auth-method-tab ${method === 'otp' ? 'active' : ''}`}
                            onClick={() => switchMethod('otp')}
                            disabled={loading}
                            type="button"
                        >
                            📱 মোবাইল OTP
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                            <span className="auth-alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}
                    {info && (
                        <div className="auth-alert info" style={{ marginBottom: '1rem' }}>
                            <span className="auth-alert-icon">ℹ️</span>
                            <span>{info}</span>
                        </div>
                    )}

                    {/* ── EMAIL FORM ── */}
                    {method === 'email' && (
                        <form className="auth-form" onSubmit={handleEmailLogin} noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-email">ইমেইল ঠিকানা</label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">✉️</span>
                                    <input
                                        id="login-email"
                                        className="auth-input"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                        autoComplete="email"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-password">পাসওয়ার্ড</label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">🔑</span>
                                    <input
                                        id="login-password"
                                        className="auth-input"
                                        type={showPwd ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-pwd-toggle"
                                        onClick={() => setShowPwd(s => !s)}
                                        tabIndex={-1}
                                        aria-label="Toggle password"
                                    >
                                        {showPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button className="auth-submit-btn" type="submit" disabled={loading}>
                                {loading ? <><span className="auth-spinner" />লগইন হচ্ছে...</> : '🔐 লগইন করুন'}
                            </button>
                        </form>
                    )}

                    {/* ── OTP FORM ── */}
                    {method === 'otp' && (
                        <form
                            className="auth-form"
                            onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
                            noValidate
                        >
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-phone">মোবাইল নম্বর</label>
                                <div className="auth-input-wrap">
                                    <span className="auth-input-icon">📱</span>
                                    <input
                                        id="login-phone"
                                        className="auth-input"
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="017XXXXXXXX"
                                        disabled={loading || otpSent}
                                        required
                                    />
                                </div>
                                {!otpSent && (
                                    <span className="auth-otp-help">
                                        নম্বর দিলে একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হবে।
                                    </span>
                                )}
                            </div>

                            {otpSent && (
                                <div className="auth-field">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="auth-label" htmlFor="login-otp">ওটিপি কোড</label>
                                        <button
                                            type="button"
                                            className="auth-otp-resend"
                                            onClick={() => { setOtpSent(false); setOtp(''); clearMessages(); }}
                                        >
                                            ✏️ নম্বর পরিবর্তন
                                        </button>
                                    </div>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon">🔢</span>
                                        <input
                                            id="login-otp"
                                            className="auth-input"
                                            type="text"
                                            inputMode="numeric"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="৬-সংখ্যার কোড"
                                            maxLength={6}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <button className="auth-submit-btn" type="submit" disabled={loading}>
                                {loading
                                    ? <><span className="auth-spinner" />প্রক্রিয়া হচ্ছে...</>
                                    : otpSent ? '✅ ওটিপি ভেরিফাই করুন' : '🚀 ওটিপি পাঠান'
                                }
                            </button>
                        </form>
                    )}

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
                        Google অ্যাকাউন্ট দিয়ে লগইন
                    </button>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>
                            অ্যাকাউন্ট নেই?{' '}
                            <Link to="/signup">বিনামূল্যে রেজিস্টার করুন</Link>
                        </p>
                        <Link to="/" className="auth-back-home">← হোম পেজে ফিরুন</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;