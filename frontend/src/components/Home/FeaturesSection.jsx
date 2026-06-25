import React from 'react';

const features = [
    {
        icon: '🧠',
        title: 'এআই-চালিত বিশ্লেষণ',
        desc: 'অত্যাধুনিক এআই মডেল যা ৯৫% নির্ভুলতায় মানসিক অবস্থা শনাক্ত করে',
        color: '#10b981'
    },
    {
        icon: '🔒',
        title: '১০০% গোপনীয়',
        desc: 'আপনার তথ্য সম্পূর্ণ নিরাপদ। কেউ দেখতে পাবে না, শেয়ার করা হবে না',
        color: '#8b5cf6'
    },
    {
        icon: '💬',
        title: '২৪/৭ সাপোর্ট',
        desc: 'যেকোনো সময়, যেকোনো জায়গা থেকে আমাদের সেবা নিতে পারবেন',
        color: '#3b82f6'
    },
    {
        icon: '📊',
        title: 'প্রতিদিনের ট্র্যাকিং',
        desc: 'নিয়মিত আপনার মানসিক স্বাস্থ্যের উন্নতি পর্যবেক্ষণ করুন',
        color: '#f59e0b'
    },
    {
        icon: '👥',
        title: 'কমিউনিটি সাপোর্ট',
        desc: 'একই অভিজ্ঞতা সম্পন্ন মানুষদের সাথে সংযোগ স্থাপন করুন',
        color: '#ec4899'
    },
    {
        icon: '📱',
        title: 'মোবাইল ফ্রেন্ডলি',
        desc: 'যেকোনো ডিভাইস থেকে সহজেই ব্যবহার করতে পারবেন',
        color: '#14b8a6'
    }
];

const FeaturesSection = () => {
    return (
        <section className="features-section">
            <div className="section-header">
                <span className="section-tag">✦ ফিচারসমূহ</span>
                <h2 className="section-title">
                    কেন বেছে নেবেন <span style={{ color: '#10b981' }}>মেন্টাল সাথী</span>?
                </h2>
                <p className="section-subtitle">
                    সহজ, নিরাপদ ও কার্যকর ফিচার যা আপনার মানসিক স্বাস্থ্যের যত্ন নেবে
                </p>
            </div>
            
            <div className="features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                            {feature.icon}
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-desc">{feature.desc}</p>
                        <a href="#" className="feature-link">
                            আরও জানুন →
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
