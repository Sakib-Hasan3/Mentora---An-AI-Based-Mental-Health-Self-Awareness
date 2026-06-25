import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturesGrid = () => {
    const navigate = useNavigate();

    const features = [
        { 
            icon: '🧠', 
            title: 'মানসিক স্বাস্থ্য পরীক্ষা', 
            desc: 'এআই-চালিত বিশ্লেষণ পান',
            route: '/assessment',
            color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        { 
            icon: '⚡', 
            title: 'দ্রুত মানসিক স্বাস্থ্য পরীক্ষা', 
            desc: '৪টি প্রশ্নে ঝুঁকি বিশ্লেষণ (71.55% নির্ভুল)',
            route: '/quick-assessment',
            color: 'linear-gradient(135deg, #10b981, #059669)',
            isNew: true
        },
        { 
            icon: '📊', 
            title: 'প্রগ্রেস ট্র্যাকিং', 
            desc: 'আপনার উন্নতি পর্যবেক্ষণ করুন',
            route: '/progress',
            color: 'linear-gradient(135deg, #10b981, #059669)'
        },
        { 
            icon: '📚', 
            title: 'বুক জার্নাল', 
            desc: 'মানসিক স্বাস্থ্য সম্পর্কিত বই পড়ুন',
            route: '/books',
            color: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        { 
            icon: '👥', 
            title: 'কমিউনিটি', 
            desc: 'ডিভিশন ভিত্তিক গ্রুপ চ্যাট',
            route: '/community',
            color: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        { 
            icon: '🧑‍⚕️', 
            title: 'কনসালট্যান্ট', 
            desc: 'বিশেষজ্ঞের সাথে পরামর্শ করুন',
            route: '/consultants',
            color: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        { 
            icon: '💬', 
            title: '২৪/৭ সাপোর্ট', 
            desc: 'যেকোনো সময় সাহায্য নিন',
            route: '/support',
            color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        { 
            icon: '🤖', 
            title: 'RAG চ্যাটবট', 
            desc: 'নলেজ বেস থেকে স্মার্ট উত্তর পান',
            route: '/support',
            color: 'linear-gradient(135deg, #f97316, #ea580c)'
        },
        { 
            icon: '🔒', 
            title: 'গোপনীয়তা', 
            desc: 'আপনার তথ্য নিরাপদ',
            route: '/privacy',
            color: 'linear-gradient(135deg, #6b7280, #4b5563)'
        },
        { 
            icon: '📱', 
            title: 'মোবাইল ফ্রেন্ডলি', 
            desc: 'যেকোনো ডিভাইসে ব্যবহার করুন',
            route: '/mobile',
            color: 'linear-gradient(135deg, #14b8a6, #0d9488)'
        }
    ];

    return (
        <div className="features-section">
            <div className="section-header"><h3 className="section-title">🌟 মেন্টাল সাথীর বিশেষ ফিচারসমূহ</h3></div>
            <div className="features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="feature-item" onClick={() => navigate(feature.route)} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon" style={{ background: feature.color }}>{feature.icon}</div>
                        <div className="feature-text">
                            <h4>{feature.title} {feature.isNew && <span className="new-badge">NEW</span>}</h4>
                            <p>{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturesGrid;