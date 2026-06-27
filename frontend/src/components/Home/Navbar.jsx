import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const handleScrollEvent = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScrollEvent);
        return () => window.removeEventListener('scroll', handleScrollEvent);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setShowMobileMenu(false);
    };

    return (
        <nav className={`home-navbar ${scrolled ? 'home-navbar-scrolled' : ''}`}>
            <div className="home-navbar-container">
                {/* Logo */}
                <div className="home-navbar-logo" onClick={() => navigate('/')}>
                    <span className="logo-icon">🧠</span>
                    <div className="logo-text">
                        <h2>মেন্টাল সাথী</h2>
                        <p>by Mentora</p>
                    </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="home-navbar-links">
                    <button onClick={() => scrollToSection('features')} className="home-nav-link-btn">ফিচারসমূহ</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="home-nav-link-btn">প্রক্রিয়া</button>
                    <button onClick={() => scrollToSection('stats')} className="home-nav-link-btn">পরিসংখ্যান</button>
                    <button onClick={() => scrollToSection('footer')} className="home-nav-link-btn">যোগাযোগ</button>
                </div>

                {/* CTA Buttons */}
                <div className="home-navbar-actions">
                    {user ? (
                        <Link to="/dashboard" className="home-btn-primary">
                            📊 ড্যাশবোর্ড
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="home-btn-secondary">লগইন</Link>
                            <Link to="/signup" className="home-btn-primary">নিবন্ধন</Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Toggle */}
                <button 
                    className="home-mobile-toggle"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    aria-label="Toggle Navigation"
                >
                    {showMobileMenu ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="home-mobile-menu">
                    <button onClick={() => scrollToSection('features')} className="home-mobile-nav-link">ফিচারসমূহ</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="home-mobile-nav-link">প্রক্রিয়া</button>
                    <button onClick={() => scrollToSection('stats')} className="home-mobile-nav-link">পরিসংখ্যান</button>
                    <button onClick={() => scrollToSection('footer')} className="home-mobile-nav-link">যোগাযোগ</button>
                    
                    <div className="home-mobile-actions">
                        {user ? (
                            <Link to="/dashboard" className="home-mobile-btn-primary" onClick={() => setShowMobileMenu(false)}>
                                📊 ড্যাশবোর্ড
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="home-mobile-btn-secondary" onClick={() => setShowMobileMenu(false)}>লগইন</Link>
                                <Link to="/signup" className="home-mobile-btn-primary" onClick={() => setShowMobileMenu(false)}>নিবন্ধন</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
