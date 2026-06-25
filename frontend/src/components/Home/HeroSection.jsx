import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-background">
                <div className="hero-gradient-1"></div>
                <div className="hero-gradient-2"></div>
            </div>
            
            <div className="hero-content">
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    <span>এআই-চালিত মানসিক স্বাস্থ্য সাথী</span>
                </div>
                
                <h1 className="hero-title">
                    আপনার মানসিক স্বাস্থ্যের
                    <span className="hero-title-gradient">বিশ্বস্ত সঙ্গী</span>
                </h1>
                
                <p className="hero-description">
                    আমরা বুঝি, মানসিক চাপ কতটা কষ্টের। বিনামূল্যে, নিরাপদ ও গোপনীয় 
                    মানসিক স্বাস্থ্য পরামর্শ নিন।
                </p>
                
                <div className="hero-buttons">
                    <Link to="/signup" className="btn-hero-primary">
                        🎯 একাউন্ট তৈরি করুন
                    </Link>
                    <Link to="/login" className="btn-hero-secondary">
                        🔐 লগইন করুন
                    </Link>
                </div>
                
                <div className="hero-trust">
                    <span className="trust-item">
                        <span className="trust-item-icon">🔒</span> ১০০% গোপনীয়
                    </span>
                    <span className="trust-item">
                        <span className="trust-item-icon">💚</span> বিনামূল্যে
                    </span>
                    <span className="trust-item">
                        <span className="trust-item-icon">🇧🇩</span> বাংলাদেশিদের জন্য
                    </span>
                    <span className="trust-item">
                        <span className="trust-item-icon">🤖</span> AI-চালিত বিশ্লেষণ
                    </span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
