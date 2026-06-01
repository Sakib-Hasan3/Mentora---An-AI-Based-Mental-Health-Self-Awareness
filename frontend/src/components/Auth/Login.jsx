import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const loginHighlights = [
    'বাংলায় দ্রুত sign in',
    'গোপনীয়তা-প্রথম experience',
    'এক ক্লিকে আপনার journey চালু করুন',
    'মোবাইল-ফার্স্ট, দ্রুত লোড হয়'
];

const loginSupport = [
    'শেষ সেশনের সারাংশ দেখুন',
    'নতুন mood check-in শুরু করুন',
    'দৈনিক habit tracker খুলুন'
];

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const timeoutRef = useRef(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: true
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors((previous) => ({ ...previous, [name]: '' }));
        }
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!formData.email.trim()) {
            nextErrors.email = 'ইমেইল ঠিকানা লিখুন';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            nextErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
        }

        if (!formData.password) {
            nextErrors.password = 'পাসওয়ার্ড লিখুন';
        } else if (formData.password.length < 6) {
            nextErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
        }

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setServerError('');

        try {
            const result = await login(formData.email.trim(), formData.password, formData.rememberMe);

            if (!result.success) {
                throw new Error(result.error || 'সার্ভারে কিছু ত্রুটি হয়েছে');
            }

            setSuccessMessage('স্বাগতম ফিরে এসেছেন। এখন আপনার Mentora dashboard খুলছে।');

            timeoutRef.current = window.setTimeout(() => {
                navigate('/dashboard');
            }, 1100);
        } catch (err) {
            setServerError(String(err.message || err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-glow login-glow-left" />
            <div className="login-glow login-glow-right" />

            <div className="container login-layout">
                <section className="login-showcase reveal">
                    <div className="login-brand-card">
                        <div className="login-brand">
                            <span className="hero-brand-mark">M</span>
                            <div>
                                <h1>Mentora</h1>
                                <p>বাংলাদেশের জন্য AI মানসিক সুস্থতা প্ল্যাটফর্ম</p>
                            </div>
                        </div>

                        <div className="login-top-actions">
                            <Link className="btn btn-secondary login-link-btn" to="/">
                                হোম
                            </Link>
                            <Link className="btn btn-primary login-link-btn" to="/signup">
                                সাইনআপ
                            </Link>
                        </div>
                    </div>

                    <div className="login-copy-card">
                        <span className="section-kicker">স্বাগতম ফিরে</span>
                        <h2>আপনার মানসিক যত্নের journey এখান থেকেই আবার শুরু করুন</h2>
                        <p>
                            আগের check-in, mood trend, আর daily reflection সহজে ফিরে পান। সবকিছু বাংলায়, কম friction-এ, আর calm feel বজায় রেখে।
                        </p>

                        <div className="login-points">
                            {loginHighlights.map((item) => (
                                <div key={item} className="login-chip">
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="login-insight-card">
                            <span className="insight-label">লগইন করলে আপনি পাবেন</span>
                            <ul>
                                {loginSupport.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="login-metrics">
                            <article>
                                <strong>দ্রুত</strong>
                                <span>এক ক্লিকে access</span>
                            </article>
                            <article>
                                <strong>নিরাপদ</strong>
                                <span>privacy-first session</span>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="login-form-card reveal" id="login-form">
                    <div className="login-form-header">
                        <span className="section-kicker">লগইন</span>
                        <h2>আপনার অ্যাকাউন্টে sign in করুন</h2>
                        <p>আপনার ইমেইল ও পাসওয়ার্ড ব্যবহার করে নিরাপদে প্রবেশ করুন।</p>
                    </div>

                    {successMessage && (
                        <div className="login-success" role="status" aria-live="polite">
                            {successMessage}
                        </div>
                    )}

                    {serverError && (
                        <div className="login-error" role="alert" aria-live="assertive">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <label className="field">
                            <span>ইমেইল ঠিকানা <b>*</b></span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                autoComplete="email"
                                aria-invalid={errors.email ? 'true' : 'false'}
                                aria-describedby={errors.email ? 'login-email-error' : undefined}
                            />
                            {errors.email && <small id="login-email-error" className="field-error">{errors.email}</small>}
                        </label>

                        <label className="field">
                            <span>পাসওয়ার্ড <b>*</b></span>
                            <div className="password-field">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="আপনার পাসওয়ার্ড"
                                    autoComplete="current-password"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <small id="login-password-error" className="field-error">{errors.password}</small>}
                        </label>

                        <div className="login-row">
                            <label className="remember-row">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span>আমাকে মনে রাখুন</span>
                            </label>

                            <a className="forgot-link" href="mailto:support@mentora.app">
                                পাসওয়ার্ড ভুলে গেছেন?
                            </a>
                        </div>

                        <button type="submit" className="btn btn-primary login-submit" disabled={isLoading}>
                            {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                        </button>

                        <p className="login-note">
                            নতুন এখানে? <Link to="/signup">এখনই অ্যাকাউন্ট তৈরি করুন</Link>
                        </p>
                    </form>

                    <div className="login-divider">অথবা</div>

                    <div className="login-social-grid">
                        <button type="button" className="login-social-btn">
                            Demo Session
                        </button>
                        <button type="button" className="login-social-btn">
                            Guest Preview
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Login;