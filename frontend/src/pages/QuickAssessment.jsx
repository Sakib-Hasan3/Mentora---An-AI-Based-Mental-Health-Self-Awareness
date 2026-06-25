import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MentalHealthCheck from '../components/AssessmentWidget/MentalHealthCheck';
import FullAssessment from '../components/AssessmentWidget/FullAssessment';
import Header from '../components/Header';
import '../styles/assessment-widget.css';

const QuickAssessment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('quick');
    const [showPaywall, setShowPaywall] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const isPaid = user?.user_type === 'paid' || user?.subscription === 'premium';

    // Paywall modal for full assessment
    const PaywallModal = () => (
        <div style={paywallStyles.overlay}>
            <div style={paywallStyles.modal}>
                <div style={paywallStyles.icon}>🔒</div>
                <h2 style={paywallStyles.title}>সম্পূর্ণ পরীক্ষা — প্রিমিয়াম ফিচার</h2>
                <p style={paywallStyles.desc}>
                    ১৭ প্রশ্নের সম্পূর্ণ মানসিক স্বাস্থ্য পরীক্ষা শুধুমাত্র Premium সদস্যদের জন্য।
                    এটি আরও বিস্তারিত ও নির্ভুল বিশ্লেষণ প্রদান করে।
                </p>
                <div style={paywallStyles.comparison}>
                    <div style={paywallStyles.plan}>
                        <div style={paywallStyles.planTitle}>🆓 বিনামূল্যে</div>
                        <div style={paywallStyles.planItem}>✓ ৪ প্রশ্নের দ্রুত পরীক্ষা</div>
                        <div style={paywallStyles.planItem}>✓ প্রাথমিক ঝুঁকি বিশ্লেষণ</div>
                        <div style={paywallStyles.planItem}>✓ ২৪/৭ সাপোর্ট চ্যাট</div>
                        <div style={{ ...paywallStyles.planItem, color: '#ef4444' }}>✗ ১৭ প্রশ্নের পরীক্ষা</div>
                        <div style={{ ...paywallStyles.planItem, color: '#ef4444' }}>✗ PDF রিপোর্ট</div>
                    </div>
                    <div style={{ ...paywallStyles.plan, ...paywallStyles.premiumPlan }}>
                        <div style={paywallStyles.planTitle}>👑 Premium — ৳২৯৯/মাস</div>
                        <div style={paywallStyles.planItem}>✓ ৪ প্রশ্নের দ্রুত পরীক্ষা</div>
                        <div style={paywallStyles.planItem}>✓ ১৭ প্রশ্নের সম্পূর্ণ পরীক্ষা</div>
                        <div style={paywallStyles.planItem}>✓ বিস্তারিত AI বিশ্লেষণ</div>
                        <div style={paywallStyles.planItem}>✓ RAG চ্যাটবট সেবা</div>
                        <div style={paywallStyles.planItem}>✓ PDF রিপোর্ট ডাউনলোড</div>
                    </div>
                </div>
                <div style={paywallStyles.actions}>
                    <button onClick={() => navigate('/pricing')} style={paywallStyles.upgradeBtn}>
                        👑 আপগ্রেড করুন — ৳২৯৯/মাস
                    </button>
                    <button onClick={() => setShowPaywall(false)} style={paywallStyles.cancelBtn}>
                        বিনামূল্যে পরীক্ষা দিন
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="assessment-widget-container" style={{ paddingTop: '70px' }}>
            <Header />
            {showPaywall && <PaywallModal />}

            {/* Top Navigation */}
            <div style={navStyles.wrapper}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="back-btn"
                    style={navStyles.backBtn}
                >
                    ← ড্যাশবোর্ড
                </button>
                <div style={navStyles.tabs}>
                    <button
                        onClick={() => setMode('quick')}
                        style={{
                            ...navStyles.tab,
                            ...(mode === 'quick' ? navStyles.activeTab : {})
                        }}
                    >
                        ⚡ দ্রুত পরীক্ষা
                        <span style={navStyles.freeBadge}>🆓 বিনামূল্যে</span>
                    </button>
                    <button
                        onClick={() => {
                            if (!isPaid) {
                                setShowPaywall(true);
                            } else {
                                setMode('full');
                            }
                        }}
                        style={{
                            ...navStyles.tab,
                            ...(mode === 'full' ? navStyles.activeTab : {}),
                            ...(!isPaid ? navStyles.lockedTab : {})
                        }}
                    >
                        📋 সম্পূর্ণ পরীক্ষা (১৭ প্রশ্ন)
                        {!isPaid ? (
                            <span style={navStyles.paidBadge}>👑 Premium</span>
                        ) : (
                            <span style={navStyles.paidBadgePaid}>👑 Premium</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Plan Info Banner */}
            {!isPaid && (
                <div style={bannerStyles.wrapper}>
                    <div style={bannerStyles.left}>
                        🆓 আপনি বিনামূল্যে পরিকল্পনায় আছেন।
                        <strong style={{ color: '#f59e0b', marginLeft: '0.3rem' }}>৪ প্রশ্নের দ্রুত পরীক্ষা</strong> উপলব্ধ।
                    </div>
                    <button onClick={() => navigate('/pricing')} style={bannerStyles.upgradeBtn}>
                        👑 ১৭ প্রশ্নের পরীক্ষা পেতে আপগ্রেড করুন →
                    </button>
                </div>
            )}
            {isPaid && (
                <div style={{ ...bannerStyles.wrapper, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
                    <div style={{ ...bannerStyles.left, color: '#f59e0b' }}>
                        👑 আপনার Premium প্ল্যান সক্রিয়। সমস্ত পরীক্ষা উপলব্ধ।
                    </div>
                </div>
            )}

            {/* Assessment Content */}
            {mode === 'quick' ? <MentalHealthCheck /> : <FullAssessment />}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const paywallStyles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
    },
    modal: {
        background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '2rem', maxWidth: '600px', width: '100%',
        backdropFilter: 'blur(20px)', textAlign: 'center',
    },
    icon: { fontSize: '3rem', marginBottom: '1rem' },
    title: { color: '#e2e8f0', fontSize: '1.3rem', marginBottom: '0.75rem' },
    desc: { color: '#a8c0b5', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' },
    comparison: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
    plan: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '1rem', textAlign: 'left',
    },
    premiumPlan: {
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
    },
    planTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' },
    planItem: { color: '#a8c0b5', fontSize: '0.78rem', padding: '0.2rem 0' },
    actions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    upgradeBtn: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'none', color: '#000', padding: '0.9rem',
        borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
    },
    cancelBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#a8c0b5', padding: '0.7rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem',
    },
};

