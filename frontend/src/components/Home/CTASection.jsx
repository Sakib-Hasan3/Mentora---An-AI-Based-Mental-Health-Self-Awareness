import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="cta-section">
            <div className="cta-card">
                <h2 className="cta-title">
                    আজই শুরু করুন আপনার <span style={{ color: '#10b981' }}>মানসিক স্বাস্থ্যের</span> যাত্রা
                </h2>
                <p className="cta-desc">
                    ২ মিনিটে ফ্রি একাউন্ট তৈরি করুন এবং ব্যক্তিগত পরামর্শ পেতে শুরু করুন
                </p>
                <div className="cta-buttons">
                    <Link to="/signup" className="btn-hero-primary">
                        🎯 বিনামূল্যে শুরু করুন
                    </Link>
                    <Link to="/login" className="btn-hero-secondary">
                        🔐 লগইন করুন
                    </Link>
                </div>
                <p style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                    🔒 ক্রেডিট কার্ড লাগবে না। ১০ সেকেন্ডে সাইনআপ করুন।
                </p>
            </div>
        </section>
    );
};

export default CTASection;
