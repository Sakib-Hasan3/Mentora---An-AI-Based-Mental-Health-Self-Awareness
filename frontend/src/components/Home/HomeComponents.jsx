import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <nav className={`home-nav${scrolled ? ' scrolled' : ''}`}>
            <Link to="/" className="home-nav-logo">
                <div className="home-nav-logo-icon">🧠</div>
                <span className="home-nav-logo-name">Mentora</span>
            </Link>

            <div className="home-nav-links">
                <a href="#features" className="home-nav-link">ফিচার</a>
                <a href="#how" className="home-nav-link">কীভাবে কাজ করে</a>
                <a href="#stats" className="home-nav-link">পরিসংখ্যান</a>
                <Link to="/pricing" className="home-nav-link">মূল্য</Link>
            </div>

            <div className="home-nav-actions">
                <Link to="/login" className="home-nav-btn-outline">লগইন</Link>
                <Link to="/signup" className="home-nav-btn-primary">বিনামূল্যে শুরু করুন</Link>
            </div>

            <button className="home-nav-hamburger">☰</button>
        </nav>
    );
};

const HeroSection = () => (
    <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-grid" />

        <div className="home-hero-badge">
            <div className="home-hero-badge-dot" />
            বাংলাদেশের প্রথম AI মেন্টাল হেলথ প্ল্যাটফর্ম
        </div>

        <h1 className="home-hero-title">
            মানসিক সুস্থতার জন্য <br />
            <span className="em">বিশ্বস্ত সঙ্গী</span> —<br />
            <span className="vi">AI-চালিত Mentora</span>
        </h1>

        <p className="home-hero-sub">
            AI বিশ্লেষণ, বিশেষজ্ঞ কনসালট্যান্ট এবং ২৪/৭ সাপোর্ট — সবকিছু এক প্ল্যাটফর্মে।
            আপনার মানসিক স্বাস্থ্যের যত্ন নিন আজই।
        </p>

        <div className="home-hero-actions">
            <Link to="/signup" className="home-hero-cta-primary">
                🚀 বিনামূল্যে শুরু করুন
            </Link>
            <Link to="/login" className="home-hero-cta-secondary">
                ▶ কীভাবে কাজ করে
            </Link>
        </div>

        <div className="home-hero-stats">
            {[
                { num: '10K+', label: 'সক্রিয় ব্যবহারকারী' },
                { num: '71%',  label: 'AI নির্ভুলতা' },
                { num: '24/7', label: 'সাপোর্ট সেবা' },
                { num: '50+',  label: 'বিশেষজ্ঞ কনসালট্যান্ট' },
            ].map(s => (
                <div key={s.num} className="home-hero-stat">
                    <div className="home-hero-stat-num">{s.num}</div>
                    <div className="home-hero-stat-label">{s.label}</div>
                </div>
            ))}
        </div>

        {/* Floating decorative cards */}
        <div className="home-hero-cards">
            <div className="home-hero-card">
                <div className="home-hero-card-icon">📊</div>
                <div className="home-hero-card-text">
                    <strong>স্বাস্থ্য স্কোর</strong>
                    AI বিশ্লেষণ ✓
                </div>
            </div>
            <div className="home-hero-card">
                <div className="home-hero-card-icon">🏥</div>
                <div className="home-hero-card-text">
                    <strong>কনসালট্যান্ট</strong>
                    অ্যাপয়েন্টমেন্ট ✓
                </div>
            </div>
            <div className="home-hero-card">
                <div className="home-hero-card-icon">💬</div>
                <div className="home-hero-card-text">
                    <strong>AI চ্যাট</strong>
                    ২৪/৭ সাপোর্ট ✓
                </div>
            </div>
        </div>
    </section>
);

