import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/Assessment/QuestionCard';
import ResultCard from '../components/Assessment/ResultCard';
import ProgressBar from '../components/Assessment/ProgressBar';
import Header from '../components/Header';
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
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
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
                        <div className="assessment-header">
                            <div className="assessment-icon">🧠</div>
                            <h1 className="assessment-title">আপনার ফলাফল</h1>
                            <p className="assessment-subtitle">আপনার মানসিক স্বাস্থ্য পরীক্ষার ফলাফল</p>
                        </div>
                        <ResultCard 
                            result={result}
                            stats={stats}
                            onRetake={resetAssessment}
                            onDashboard={() => navigate('/dashboard')}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestionData = questions[currentQuestion];

    return (
        <div className="assessment-container" style={{ paddingTop: '70px' }}>
            <Header />
            <div className="assessment-wrapper">
                <div className="assessment-card">
                    <div className="assessment-header">
                        <div className="assessment-icon">🧠</div>
                        <h1 className="assessment-title">মানসিক স্বাস্থ্য পরীক্ষা</h1>
                        <p className="assessment-subtitle">আপনার মানসিক অবস্থা জানতে ১০টি প্রশ্নের উত্তর দিন</p>
                    </div>
                    
                    <ProgressBar 
                        current={currentQuestion} 
                        total={questions.length} 
                        showLabel={true}
                    />
                    
                    <QuestionCard
                        question={currentQuestionData}
                        currentQuestion={currentQuestion}
                        totalQuestions={questions.length}
                        selectedAnswer={answers[currentQuestion]?.answer}
                        onAnswer={handleAnswer}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;