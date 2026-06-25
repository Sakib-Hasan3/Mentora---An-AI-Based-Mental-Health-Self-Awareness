import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
    { number: '০১', icon: '📝', title: 'রেজিস্ট্রেশন করুন', desc: '৩০ সেকেন্ডে ফ্রি একাউন্ট তৈরি করুন' },
    { number: '০২', icon: '🧠', title: 'এআই বিশ্লেষণ', desc: 'আপনার মানসিক অবস্থা বিশ্লেষণ করুন' },
    { number: '০৩', icon: '💚', title: 'ব্যক্তিগত পরামর্শ', desc: 'আপনার জন্য ব্যক্তিগত পরামর্শ ও নির্দেশনা' },
    { number: '০৪', icon: '📈', title: 'অগ্রগতি ট্র্যাক', desc: 'নিয়মিত ব্যবহারে আপনার উন্নতি দেখুন' }
];

const HowItWorks = () => {
    return (
        <section className="how-section">
            <div className="section-header">
                <span className="section-tag">🚀 প্রক্রিয়া</span>
                <h2 className="section-title">
                    ৪টি সহজ ধাপে <span style={{ color: '#10b981' }}>শুরু করুন</span>
                </h2>
                <p className="section-subtitle">
                    আপনার মানসিক স্বাস্থ্যের যাত্রা শুরু করতে মাত্র কয়েক মিনিট সময় লাগে
                </p>
            </div>
            
            <div className="steps-grid">
                {steps.map((step, index) => (
                    <div key={index} className="step-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="step-number">{step.number}</div>
                        <div className="step-icon">{step.icon}</div>
                        <h3 className="step-title">{step.title}</h3>
                        <p className="step-desc">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