const features = [
    {
        icon: '🧠', title: 'AI মানসিক স্বাস্থ্য পরীক্ষা',
        desc: '৪ প্রশ্নের দ্রুত বা ১৭ প্রশ্নের সম্পূর্ণ পরীক্ষায় AI আপনার মানসিক স্বাস্থ্য বিশ্লেষণ করবে।',
        grad: 'linear-gradient(135deg,#10b981,#059669)', badge: '🆓 FREE', badgeColor: '#10b98120', badgeTextColor: '#10b981'
    },
    {
        icon: '💬', title: '২৪/৭ AI সাপোর্ট চ্যাট',
        desc: 'Groq AI দিয়ে যেকোনো সময় মানসিক স্বাস্থ্য পরামর্শ পান। তাৎক্ষণিক সাহায্য পাবেন।',
        grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', badge: '🆓 FREE', badgeColor: '#8b5cf620', badgeTextColor: '#a78bfa'
    },
    {
        icon: '🤖', title: 'RAG চ্যাটবট',
        desc: 'ডকুমেন্ট-ভিত্তিক বিশেষজ্ঞ AI চ্যাট। মানসিক স্বাস্থ্য সম্পর্কিত যেকোনো প্রশ্নের উত্তর পান।',
        grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: '👑 PAID', badgeColor: '#f59e0b20', badgeTextColor: '#fbbf24'
    },
    {
        icon: '🧑‍⚕️', title: 'বিশেষজ্ঞ কনসালট্যান্ট',
        desc: 'অনলাইন বা অফলাইনে অভিজ্ঞ মনোরোগ বিশেষজ্ঞের সাথে সরাসরি পরামর্শ করুন।',
        grad: 'linear-gradient(135deg,#ef4444,#dc2626)', badge: '📅 BOOK', badgeColor: '#ef444420', badgeTextColor: '#fca5a5'
    },
    {
        icon: '👥', title: 'কমিউনিটি',
        desc: 'বিভাগ ভিত্তিক গ্রুপ চ্যাটে যোগ দিন। অন্যদের সাথে অভিজ্ঞতা শেয়ার করুন।',
        grad: 'linear-gradient(135deg,#3b82f6,#2563eb)', badge: '👥 SOCIAL', badgeColor: '#3b82f620', badgeTextColor: '#93c5fd'
    },
    {
        icon: '🌿', title: 'ওয়েলনেস হাব',
        desc: 'মেজাজ ট্র্যাকার, শ্বাসের ব্যায়াম এবং কৃতজ্ঞতা জার্নাল — দৈনন্দিন মানসিক যত্নের জন্য।',
        grad: 'linear-gradient(135deg,#10b981,#0d9488)', badge: '✨ NEW', badgeColor: '#10b98120', badgeTextColor: '#6ee7b7'
    },
];

