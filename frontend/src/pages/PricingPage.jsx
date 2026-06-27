import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentStep, setPaymentStep] = useState(1);
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const isPaid = user?.user_type === 'paid' || user?.subscription === 'premium';

    const plans = {
        free: {
            name: 'বিনামূল্যে',
            icon: '🆓',
            price: { monthly: 0, yearly: 0 },
            color: 'rgba(16,185,129,0.15)',
            borderColor: 'rgba(16,185,129,0.3)',
            accentColor: '#10b981',
            features: [
                { text: '২৪/৭ সাপোর্ট চ্যাট (Groq AI)', included: true },
                { text: '৪ প্রশ্নের দ্রুত মানসিক স্বাস্থ্য পরীক্ষা', included: true },
                { text: 'বই জার্নাল পড়া', included: true },
                { text: 'কমিউনিটি গ্রুপ চ্যাট', included: true },
                { text: 'প্রগ্রেস ট্র্যাকিং', included: true },
                { text: '১৭ প্রশ্নের সম্পূর্ণ পরীক্ষা', included: false },
                { text: 'RAG চ্যাটবট (ডকুমেন্ট-ভিত্তিক)', included: false },
                { text: 'AI বিস্তারিত বিশ্লেষণ রিপোর্ট', included: false },
                { text: 'PDF রিপোর্ট ডাউনলোড', included: false },
                { text: 'অগ্রাধিকার সাপোর্ট', included: false },
            ]
        },
        premium: {
            name: 'প্রিমিয়াম',
            icon: '👑',
            price: { monthly: 299, yearly: 2499 },
            color: 'rgba(245,158,11,0.12)',
            borderColor: 'rgba(245,158,11,0.4)',
            accentColor: '#f59e0b',
            popular: true,
            features: [
                { text: '২৪/৭ সাপোর্ট চ্যাট (Groq AI)', included: true },
                { text: '৪ প্রশ্নের দ্রুত মানসিক স্বাস্থ্য পরীক্ষা', included: true },
                { text: 'বই জার্নাল পড়া', included: true },
                { text: 'কমিউনিটি গ্রুপ চ্যাট', included: true },
                { text: 'প্রগ্রেস ট্র্যাকিং', included: true },
                { text: '১৭ প্রশ্নের সম্পূর্ণ পরীক্ষা', included: true },
                { text: 'RAG চ্যাটবট (ডকুমেন্ট-ভিত্তিক)', included: true },
                { text: 'AI বিস্তারিত বিশ্লেষণ রিপোর্ট', included: true },
                { text: 'PDF রিপোর্ট ডাউনলোড', included: true },
                { text: 'অগ্রাধিকার সাপোর্ট', included: true },
            ]
        }
    };

    const handleUpgrade = (plan) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
        setPaymentStep(1);
        setSuccess(false);
    };

    const initiateSslCommerzPayment = async () => {
        setProcessing(true);
        try {
            const data = await api.post('/payment/initiate', { plan: billingCycle });
            if (data.success && data.gateway_url) {
                // Redirect user to SSLCommerz hosted checkout page
                window.location.href = data.gateway_url;
            } else {
                alert('পেমেন্ট শুরু করতে ব্যর্থ হয়েছে');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error.message || 'পেমেন্ট সংযোগ সমস্যা');
        } finally {
            setProcessing(false);
        }
    };

    const formatCardNumber = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    };

    const monthlyPrice = plans.premium.price.monthly;
    const yearlyPrice = plans.premium.price.yearly;
    const saving = Math.round(100 - (yearlyPrice / (monthlyPrice * 12)) * 100);

    return (
        <div style={{...styles.container, paddingTop: '70px'}}>
            <Header />
            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        {paymentStep === 1 && (
                            <>
                                <h2 style={styles.modalTitle}>📦 পরিকল্পনা নিশ্চিত করুন</h2>
                                <div style={styles.orderSummary}>
                                    <div style={styles.orderRow}>
                                        <span style={styles.orderLabel}>পরিকল্পনা</span>
                                        <span style={styles.orderValue}>Premium {billingCycle === 'yearly' ? '(বার্ষিক)' : '(মাসিক)'}</span>
                                    </div>
                                    <div style={styles.orderRow}>
                                        <span style={styles.orderLabel}>পরিমাণ</span>
                                        <span style={{ ...styles.orderValue, color: '#f59e0b', fontWeight: 700, fontSize: '1.2rem' }}>
                                            ৳{billingCycle === 'yearly' ? yearlyPrice.toLocaleString() : monthlyPrice}
                                        </span>
                                    </div>
                                    {billingCycle === 'yearly' && (
                                        <div style={styles.savingRow}>
                                            🎉 আপনি ৳{(monthlyPrice * 12 - yearlyPrice).toLocaleString()} সাশ্রয় করছেন!
                                        </div>
                                    )}
                                </div>
                                <div style={styles.featurePreview}>
                                    {['RAG চ্যাটবট', '১৭ প্রশ্নের পরীক্ষা', 'PDF রিপোর্ট', 'প্রিমিয়াম সাপোর্ট'].map((f, i) => (
                                        <span key={i} style={styles.featureTag}>✓ {f}</span>
                                    ))}
                                </div>
                                <div style={styles.modalActions}>
                                    <button 
                                        onClick={initiateSslCommerzPayment} 
                                        disabled={processing}
                                        style={{ ...styles.proceedBtn, opacity: processing ? 0.7 : 1 }}
                                    >
                                        {processing ? '⏳ পেমেন্ট লোড হচ্ছে...' : '💳 SSLCommerz (বিকাশ, নগদ, রকেট) দিয়ে পেমেন্ট করুন'}
                                    </button>
                                    <button onClick={() => setShowPaymentModal(false)} style={styles.cancelBtn} disabled={processing}>বাতিল</button>
                                </div>
                            </>
                        )}

                        {paymentStep === 2 && (
                            <>
                                <h2 style={styles.modalTitle}>💳 পেমেন্ট তথ্য</h2>
                                <div style={styles.cardPreview}>
                                    <div style={styles.cardBrand}>💳 VISA / MasterCard</div>
                                    <div style={styles.cardNum}>{cardData.number || '•••• •••• •••• ••••'}</div>
                                    <div style={styles.cardBottom}>
                                        <span>{cardData.name || 'কার্ডধারীর নাম'}</span>
                                        <span>{cardData.expiry || 'MM/YY'}</span>
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>কার্ড নম্বর</label>
                                    <input
                                        style={styles.input}
                                        placeholder="1234 5678 9012 3456"
                                        value={cardData.number}
                                        onChange={e => setCardData(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                                        maxLength={19}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>কার্ডধারীর নাম</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Md. John Doe"
                                        value={cardData.name}
                                        onChange={e => setCardData(p => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>মেয়াদ শেষ</label>
                                        <input
                                            style={styles.input}
                                            placeholder="MM/YY"
                                            value={cardData.expiry}
                                            onChange={e => setCardData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                                            maxLength={5}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>CVV</label>
                                        <input
                                            style={styles.input}
                                            placeholder="•••"
                                            type="password"
                                            value={cardData.cvv}
                                            onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.slice(0, 3) }))}
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div style={styles.secureNote}>🔒 আপনার তথ্য SSL এনক্রিপ্টেড ও নিরাপদ</div>
                                <div style={styles.modalActions}>
                                    <button
                                        onClick={processPayment}
                                        disabled={processing || !cardData.number || !cardData.name}
                                        style={{ ...styles.proceedBtn, opacity: processing ? 0.7 : 1 }}
                                    >
                                        {processing ? '⏳ প্রক্রিয়া হচ্ছে...' : `✅ ৳${billingCycle === 'yearly' ? yearlyPrice.toLocaleString() : monthlyPrice} পরিশোধ করুন`}
                                    </button>
                                    <button onClick={() => setPaymentStep(1)} style={styles.cancelBtn}>← পিছনে</button>
                                </div>
                            </>
                        )}

                        {paymentStep === 3 && success && (
                            <>
                                <div style={styles.successIcon}>🎉</div>
                                <h2 style={styles.modalTitle}>পেমেন্ট সফল হয়েছে!</h2>
                                <p style={styles.successDesc}>
                                    আপনার Premium সদস্যপদ সক্রিয় হয়েছে। এখন থেকে সমস্ত প্রিমিয়াম ফিচার ব্যবহার করতে পারবেন।
                                </p>
                                <div style={styles.successFeatures}>
                                    {['✓ RAG চ্যাটবট', '✓ ১৭ প্রশ্নের পরীক্ষা', '✓ PDF রিপোর্ট'].map((f, i) => (
                                        <div key={i} style={styles.successFeatureItem}>{f}</div>
                                    ))}
                                </div>
                                <div style={styles.modalActions}>
                                    <button onClick={() => navigate('/rag-chatbot')} style={styles.proceedBtn}>
                                        🧠 RAG চ্যাটবট ব্যবহার করুন →
                                    </button>
                                    <button onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>
                                        ড্যাশবোর্ডে যান
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← ড্যাশবোর্ড</button>
            </div>

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.heroLabel}>💰 মূল্য পরিকল্পনা</div>
                <h1 style={styles.heroTitle}>আপনার মানসিক স্বাস্থ্যে বিনিয়োগ করুন</h1>
                <p style={styles.heroDesc}>সহজ ও স্বচ্ছ মূল্য নীতি। যেকোনো সময় বাতিল করুন।</p>

                {/* Billing Toggle */}
                <div style={styles.billingToggle}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        style={{ ...styles.billingBtn, ...(billingCycle === 'monthly' ? styles.billingActive : {}) }}
                    >
                        মাসিক
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        style={{ ...styles.billingBtn, ...(billingCycle === 'yearly' ? styles.billingActive : {}) }}
                    >
                        বার্ষিক
                        <span style={styles.saveBadge}>{saving}% সাশ্রয়</span>
                    </button>
                </div>
            </div>

            {/* Plans */}
            <div style={styles.plansGrid}>
                {Object.entries(plans).map(([key, plan]) => (
                    <div key={key} style={{
                        ...styles.planCard,
                        background: plan.color,
                        border: `1px solid ${plan.borderColor}`,
                        ...(plan.popular ? styles.popularCard : {})
                    }}>
                        {plan.popular && (
                            <div style={styles.popularBadge}>⭐ সর্বাধিক জনপ্রিয়</div>
                        )}
                        <div style={styles.planIcon}>{plan.icon}</div>
                        <h2 style={{ ...styles.planName, color: plan.accentColor }}>{plan.name}</h2>

                        <div style={styles.priceDisplay}>
                            {plan.price.monthly === 0 ? (
                                <span style={styles.freePrice}>বিনামূল্যে</span>
                            ) : (
                                <>
                                    <span style={styles.currency}>৳</span>
                                    <span style={styles.priceNum}>
                                        {billingCycle === 'yearly'
                                            ? Math.round(plan.price.yearly / 12)
                                            : plan.price.monthly}
                                    </span>
                                    <span style={styles.pricePeriod}>/মাস</span>
                                </>
                            )}
                        </div>
                        {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                            <div style={styles.yearlyNote}>৳{plan.price.yearly.toLocaleString()} বার্ষিক বিল</div>
                        )}

                        <ul style={styles.featureList}>
                            {plan.features.map((f, i) => (
                                <li key={i} style={{
                                    ...styles.featureItem,
                                    ...(f.included ? {} : styles.featureExcluded)
                                }}>
                                    <span style={{ color: f.included ? plan.accentColor : '#4b5563' }}>
                                        {f.included ? '✓' : '✗'}
                                    </span>
                                    {f.text}
                                </li>
                            ))}
                        </ul>

                        {key === 'free' ? (
                            isPaid ? (
                                <div style={{ ...styles.currentPlanBtn, borderColor: plan.borderColor, color: plan.accentColor }}>
                                    ✓ বর্তমান পরিকল্পনা নয়
                                </div>
                            ) : (
                                <div style={{ ...styles.currentPlanBtn, borderColor: plan.borderColor, color: plan.accentColor }}>
                                    ✓ আপনার বর্তমান পরিকল্পনা
                                </div>
                            )
                        ) : (
                            isPaid ? (
                                <div style={{ ...styles.currentPlanBtn, borderColor: plan.borderColor, color: plan.accentColor }}>
                                    👑 আপনার বর্তমান Premium পরিকল্পনা
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade('premium')}
                                    style={{ ...styles.upgradeBtn, background: `linear-gradient(135deg, ${plan.accentColor}, #d97706)` }}
                                >
                                    👑 আপগ্রেড করুন →
                                </button>
                            )
                        )}
                    </div>
                ))}
            </div>

            {/* Consultant Section */}
            <div style={styles.consultantSection}>
                <h2 style={styles.consultantTitle}>🧑‍⚕️ কনসালট্যান্ট অ্যাপয়েন্টমেন্ট</h2>
                <p style={styles.consultantDesc}>
                    বিশেষজ্ঞ মানসিক স্বাস্থ্য পরামর্শদাতার সাথে সরাসরি কথা বলুন।
                    Free এবং Premium উভয় সদস্যদের জন্য উপলব্ধ।
                </p>
                <div style={styles.consultantCards}>
                    <div style={styles.consultantCard}>
                        <div style={styles.consultantIcon}>🖥️</div>
                        <h3 style={styles.consultantCardTitle}>অনলাইন সেশন</h3>
                        <div style={styles.consultantPrice}>৳৫০০ <span style={styles.consultantPer}>/সেশন</span></div>
                        <p style={styles.consultantCardDesc}>ভিডিও/অডিও কলে বিশেষজ্ঞের সাথে কথা বলুন</p>
                        <button onClick={() => navigate('/consultants')} style={styles.bookBtn}>বুক করুন →</button>
                    </div>
                    <div style={styles.consultantCard}>
                        <div style={styles.consultantIcon}>🏢</div>
                        <h3 style={styles.consultantCardTitle}>সরাসরি সেশন</h3>
                        <div style={styles.consultantPrice}>৳৮০০ <span style={styles.consultantPer}>/সেশন</span></div>
                        <p style={styles.consultantCardDesc}>সরাসরি চেম্বারে গিয়ে বিশেষজ্ঞের সাথে দেখা করুন</p>
                        <button onClick={() => navigate('/consultants')} style={styles.bookBtn}>বুক করুন →</button>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div style={styles.faq}>
                <h2 style={styles.faqTitle}>❓ সাধারণ প্রশ্নাবলী</h2>
                {[
                    { q: 'Premium প্ল্যান বাতিল করা যাবে?', a: 'হ্যাঁ, যেকোনো সময় বাতিল করতে পারবেন। বাতিলের পর মেয়াদ শেষ পর্যন্ত Premium সুবিধা পাবেন।' },
                    { q: 'RAG চ্যাটবট কী?', a: 'RAG (Retrieval-Augmented Generation) চ্যাটবট আমাদের মানসিক স্বাস্থ্য বিষয়ক ডকুমেন্ট থেকে তথ্য খুঁজে সঠিক উত্তর দেয়।' },
                    { q: 'কনসালট্যান্ট বুকিং করলে কি টাকা ফেরত পাওয়া যায়?', a: '২৪ ঘণ্টা আগে বাতিল করলে সম্পূর্ণ টাকা ফেরত পাবেন।' },
                ].map((item, i) => (
                    <div key={i} style={styles.faqItem}>
                        <h4 style={styles.faqQ}>{item.q}</h4>
                        <p style={styles.faqA}>{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 100%)',
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        color: '#e2e8f0',
    },
    modalOverlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
    },
    modal: {
        background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '2rem', maxWidth: '480px', width: '100%',
        backdropFilter: 'blur(20px)', maxHeight: '90vh', overflowY: 'auto',
    },
    modalTitle: { color: '#e2e8f0', fontSize: '1.3rem', margin: '0 0 1.5rem', textAlign: 'center' },
    orderSummary: {
        background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem',
        marginBottom: '1rem',
    },
    orderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0' },
    orderLabel: { color: '#6b8f7f', fontSize: '0.85rem' },
    orderValue: { color: '#e2e8f0', fontSize: '0.9rem' },
    savingRow: {
        marginTop: '0.5rem', color: '#10b981', fontSize: '0.82rem',
        background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '0.4rem 0.6rem',
    },
    featurePreview: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' },
    featureTag: {
        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
        color: '#f59e0b', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '20px',
    },
    cardPreview: {
        background: 'linear-gradient(135deg, #1a2540, #0f1a30)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
    },
    cardBrand: { color: '#6b8f7f', fontSize: '0.8rem', marginBottom: '1rem' },
    cardNum: { color: '#e2e8f0', fontSize: '1.1rem', letterSpacing: '4px', marginBottom: '1rem', fontFamily: 'monospace' },
    cardBottom: { display: 'flex', justifyContent: 'space-between', color: '#a8c0b5', fontSize: '0.82rem' },
    formGroup: { marginBottom: '1rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    label: { display: 'block', color: '#6b8f7f', fontSize: '0.8rem', marginBottom: '0.4rem' },
    input: {
        width: '100%', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
        padding: '0.7rem 0.9rem', color: '#e2e8f0', fontSize: '0.9rem',
        outline: 'none', boxSizing: 'border-box',
    },
    secureNote: {
        color: '#6b8f7f', fontSize: '0.75rem', textAlign: 'center',
        marginBottom: '1.5rem',
    },
    modalActions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    proceedBtn: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none', color: '#fff', padding: '0.9rem',
        borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
    },
    cancelBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#a8c0b5', padding: '0.7rem', borderRadius: '12px',
        cursor: 'pointer', fontSize: '0.85rem',
    },
    successIcon: { fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' },
    successDesc: { color: '#a8c0b5', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.6, marginBottom: '1rem' },
    successFeatures: { marginBottom: '1.5rem' },
    successFeatureItem: {
        color: '#10b981', fontSize: '0.88rem', padding: '0.3rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    header: { padding: '1.5rem 2rem' },
    backBtn: {
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#a8c0b5', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
        fontSize: '0.85rem',
    },
    hero: { textAlign: 'center', padding: '2rem 2rem 3rem' },
    heroLabel: {
        display: 'inline-block', background: 'rgba(245,158,11,0.15)',
        border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b',
        fontSize: '0.82rem', padding: '4px 16px', borderRadius: '20px', marginBottom: '1rem',
    },
    heroTitle: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem', color: '#e2e8f0' },
    heroDesc: { color: '#a8c0b5', fontSize: '1rem', marginBottom: '2rem' },
    billingToggle: {
        display: 'inline-flex', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '4px', gap: '4px',
    },
    billingBtn: {
        background: 'none', border: 'none', color: '#6b8f7f',
        padding: '0.5rem 1.5rem', borderRadius: '30px', cursor: 'pointer',
        fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        transition: 'all 0.2s',
    },
    billingActive: { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    saveBadge: {
        background: 'rgba(16,185,129,0.2)', color: '#10b981',
        fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px',
    },
    plansGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem', padding: '0 2rem 3rem', maxWidth: '900px', margin: '0 auto',
    },
    planCard: {
        borderRadius: '20px', padding: '2rem', position: 'relative',
        backdropFilter: 'blur(10px)', transition: 'transform 0.2s',
    },
    popularCard: {
        transform: 'scale(1.03)',
        boxShadow: '0 0 40px rgba(245,158,11,0.2)',
    },
    popularBadge: {
        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#000', fontSize: '0.75rem', fontWeight: 700,
        padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
    },
    planIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
    planName: { fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem' },
    priceDisplay: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem' },
    freePrice: { fontSize: '1.8rem', fontWeight: 800, color: '#10b981' },
    currency: { fontSize: '1rem', color: '#a8c0b5', fontWeight: 700 },
    priceNum: { fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b' },
    pricePeriod: { fontSize: '0.9rem', color: '#6b8f7f' },
    yearlyNote: { color: '#6b8f7f', fontSize: '0.78rem', marginBottom: '1rem' },
    featureList: { listStyle: 'none', padding: 0, margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
    featureItem: { display: 'flex', gap: '0.6rem', color: '#c4d8cf', fontSize: '0.85rem', alignItems: 'center' },
    featureExcluded: { color: '#4b5563' },
    currentPlanBtn: {
        width: '100%', padding: '0.8rem', borderRadius: '12px', textAlign: 'center',
        background: 'rgba(255,255,255,0.04)', border: '1px solid',
        fontSize: '0.88rem',
    },
    upgradeBtn: {
        width: '100%', border: 'none', color: '#000',
        padding: '0.9rem', borderRadius: '12px', cursor: 'pointer',
        fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
    },
    consultantSection: { padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' },
    consultantTitle: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' },
    consultantDesc: { color: '#a8c0b5', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' },
    consultantCards: { display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' },
    consultantCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '1.5rem', minWidth: '220px', maxWidth: '260px', textAlign: 'center',
    },
    consultantIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
    consultantCardTitle: { color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.5rem' },
    consultantPrice: { color: '#10b981', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' },
    consultantPer: { fontSize: '0.8rem', color: '#6b8f7f', fontWeight: 400 },
    consultantCardDesc: { color: '#a8c0b5', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1rem' },
    bookBtn: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none', color: '#fff', padding: '0.6rem 1.2rem',
        borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
    },
    faq: { padding: '2rem 2rem 4rem', maxWidth: '700px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' },
    faqTitle: { fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' },
    faqItem: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem',
    },
    faqQ: { color: '#e2e8f0', fontSize: '0.9rem', margin: '0 0 0.4rem' },
    faqA: { color: '#a8c0b5', fontSize: '0.83rem', margin: 0, lineHeight: 1.6 },
};

export default PricingPage;
