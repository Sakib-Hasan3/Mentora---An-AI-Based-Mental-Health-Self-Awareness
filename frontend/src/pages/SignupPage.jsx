import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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

const getStrength = pwd => {
    if (!pwd) return { level: 0, label: '' };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    if (s <= 1) return { level: 1, label: 'দুর্বল 🔴' };
    if (s <= 2) return { level: 2, label: 'মাঝারি 🟡' };
    return { level: 3, label: 'শক্তিশালী 🟢' };
};

/* ── Google Modal ── */
const GoogleModal = ({ onSelect, onClose }) => {
    const accounts = [
        { name: 'Sakib Hasan', email: 'sakib@gmail.com', color: '#10b981', initial: 'S' },
        { name: 'Demo User',   email: 'demo.user@gmail.com', color: '#3b82f6', initial: 'D' },
    ];
    return (
        <div className="auth-google-modal-overlay" onClick={onClose}>
            <div className="auth-google-modal" onClick={e => e.stopPropagation()}>
                <div className="auth-google-modal-header"><GoogleLogo /><h3>Google দিয়ে সাইন-আপ করুন</h3></div>
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
                আজই শুরু করুন<br/>
                আপনার <span>সুস্থতার যাত্রা</span>
            </h1>
            <p className="auth-brand-sub">
                বিনামূল্যে রেজিস্ট্রেশন করুন এবং AI-চালিত মানসিক স্বাস্থ্য সেবা উপভোগ করুন।
            </p>
            <ul className="auth-brand-features">
                <li>বিনামূল্যে ৪ প্রশ্নের দ্রুত পরীক্ষা</li>
                <li>২৪/৭ AI সাপোর্ট চ্যাট</li>
                <li>কমিউনিটি গ্রুপে যোগ দিন</li>
                <li>বিশেষজ্ঞ কনসালট্যান্ট বুকিং</li>
                <li>ওয়েলনেস হাব অ্যাক্সেস</li>
            </ul>
            <div className="auth-brand-badges">
                <div className="auth-brand-badge">🆓 বিনামূল্যে শুরু</div>
                <div className="auth-brand-badge">🔒 সুরক্ষিত</div>
                <div className="auth-brand-badge">🤖 AI Powered</div>
            </div>
        </div>
    </div>
);

/* ── OTP Input Boxes ── */
const OTPInput = ({ value, onChange, onComplete }) => {
    const refs = Array.from({ length: 6 }, () => useRef(null));

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            const arr = value.split('');
            arr[i] = '';
            onChange(arr.join(''));
            if (i > 0 && !value[i]) refs[i-1].current?.focus();
        }
    };

    const handleChange = (i, e) => {
        const ch = e.target.value.replace(/\D/g, '').slice(-1);
        const arr = (value || '      ').split('').slice(0, 6);
        arr[i] = ch;
        const next = arr.join('');
        onChange(next);
        if (ch && i < 5) refs[i+1].current?.focus();
        if (next.replace(/\s/g,'').length === 6) onComplete?.(next);
    };

    const handlePaste = e => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
        if (pasted) { onChange(pasted.padEnd(6,' ')); refs[Math.min(pasted.length,5)].current?.focus(); }
        e.preventDefault();
    };

    return (
        <div className="auth-otp-boxes">
            {Array.from({ length: 6 }, (_, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    className={`auth-otp-box ${value[i] && value[i] !== ' ' ? 'filled' : ''}`}
                    value={value[i] && value[i] !== ' ' ? value[i] : ''}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                />
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   SIGNUP PAGE
   ══════════════════════════════════════════════════════════════ */
const SignupPage = () => {
    const { signup, user } = useAuth();
    const navigate = useNavigate();

    // Step 1 = form, 2 = OTP verify
    const [step, setStep]           = useState(1);
    const [name, setName]           = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [confirm, setConfirm]     = useState('');
    const [showPwd, setShowPwd]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const [showGoogle, setShowGoogle] = useState(false);

    // OTP state
    const [otpValue, setOtpValue]   = useState('      ');
    const [timer, setTimer]         = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    const [debugOtp, setDebugOtp]   = useState('');

    const strength = getStrength(password);

    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    // Countdown timer
    useEffect(() => {
        if (!timerActive) return;
        if (timer <= 0) { setTimerActive(false); return; }
        const t = setTimeout(() => setTimer(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [timer, timerActive]);

    // ── Step 1: Signup + send OTP ──────────────────────────────
    const handleSignup = async e => {
        e.preventDefault();
        if (!name || !email || !password || !confirm) { setError('সব তথ্য পূরণ করুন'); return; }
        if (password !== confirm) { setError('পাসওয়ার্ড দুটি মিলছে না'); return; }
        if (password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }
        setLoading(true); setError('');

        // 1. Create account
        const res = await signup(name, email, password);
        if (!res.success) { setLoading(false); setError(res.error || 'একাউন্ট তৈরি ব্যর্থ হয়েছে'); return; }

        // 2. Send email OTP
        await sendOTP();
        setLoading(false);
    };

    const sendOTP = async () => {
        try {
            const base = `${window.location.protocol}//${window.location.hostname}:8000/api`;
            const res = await fetch(`${base}/auth/otp/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.debug_otp) setDebugOtp(data.debug_otp); // dev helper
            setStep(2);
            setTimer(60);
            setTimerActive(true);
            setOtpValue('      ');
        } catch {
            // If OTP fails, still proceed to dashboard (signup was successful)
            navigate('/dashboard');
        }
    };

    const handleResend = async () => {
        setError(''); setOtpValue('      ');
        await sendOTP();
    };

    // ── Step 2: Verify OTP ─────────────────────────────────────
    const handleVerify = async (otp) => {
        const code = (otp || otpValue).replace(/\s/g, '');
        if (code.length !== 6) { setError('৬ সংখ্যার OTP দিন'); return; }
        setLoading(true); setError('');
        try {
            const base = `${window.location.protocol}//${window.location.hostname}:8000/api`;
            const res = await fetch(`${base}/auth/otp/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSuccess('✅ ইমেইল যাচাই সম্পন্ন!');
                setTimeout(() => navigate('/dashboard'), 800);
            } else {
                setError(data.detail || 'OTP যাচাই ব্যর্থ হয়েছে');
            }
        } catch { setError('সার্ভারে সংযোগ করা যায়নি'); }
        setLoading(false);
    };

    // Google signup
    const handleGoogle = async (gEmail, gName) => {
        setShowGoogle(false); setLoading(true);
        try {
            const base = `${window.location.protocol}//${window.location.hostname}:8000/api`;
            const res = await fetch(`${base}/auth/google`, {
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
        } catch { setError('Google সাইনআপ ব্যর্থ হয়েছে'); }
        setLoading(false);
    };

    return (
        <div className="auth-root">
            <BrandPanel />
            {showGoogle && <GoogleModal onSelect={handleGoogle} onClose={() => setShowGoogle(false)} />}

            <div className="auth-form-panel">
                <div className="auth-card">

                    {/* ── STEP 2: OTP VERIFY ── */}
                    {step === 2 ? (
                        <>
                            <div className="auth-otp-header">
                                <div className="auth-otp-icon">📧</div>
                                <h2 className="auth-otp-title">ইমেইল যাচাই করুন</h2>
                                <p className="auth-otp-sub">
                                    <span className="auth-otp-email">{email}</span> এ একটি ৬ সংখ্যার OTP পাঠানো হয়েছে।
                                    (Dev mode: backend terminal দেখুন)
                                </p>
                                {debugOtp && (
                                    <div className="auth-alert success" style={{ marginTop: '0.75rem', justifyContent: 'center', fontSize: '0.9rem' }}>
                                        🔑 Dev OTP: <strong style={{ letterSpacing: '4px', marginLeft: '6px' }}>{debugOtp}</strong>
                                    </div>
                                )}
                            </div>

                            {error   && <div className="auth-alert error">⚠️ {error}</div>}
                            {success && <div className="auth-alert success">{success}</div>}

                            <OTPInput
                                value={otpValue}
                                onChange={setOtpValue}
                                onComplete={handleVerify}
                            />

                            <button
                                className="auth-submit"
                                onClick={() => handleVerify(otpValue)}
                                disabled={loading || otpValue.replace(/\s/g,'').length !== 6}
                            >
                                {loading ? '⏳ যাচাই হচ্ছে...' : '✅ ইমেইল যাচাই করুন'}
                            </button>

                            <div className="auth-otp-resend">
                                {timerActive
                                    ? <span>{timer}s পরে আবার পাঠান</span>
                                    : <><span>OTP পাননি? </span><button onClick={handleResend}>পুনরায় পাঠান</button></>
                                }
                            </div>

                            <button className="auth-otp-back" onClick={() => { setStep(1); setError(''); }}>
                                ← পিছনে যান
                            </button>
                        </>
                    ) : (
                        /* ── STEP 1: SIGNUP FORM ── */
                        <>
                            <h2 className="auth-card-title">একাউন্ট তৈরি করুন 🎉</h2>
                            <p className="auth-card-sub">বিনামূল্যে Mentora-তে যোগ দিন এবং আপনার মানসিক স্বাস্থ্যের যত্ন নিন</p>

                            <div className="auth-tabs">
                                <button className="auth-tab-btn" onClick={() => navigate('/login')}>লগইন</button>
                                <button className="auth-tab-btn active">নতুন একাউন্ট</button>
                            </div>

                            {error && <div className="auth-alert error">⚠️ {error}</div>}

                            <form onSubmit={handleSignup}>
                                <div className="auth-field">
                                    <label className="auth-field-label">পূর্ণ নাম</label>
                                    <span className="auth-field-icon">👤</span>
                                    <input id="signup-name" type="text" className="auth-input"
                                        placeholder="আপনার নাম লিখুন" value={name}
                                        onChange={e => setName(e.target.value)} autoComplete="name" />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-field-label">ইমেইল ঠিকানা</label>
                                    <span className="auth-field-icon">📧</span>
                                    <input id="signup-email" type="email" className="auth-input"
                                        placeholder="your@email.com" value={email}
                                        onChange={e => setEmail(e.target.value)} autoComplete="email" />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-field-label">পাসওয়ার্ড</label>
                                    <span className="auth-field-icon">🔑</span>
                                    <input id="signup-password" type={showPwd ? 'text' : 'password'}
                                        className="auth-input" placeholder="কমপক্ষে ৬ অক্ষর"
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        autoComplete="new-password" />
                                    <button type="button" className="auth-show-btn" onClick={() => setShowPwd(p => !p)}>
                                        {showPwd ? '🙈' : '👁️'}
                                    </button>
                                    {password && (
                                        <div className="auth-pwd-strength">
                                            <div className="auth-pwd-bars">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className={`auth-pwd-bar ${strength.level >= i ? `filled-${strength.level}` : ''}`} />
                                                ))}
                                            </div>
                                            <div className="auth-pwd-label">{strength.label}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="auth-field">
                                    <label className="auth-field-label">পাসওয়ার্ড নিশ্চিত করুন</label>
                                    <span className="auth-field-icon">🔒</span>
                                    <input id="signup-confirm" type={showConfirm ? 'text' : 'password'}
                                        className={`auth-input ${confirm && confirm !== password ? 'error' : ''}`}
                                        placeholder="পাসওয়ার্ড আবার দিন"
                                        value={confirm} onChange={e => setConfirm(e.target.value)}
                                        autoComplete="new-password" />
                                    <button type="button" className="auth-show-btn" onClick={() => setShowConfirm(p => !p)}>
                                        {showConfirm ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                <button type="submit" className="auth-submit" disabled={loading}>
                                    {loading ? '⏳ একাউন্ট তৈরি হচ্ছে...' : '🎉 একাউন্ট তৈরি করুন'}
                                </button>
                            </form>

                            <div className="auth-divider">অথবা</div>

                            <button className="auth-google-btn" onClick={() => setShowGoogle(true)}>
                                <GoogleLogo /> Google দিয়ে সাইন-আপ করুন
                            </button>

                            <div className="auth-link-row">
                                ইতিমধ্যে একাউন্ট আছে? <Link to="/login">লগইন করুন →</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