const FeaturesSection = () => (
    <section id="features" className="home-section home-features">
        <div className="home-features-header">
            <div className="home-section-tag">✨ ফিচারসমূহ</div>
            <h2 className="home-section-title">সব কিছু এক জায়গায়</h2>
            <p className="home-section-sub">মানসিক স্বাস্থ্যের সম্পূর্ণ সমাধান — AI থেকে বিশেষজ্ঞ পরামর্শ পর্যন্ত।</p>
        </div>
        <div className="home-features-grid">
            {features.map(f => (
                <div key={f.title} className="home-feature-card">
                    <div className="home-feature-icon-wrap" style={{ background: f.grad + '33' }}>
                        {f.icon}
                    </div>
                    <div className="home-feature-title">{f.title}</div>
                    <div className="home-feature-desc">{f.desc}</div>
                    {f.badge && (
                        <div className="home-feature-badge"
                            style={{ background: f.badgeColor, color: f.badgeTextColor, border: `1px solid ${f.badgeTextColor}44` }}>
                            {f.badge}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </section>
);

const steps = [
    { num: '01', title: 'একাউন্ট তৈরি করুন', desc: 'বিনামূল্যে রেজিস্ট্রেশন করুন — মাত্র ১ মিনিটে। কোনো ক্রেডিট কার্ড প্রয়োজন নেই।' },
    { num: '02', title: 'মানসিক স্বাস্থ্য পরীক্ষা দিন', desc: '৪টি প্রশ্নের উত্তর দিন এবং AI আপনার মানসিক স্বাস্থ্যের অবস্থা বিশ্লেষণ করবে।' },
    { num: '03', title: 'প্রতিবেদন ও পরামর্শ পান', desc: 'বিস্তারিত AI রিপোর্ট এবং ব্যক্তিগত পরামর্শ পান। প্রয়োজনে বিশেষজ্ঞের সাথে কথা বলুন।' },
    { num: '04', title: 'উন্নতি ট্র্যাক করুন', desc: 'আপনার মানসিক স্বাস্থ্যের যাত্রা ট্র্যাক করুন এবং ধাপে ধাপে উন্নতি দেখুন।' },
];

const HowItWorks = () => (
    <section id="how" className="home-section home-how">
        <div className="home-how-inner">
            <div className="home-how-header">
                <div className="home-section-tag">⚡ কার্যপ্রক্রিয়া</div>
                <h2 className="home-section-title">মাত্র ৪টি ধাপে শুরু করুন</h2>
                <p className="home-section-sub">সহজ এবং দ্রুত — আপনার মানসিক স্বাস্থ্যের যাত্রা শুরু করতে মাত্র কয়েক মিনিট লাগবে।</p>
            </div>
            <div className="home-how-steps">
                {steps.map((s, i) => (
                    <div key={i} className="home-how-step">
                        <div className="home-how-step-num">{s.num}</div>
                        <div className="home-how-step-body">
                            <div className="home-how-step-title">{s.title}</div>
                            <div className="home-how-step-desc">{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const statsData = [
    { num: '10,000+', label: 'সক্রিয় ব্যবহারকারী বাংলাদেশ জুড়ে' },
    { num: '71.55%', label: 'AI মডেল নির্ভুলতা (Quick Assessment)' },
    { num: '50+', label: 'অভিজ্ঞ মনোরোগ বিশেষজ্ঞ কনসালট্যান্ট' },
    { num: '৯৮%', label: 'ব্যবহারকারী সন্তুষ্টির হার' },
];

const StatsSection = () => (
    <section id="stats" className="home-stats-section">
        <div className="home-stats-grid">
            {statsData.map(s => (
                <div key={s.num}>
                    <div className="home-stat-item-num">{s.num}</div>
                    <div className="home-stat-item-label">{s.label}</div>
                </div>
            ))}
        </div>
    </section>
);

const CTASection = () => (
    <section className="home-cta">
        <div className="home-cta-bg" />
        <div className="home-cta-card">
            <div className="home-cta-icon">🧠</div>
            <h2 className="home-cta-title">আজই আপনার সুস্থতার যাত্রা শুরু করুন</h2>
            <p className="home-cta-sub">
                হাজারো বাংলাদেশী ইতিমধ্যে Mentora ব্যবহার করে তাদের মানসিক স্বাস্থ্যের উন্নতি করছেন।
                আপনিও যোগ দিন — বিনামূল্যে।
            </p>
            <Link to="/signup" className="home-cta-btn">🚀 বিনামূল্যে একাউন্ট খুলুন →</Link>
            <div className="home-cta-note">কোনো ক্রেডিট কার্ড প্রয়োজন নেই • যেকোনো সময় বাতিল করুন</div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="home-footer">
        <div className="home-footer-top">
            <div>
                <div className="home-footer-brand-logo">
                    <div className="home-footer-brand-logo-icon">🧠</div>
                    <div className="home-footer-brand-logo-name">Mentora</div>
                </div>
                <p className="home-footer-brand-desc">বাংলাদেশের প্রথম AI-চালিত মানসিক স্বাস্থ্য প্ল্যাটফর্ম।</p>
            </div>
            <div>
                <div className="home-footer-col-title">সেবা</div>
                <ul className="home-footer-links">
                    <li><a href="#">মানসিক পরীক্ষা</a></li>
                    <li><a href="#">AI চ্যাটবট</a></li>
                    <li><a href="#">কনসালট্যান্ট</a></li>
                    <li><a href="#">ওয়েলনেস হাব</a></li>
                </ul>
            </div>
            <div>
                <div className="home-footer-col-title">কোম্পানি</div>
                <ul className="home-footer-links">
                    <li><a href="#">আমাদের সম্পর্কে</a></li>
                    <li><a href="#">গোপনীয়তা নীতি</a></li>
                    <li><a href="#">ব্যবহারের শর্ত</a></li>
                    <li><a href="#">যোগাযোগ</a></li>
                </ul>
            </div>
            <div>
                <div className="home-footer-col-title">সহায়তা</div>
                <ul className="home-footer-links">
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">সাপোর্ট</a></li>
                    <li><Link to="/pricing">মূল্য পরিকল্পনা</Link></li>
                </ul>
            </div>
        </div>
        <div className="home-footer-bottom">
            <div className="home-footer-copy">© 2025 Mentora. সর্বস্বত্ব সংরক্ষিত। Made with ❤️ in Bangladesh</div>
            <div className="home-footer-socials">
                <a className="home-footer-social" href="#" title="Facebook">f</a>
                <a className="home-footer-social" href="#" title="Twitter">𝕏</a>
                <a className="home-footer-social" href="#" title="LinkedIn">in</a>
            </div>
        </div>
    </footer>
);

export { Navbar, HeroSection, FeaturesSection, HowItWorks, StatsSection, CTASection, Footer };
