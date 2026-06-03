import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssessmentPage from './pages/AssessmentPage';
import ProgressPage from './pages/ProgressPage';
import SupportPage from './pages/SupportPage';
import './styles/globals.css';
import './styles/dashboard.css';
import './styles/assessment.css';
import './styles/progress.css';
import './styles/support.css';

const ComingSoon = ({ title }) => (
    <div className="dashboard-container">
        <main className="dashboard-main">
            <div className="chart-section" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚧</div>
                <h2 className="chart-title">{title}</h2>
                <p className="stat-title" style={{ marginTop: '10px' }}>এই ফিচারটি শীঘ্রই আসছে!</p>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="action-btn"
                    style={{ marginTop: '30px', background: '#10b981', color: 'white' }}
                >
                    ← ড্যাশবোর্ডে ফিরুন
                </button>
            </div>
        </main>
    </div>
);

function AppRoutes() {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/assessment" element={user ? <AssessmentPage /> : <Navigate to="/login" />} />
            <Route path="/progress" element={user ? <ProgressPage /> : <Navigate to="/login" />} />
            <Route path="/support" element={user ? <SupportPage /> : <Navigate to="/login" />} />
            
            {/* Coming Soon Routes */}
            <Route path="/assessment/history" element={user ? <ComingSoon title="অ্যাসেসমেন্ট ইতিহাস" /> : <Navigate to="/login" />} />
            <Route path="/books" element={user ? <ComingSoon title="বুক জার্নাল" /> : <Navigate to="/login" />} />
            <Route path="/community" element={user ? <ComingSoon title="কমিউনিটি" /> : <Navigate to="/login" />} />
            <Route path="/consultants" element={user ? <ComingSoon title="মেন্টাল কনসালট্যান্ট" /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ComingSoon title="প্রোফাইল" /> : <Navigate to="/login" />} />
            <Route path="/privacy" element={user ? <ComingSoon title="গোপনীয়তা" /> : <Navigate to="/login" />} />
            <Route path="/mobile" element={user ? <ComingSoon title="মোবাইল অ্যাপ" /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <ComingSoon title="নোটিফিকেশন" /> : <Navigate to="/login" />} />
            <Route path="/activities" element={user ? <ComingSoon title="সব কার্যকলাপ" /> : <Navigate to="/login" />} />
            <Route path="/stress-management" element={user ? <ComingSoon title="স্ট্রেস ম্যানেজমেন্ট" /> : <Navigate to="/login" />} />
            <Route path="/meditation" element={user ? <ComingSoon title="মেডিটেশন" /> : <Navigate to="/login" />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;