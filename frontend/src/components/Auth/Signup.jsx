import React, { useState } from 'react';

const signupBenefits = [
    'বাংলা ভাষায় সহজ onboarding',
    'গোপনীয়তা-প্রথম অভিজ্ঞতা',
    'মোবাইল-ফার্স্ট, দ্রুত লোড হয়',
    'AI-guided mood support'
];

const supportPoints = [
    'আপনার অনুভূতি লিখে রাখুন',
    'দৈনিক AI সারাংশ পান',
    'ভালো অভ্যাস ধাপে ধাপে গড়ে তুলুন'
];

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((previous) => ({ ...previous, [name]: '' }));
        }
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = 'আপনার নাম লিখুন';
        } else if (formData.name.trim().length < 2) {
            nextErrors.name = 'নাম অন্তত ২ অক্ষরের হতে হবে';
        }

        if (!formData.email.trim()) {
            nextErrors.email = 'ইমেইল ঠিকানা লিখুন';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            nextErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
        }

        if (formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone)) {
            nextErrors.phone = 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন';
        }

        if (!formData.password) {
            nextErrors.password = 'পাসওয়ার্ড লিখুন';
        } else if (formData.password.length < 6) {
            nextErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
        }

        if (!formData.confirmPassword) {
            nextErrors.confirmPassword = 'পাসওয়ার্ড আবার লিখুন';
        } else if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'পাসওয়ার্ড দুটি মেলেনি';
        }

        return nextErrors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setSuccessMessage('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনি Mentora ব্যবহার শুরু করতে পারেন।');
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: ''
            });
            setIsLoading(false);

            setTimeout(() => setSuccessMessage(''), 3500);
        }, 1200);
    };

    return (
        <main className="signup-page">
            <div className="signup-glow signup-glow-left" />
            <div className="signup-glow signup-glow-right" />

            <div className="container signup-layout">
                <section className="signup-showcase reveal">
                    <div className="signup-brand-card">
                        <div className="signup-brand">
                            <span className="hero-brand-mark">M</span>
                            <div>
                                <h1>Mentora</h1>
                                <p>বাংলাদেশের জন্য AI মানসিক সুস্থতা প্ল্যাটফর্ম</p>
                            </div>
                        </div>

                        <div className="signup-top-actions">
                            <a className="btn btn-secondary signup-link-btn" href="/">
                                হোমে ফিরুন
                            </a>
                            <a className="btn btn-primary signup-link-btn" href="#signup-form">
                                লগইন
                            </a>
                        </div>
                    </div>

                    <div className="signup-copy-card">
                        <span className="section-kicker">নতুন অ্যাকাউন্ট</span>
                        <h2>একটি স্বস্তিদায়ক ডিজিটাল অভিজ্ঞতা, পুরোপুরি বাংলায়</h2>
                        <p>
                            মেন্টোরা এমনভাবে ডিজাইন করা হয়েছে যাতে আপনি সহজে সাইনআপ করতে পারেন, নিজের mental wellbeing journey শুরু করতে পারেন, আর প্রতিদিন একটু বেশি calm feel করতে পারেন।
                        </p>

                        <div className="signup-points">
                            {signupBenefits.map((item) => (
                                <div key={item} className="signup-chip">{item}</div>
                            ))}
                        </div>

                        <div className="signup-insight-card">
                            <span className="insight-label">কেন এটি আলাদা</span>
                            <ul>
                                {supportPoints.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="signup-metrics">
                            <article>
                                <strong>৯৮%</strong>
                                <span>ব্যবহারকারী সন্তুষ্টি</span>
                            </article>
                            <article>
                                <strong>২৪/৭</strong>
                                <span>সাপোর্ট কভারেজ</span>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="signup-form-card reveal" id="signup-form">
                    <div className="signup-form-header">
                        <span className="section-kicker">সাইনআপ</span>
                        <h2>আপনার অ্যাকাউন্ট তৈরি করুন</h2>
                        <p>মাত্র কয়েক মিনিটে শুরু করুন। সবকিছুই সহজ, পরিষ্কার, আর বাংলায় রাখা হয়েছে।</p>
                    </div>

                    {successMessage && <div className="signup-success">{successMessage}</div>}

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="field-grid">
                            <label className="field">
                                <span>আপনার নাম <b>*</b></span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="যেমন: রাবিয়া খান"
                                />
                                {errors.name && <small className="field-error">{errors.name}</small>}
                            </label>

                            <label className="field">
                                <span>ইমেইল ঠিকানা <b>*</b></span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                />
                                {errors.email && <small className="field-error">{errors.email}</small>}
                            </label>
                        </div>

                        <label className="field">
                            <span>মোবাইল নম্বর <em>(ঐচ্ছিক)</em></span>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                            />
                            {errors.phone && <small className="field-error">{errors.phone}</small>}
                        </label>

                        <div className="field-grid">
                            <label className="field">
                                <span>পাসওয়ার্ড <b>*</b></span>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="কমপক্ষে ৬ অক্ষর"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((previous) => !previous)}
                                        aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && <small className="field-error">{errors.password}</small>}
                            </label>

                            <label className="field">
                                <span>পাসওয়ার্ড নিশ্চিত করুন <b>*</b></span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="আবার একই পাসওয়ার্ড"
                                />
                                {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
                            </label>
                        </div>

                        <label className="terms-row">
                            <input type="checkbox" required />
                            <span>
                                আমি <a href="#">শর্তাবলি</a> এবং <a href="#">গোপনীয়তা নীতি</a> মেনে নিচ্ছি।
                            </span>
                        </label>

                        <button type="submit" className="btn btn-primary signup-submit" disabled={isLoading}>
                            {isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                        </button>

                        <p className="signup-note">
                            ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="#">লগইন করুন</a>
                        </p>
                    </form>

                    <div className="signup-divider">
                        <span>অথবা</span>
                    </div>

                    <div className="signup-social-grid">
                        <button type="button" className="signup-social-btn">📱 মোবাইল OTP</button>
                        <button type="button" className="signup-social-btn">🔑 ইমেইল লিংক</button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Signup;