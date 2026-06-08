import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MentalHealthCheck from '../components/AssessmentWidget/MentalHealthCheck';
import '../styles/assessment-widget.css';

const QuickAssessment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="assessment-widget-container">
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}>
                    ← ড্যাশবোর্ড
                </button>
            </div>
            <MentalHealthCheck />
        </div>
    );
};

export default QuickAssessment;
