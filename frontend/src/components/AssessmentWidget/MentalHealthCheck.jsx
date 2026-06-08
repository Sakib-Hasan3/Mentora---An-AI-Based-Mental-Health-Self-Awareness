import React, { useState } from 'react';
import { api } from '../../services/api';
import QuestionCard from './QuestionCard';
import ResultCard from './ResultCard';

const MentalHealthCheck = ({ onClose, isFloating = false }) => {
    const [answers, setAnswers] = useState({
        family_history: '',
        care_options: '',
        self_employed: '',
        gender: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const questions = [
        {
            id: 'family_history',
            text: 'পরিবারের কোনো সদস্যের কি মানসিক স্বাস্থ্য সমস্যার ইতিহাস আছে?',
            options: ['হ্যাঁ', 'না'],
            values: ['Yes', 'No'],
            icon: '👨‍👩‍👧‍👦'
        },
        {
            id: 'care_options',
            text: 'আপনি কি মানসিক স্বাস্থ্য সেবা গ্রহণের সুযোগ পান?',
            options: ['হ্যাঁ', 'না', 'নিশ্চিত নই'],
            values: ['Yes', 'No', 'Not sure'],
            icon: '🏥'
        },
        {
            id: 'self_employed',
            text: 'আপনি কি স্ব-নিয়োজিত (ফ্রিল্যান্সার/ব্যবসায়ী)?',
            options: ['হ্যাঁ', 'না'],
            values: ['Yes', 'No'],
            icon: '💼'
        },
        {
            id: 'gender',
            text: 'আপনার লিঙ্গ কি?',
            options: ['পুরুষ', 'মহিলা'],
            values: ['Male', 'Female'],
            icon: '👤'
        }
    ];

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        for (const [key, value] of Object.entries(answers)) {
            if (!value) {
                alert('দয়া করে সব প্রশ্নের উত্তর দিন');
                return;
            }
        }

        setLoading(true);
        try {
            const response = await api.post('/ml-assessment/predict', answers);
            setResult(response);
            setSubmitted(true);
        } catch (error) {
            console.error('Assessment failed:', error);
            alert('মূল্যায়ন করতে পারেনি। আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setAnswers({
            family_history: '',
            care_options: '',
            self_employed: '',
            gender: ''
        });
        setResult(null);
        setSubmitted(false);
    };

    const isComplete = Object.values(answers).every(v => v !== '');

    if (submitted && result) {
        return (
            <ResultCard 
                result={result} 
                onReset={handleReset} 
                onClose={onClose} 
                isFloating={isFloating} 
            />
        );
    }

    return (
        <div className="assessment-card">
            <div className="assessment-header">
                <div className="assessment-icon">🧠</div>
                <h2 className="assessment-title">দ্রুত মানসিক স্বাস্থ্য পরীক্ষা</h2>
                <p className="assessment-subtitle">৪টি প্রশ্নের উত্তর দিন। AI মডেল বিশ্লেষণ করবে।</p>
                <div className="confidence-badge" style={{ marginTop: '0.5rem' }}>
                    🎯 মডেল নির্ভুলতা: 71.55%
                </div>
            </div>

            {questions.map((q, idx) => (
                <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    selectedValue={answers[q.id]}
                    onAnswer={handleAnswer}
                />
            ))}

            <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!isComplete || loading}
            >
                {loading ? (
                    <span>🔍 বিশ্লেষণ করা হচ্ছে... <span className="spinner-small"></span></span>
                ) : (
                    '🔍 বিশ্লেষণ করুন'
                )}
            </button>

            {isFloating && onClose && (
                <button className="reset-btn" onClick={onClose} style={{ marginTop: '0.5rem' }}>
                    ✕ বন্ধ করুন
                </button>
            )}
        </div>
    );
};

export default MentalHealthCheck;