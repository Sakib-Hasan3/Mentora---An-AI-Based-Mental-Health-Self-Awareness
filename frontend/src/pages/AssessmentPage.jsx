import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/assessment.css';

const AssessmentPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchQuestions();
        fetchStats();
    }, []);

    const fetchQuestions = async () => {
        try {
            const data = await api.get('/assessment/questions');
            setQuestions(data.questions);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.get('/assessment/all');
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleAnswer = (answer) => {
        setAnswers({
            ...answers,
            [currentQuestion]: {
                question_id: currentQuestion + 1,
                question: questions[currentQuestion]?.text,
                answer: answer
            }
        });

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const goToPrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            alert('দয়া করে সব প্রশ্নের উত্তর দিন');
            return;
        }

        setSubmitting(true);
        try {
            const answerList = Object.values(answers);
            const data = await api.post('/assessment/submit', { answers: answerList });
            setResult(data);
            await fetchStats();
        } catch (error) {
            console.error('Failed to submit assessment:', error);
            alert('অ্যাসেসমেন্ট সাবমিট করতে পারেনি');
        } finally {
            setSubmitting(false);
        }
    };

    const resetAssessment = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setResult(null);
    };

    if (loading) {
        return (
            <div className="assessment-loading">
                <div className="assessment-spinner"></div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="assessment-container">
                <div className="assessment-wrapper">
                    <div className="assessment-card">
                        <div className="result-section">
                            <div className="result-emoji">
                                {result.score >= 80 ? '😊' : result.score >= 60 ? '😐' : result.score >= 40 ? '😟' : '😢'}
                            </div>
                            <div className="result-score">{result.score}%</div>
                            <div className="result-score-label">আপনার মানসিক সুস্থতা স্কোর</div>
                            
                            <div className="result-level-card">
                                <div className="result-level">{result.level}</div>
                                <div className="result-advice">{result.advice}</div>
                            </div>
                            
                            {stats && (
                                <div className="stats-section">
                                    <div className="stat-item">
                                        <div className="stat-item-value">{stats.total}</div>
                                        <div className="stat-item-label">মোট অ্যাসেসমেন্ট</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-item-value">{stats.average_score}%</div>
                                        <div className="stat-item-label">গড় স্কোর</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-item-value">{stats.best_score}%</div>
                                        <div className="stat-item-label">সেরা স্কোর</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-item-value">{stats.trend === 'improving' ? '📈' : '📊'}</div>
                                        <div className="stat-item-label">{stats.trend === 'improving' ? 'উন্নতি' : 'স্থিতিশীল'}</div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="result-actions">
                                <button onClick={resetAssessment} className="result-btn retake">
                                    🔄 আবার পরীক্ষা দিন
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="result-btn dashboard">
                                    📊 ড্যাশবোর্ডে যান
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestionData = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="assessment-container">
            <div className="assessment-wrapper">
                <div className="assessment-card">
                    <div className="assessment-header">
                        <div className="assessment-icon">🧠</div>
                        <h1 className="assessment-title">মানসিক স্বাস্থ্য পরীক্ষা</h1>
                        <p className="assessment-subtitle">আপনার মানসিক অবস্থা জানতে ১০টি প্রশ্নের উত্তর দিন</p>
                    </div>
                    
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">অগ্রগতি</span>
                            <span className="progress-count">{currentQuestion + 1} / {questions.length}</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    
                    <div className="question-section">
                        <h2 className="question-text">{currentQuestionData?.text}</h2>
                        <div className="options-grid">
                            {currentQuestionData?.options.map((option, idx) => {
                                const emojis = ['😊', '🙂', '😐', '😟'];
                                const isSelected = answers[currentQuestion]?.answer === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className={`option-card ${isSelected ? 'selected' : ''}`}
                                    >
                                        <span className="option-emoji">{emojis[idx] || '📝'}</span>
                                        <span className="option-text">{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="navigation-buttons">
                        <button 
                            onClick={goToPrevious}
                            disabled={currentQuestion === 0}
                            className="nav-btn"
                        >
                            ← আগের প্রশ্ন
                        </button>
                        
                        {currentQuestion === questions.length - 1 ? (
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting || Object.keys(answers).length !== questions.length}
                                className="nav-btn primary"
                            >
                                {submitting ? 'সাবমিট হচ্ছে...' : '✅ সাবমিট করুন'}
                            </button>
                        ) : (
                            <button 
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                disabled={!answers[currentQuestion]}
                                className="nav-btn primary"
                            >
                                পরবর্তী প্রশ্ন →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;