import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MentalHealthCheck from '../components/AssessmentWidget/MentalHealthCheck';
import FullAssessment from '../components/AssessmentWidget/FullAssessment';
import Header from '../components/Header';

const QuickAssessment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('quick');
    const [showPaywall, setShowPaywall] = useState(false);

    if (!user) { navigate('/login'); return null; }

    const isPaid = user?.user_type === 'paid' || user?.subscription === 'premium';

    return (
        <>
            <Header />
            {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} navigate={navigate} />}

            <div style={S.page}>
                {/* Background */}
                <div style={S.bgGlow1} /><div style={S.bgGlow2} />

                <div style={S.container}>
                    {/* Back + Tabs */}
                    <div style={S.topBar}>
                        <button onClick={() => navigate('/dashboard')} style={S.backBtn}>
                            ← ড্যাশবোর্ড
                        </button>
                        <div style={S.tabs}>
                            <button
                                style={{ ...S.tab, ...(mode === 'quick' ? S.tabActive : {}) }}
                                onClick={() => setMode('quick')}
                            >
                                ⚡ দ্রুত পরীক্ষা
                                <span style={{ ...S.badge, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>🆓 FREE</span>
                            </button>
                            <button
                                style={{ ...S.tab, ...(mode === 'full' && isPaid ? S.tabActive : {}), ...(!isPaid ? S.tabLocked : {}) }}
                                onClick={() => isPaid ? setMode('full') : setShowPaywall(true)}
                            >
                                📋 সম্পূর্ণ পরীক্ষা
                                <span style={{ ...S.badge, background: isPaid ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)', color: isPaid ? '#f59e0b' : '#9ca3af', border: `1px solid ${isPaid ? 'rgba(245,158,11,0.3)' : 'rgba(107,114,128,0.2)'}` }}>
                                    {isPaid ? '👑 Active' : '🔒 Premium'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plan Banner */}
                    {!isPaid && (
                        <div style={S.banner}>
                            <span>🆓 আপনি বিনামূল্যে প্ল্যানে আছেন — <strong style={{ color: '#10b981' }}>৪ প্রশ্নের দ্রুত পরীক্ষা</strong> উপলব্ধ</span>
                            <button onClick={() => navigate('/pricing')} style={S.upgradeBtn}>
                                👑 Premium পান →
                            </button>
                        </div>
                    )}
                    {isPaid && (
                        <div style={{ ...S.banner, background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
                            <span style={{ color: '#f59e0b' }}>👑 Premium সক্রিয় — সমস্ত পরীক্ষা উপলব্ধ</span>
                        </div>
                    )}

                    {/* Assessment Content */}
                    <div style={S.contentCard}>
                        {mode === 'quick' ? <MentalHealthCheck /> : <FullAssessment />}
                    </div>
                </div>
            </div>
        </>
    );
};

/* ── Paywall Modal ─────────────────────────────────────────── */
const PaywallModal = ({ onClose, navigate }) => (
    <div style={P.overlay}>
        <div style={P.modal}>
            <button style={P.closeBtn} onClick={onClose}>✕</button>
            <div style={P.icon}>🔒</div>
            <h2 style={P.title}>সম্পূর্ণ পরীক্ষা — প্রিমিয়াম ফিচার</h2>
            <p style={P.desc}>
                ১৭ প্রশ্নের সম্পূর্ণ মানসিক স্বাস্থ্য পরীক্ষা শুধুমাত্র Premium সদস্যদের জন্য।
            </p>
            <div style={P.plans}>
                <div style={P.plan}>
                    <div style={P.planHead}>🆓 বিনামূল্যে</div>
                    <div style={P.planItem}>✅ ৪ প্রশ্নের দ্রুত পরীক্ষা</div>
                    <div style={P.planItem}>✅ প্রাথমিক ঝুঁকি বিশ্লেষণ</div>
                    <div style={P.planItem}>✅ ২৪/৭ সাপোর্ট চ্যাট</div>
                    <div style={{ ...P.planItem, color: '#ef4444' }}>✗ ১৭ প্রশ্নের পরীক্ষা</div>
                    <div style={{ ...P.planItem, color: '#ef4444' }}>✗ PDF রিপোর্ট</div>
                </div>
                <div style={{ ...P.plan, ...P.planPremium }}>
                    <div style={P.planHead}>👑 Premium — ৳২৯৯/মাস</div>
                    <div style={P.planItem}>✅ ৪ প্রশ্নের দ্রুত পরীক্ষা</div>
                    <div style={P.planItem}>✅ ১৭ প্রশ্নের সম্পূর্ণ পরীক্ষা</div>
                    <div style={P.planItem}>✅ বিস্তারিত AI বিশ্লেষণ</div>
                    <div style={P.planItem}>✅ RAG চ্যাটবট সেবা</div>
                    <div style={P.planItem}>✅ PDF রিপোর্ট ডাউনলোড</div>
                </div>
            </div>
            <button onClick={() => navigate('/pricing')} style={P.upgradeBtn}>
                👑 আপগ্রেড করুন — ৳২৯৯/মাস
            </button>
            <button onClick={onClose} style={P.cancelBtn}>বিনামূল্যে পরীক্ষা দিন</button>
        </div>
    </div>
);

/* ── Styles ─────────────────────────────────────────────────── */
const S = {
    page: {
        minHeight: '100vh', background: '#060d18', paddingTop: '80px',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', 'Hind Siliguri', sans-serif",
    },
    bgGlow1: {
        position: 'fixed', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)',
    },
    bgGlow2: {
        position: 'fixed', bottom: '0', right: '0', pointerEvents: 'none',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
    },
    container: {
        maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem',
        position: 'relative', zIndex: 1,
    },
    topBar: {
        display: 'flex', alignItems: 'center', gap: '1rem',
        flexWrap: 'wrap', marginBottom: '1.25rem',
    },
    backBtn: {
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
        color: '#10b981', padding: '0.45rem 1rem', borderRadius: '9px',
        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
        transition: 'all 0.2s', fontFamily: 'inherit',
    },
    tabs: { display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' },
    tab: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1.1rem', borderRadius: '30px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
        transition: 'all 0.2s', fontFamily: 'inherit',
    },
    tabActive: {
        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
        color: '#10b981',
    },
    tabLocked: { opacity: 0.75 },
    badge: {
        fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
        borderRadius: '8px', letterSpacing: '0.3px',
    },
    banner: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem',
        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)',
        borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '1.25rem',
        color: '#a8c0b5', fontSize: '0.85rem',
    },
    upgradeBtn: {
        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
        border: 'none', color: '#000', padding: '0.4rem 1rem',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
        fontFamily: 'inherit',
    },
    contentCard: {
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(10px)',
    },
};

const P = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', backdropFilter: 'blur(6px)',
    },
    modal: {
        background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '22px', padding: '2rem', maxWidth: '560px', width: '100%',
        position: 'relative', textAlign: 'center',
        fontFamily: "'Inter', 'Hind Siliguri', sans-serif",
    },
    closeBtn: {
        position: 'absolute', top: '1rem', right: '1rem',
        background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8',
        width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
    },
    icon: { fontSize: '3rem', marginBottom: '0.75rem' },
    title: { color: '#e2e8f0', fontSize: '1.25rem', marginBottom: '0.6rem' },
    desc: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '1.5rem' },
    plans: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' },
    plan: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' },
    planPremium: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.22)' },
    planHead: { color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.7rem' },
    planItem: { color: '#94a3b8', fontSize: '0.76rem', padding: '0.18rem 0' },
    upgradeBtn: {
        width: '100%', background: 'linear-gradient(135deg,#f59e0b,#d97706)',
        border: 'none', color: '#000', padding: '0.85rem', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 700, fontSize: '0.93rem', marginBottom: '0.6rem',
        fontFamily: 'inherit',
    },
    cancelBtn: {
        width: '100%', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
        padding: '0.7rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem',
        fontFamily: 'inherit',
    },
};

export default QuickAssessment;