const navStyles = {
    wrapper: {
        marginBottom: '1rem', display: 'flex', gap: '1rem',
        alignItems: 'center', flexWrap: 'wrap',
    },
    backBtn: {
        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
        padding: '0.5rem 1rem', borderRadius: '8px', color: '#10b981', cursor: 'pointer',
    },
    tabs: { display: 'flex', gap: '0.5rem', marginLeft: 'auto' },
    tab: {
        padding: '0.5rem 1.2rem', borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)', color: '#a8c0b5',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.85rem', transition: 'all 0.2s',
    },
    activeTab: {
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
    },
    lockedTab: { opacity: 0.7 },
    freeBadge: {
        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
        color: '#10b981', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '8px',
    },
    paidBadge: {
        background: 'rgba(107,114,128,0.2)', border: '1px solid rgba(107,114,128,0.3)',
        color: '#9ca3af', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '8px',
    },
    paidBadgePaid: {
        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
        color: '#f59e0b', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '8px',
    },
};

const bannerStyles = {
    wrapper: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem',
        flexWrap: 'wrap', gap: '0.75rem',
    },
    left: { color: '#a8c0b5', fontSize: '0.83rem' },
    upgradeBtn: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'none', color: '#000', padding: '0.4rem 0.9rem',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
    },
};

export default QuickAssessment;