import React, { useState } from 'react';
import { api } from '../../services/api';
import { FULL_QUESTIONS } from '../../data/questions';
import ResultCard from './ResultCard';

const FullAssessment = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const totalQuestions = FULL_QUESTIONS.length;

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = () => {
        const currentQuestion = FULL_QUESTIONS[currentStep];
        if (!answers[currentQuestion.id]) {
            alert('দয়া করে উত্তর দিন');
            return;
        }
        if (currentStep < totalQuestions - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        for (const q of FULL_QUESTIONS) {
            if (!answers[q.id]) {
                alert(`দয়া করে "${q.text}" প্রশ্নের উত্তর দিন`);
                setCurrentStep(FULL_QUESTIONS.indexOf(q));
                return;
            }
        }

        setLoading(true);
        try {
            const response = await api.post('/ml-assessment/predict-full', answers);
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
        setAnswers({});
        setResult(null);
        setSubmitted(false);
        setCurrentStep(0);
    };

    if (submitted && result) {
        return (
            <ResultCard 
                result={result} 
                onReset={handleReset} 
            />
        );
    }

    const currentQuestion = FULL_QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / totalQuestions) * 100;

    return (
        <div className="assessment-card full-assessment">
            <div className="assessment-header">
                <div className="assessment-icon">🧠</div>
                <h2 className="assessment-title">সম্পূর্ণ মানসিক স্বাস্থ্য পরীক্ষা</h2>
                <p className="assessment-subtitle">
                    প্রশ্ন {currentStep + 1} / {totalQuestions}
                </p>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="confidence-badge">
                    🎯 মডেল নির্ভুলতা: 71.55%
                </div>
            </div>

            <div className="question-container">
                <div className="question-item full">
                    <div className="question-header">
                        <span className="question-icon">{currentQuestion.icon}</span>
                        <span className="question-number">{currentStep + 1}/{totalQuestions}</span>
                    </div>
                    <div className="question-text">{currentQuestion.text}</div>
                    <div className="options-grid full">
                        {currentQuestion.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`option-btn full ${answers[currentQuestion.id] === currentQuestion.values[idx] ? 'selected' : ''}`}
                                onClick={() => handleAnswer(currentQuestion.id, currentQuestion.values[idx])}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="navigation-buttons">
                <button
                    className="nav-btn prev"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                >
                    ← আগের প্রশ্ন
                </button>
                <button
                    className="nav-btn next"
                    onClick={handleNext}
                    disabled={loading}
                >
                    {currentStep === totalQuestions - 1 ? (
                        loading ? 'সাবমিট হচ্ছে...' : '✅ সাবমিট করুন'
                    ) : (
                        'পরবর্তী প্রশ্ন →'
                    )}
                </button>
            </div>
        </div>
    );
};

export default FullAssessment;