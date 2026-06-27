import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { name: 'ড্যাশবোর্ড', icon: '🏠', path: '/dashboard' },
        { name: 'অ্যাসেসমেন্ট', icon: '🧠', path: '/assessment' },
        { name: 'দ্রুত পরীক্ষা', icon: '⚡', path: '/quick-assessment' },
        { name: 'অগ্রগতি', icon: '📊', path: '/progress' },
        { name: 'বুক জার্নাল', icon: '📚', path: '/books' },
        { name: 'কমিউনিটি', icon: '👥', path: '/community' },
        { name: 'বিশেষজ্ঞ', icon: '🧑‍⚕️', path: '/consultants' },
        { name: 'সাপোর্ট', icon: '💬', path: '/support' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header" onClick={() => navigate('/dashboard')}>
                <div className="sidebar-logo">M</div>
                <h1>Mentora</h1>
            </div>
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink key={item.name} to={item.path} className="sidebar-nav-item">
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        <span className="sidebar-nav-text">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-footer-card">
                    <h3>Need Help?</h3>
                    <p>Check our support section for assistance.</p>
                    <button onClick={() => navigate('/support')}>Get Help</button>
                </div>
                <button onClick={logout} className="sidebar-logout">
                    <span className="sidebar-nav-icon">🚪</span>
                    <span className="sidebar-nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
