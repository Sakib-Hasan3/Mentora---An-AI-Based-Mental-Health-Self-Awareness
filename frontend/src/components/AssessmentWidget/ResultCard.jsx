import React from 'react';

const ResultCard = ({ result, onReset, onClose, isFloating }) => {
    const riskPercentage = Math.round(result.risk_score * 100);
    const needsTreatment = result.needs_treatment;

    const getRiskColor = () => {
        if (riskPercentage >= 70) return '#ef4444';
        if (riskPercentage >= 50) return '#f59e0b';
        return '#10b981';
    };

    const getRiskText = () => {
        if (riskPercentage >= 70) return 'উচ্চ ঝুঁকি';
        if (riskPercentage >= 50) return 'মাঝারি ঝুঁকি';
        return 'কম ঝুঁকি';
    };

    return (
        <div className="assessment-card">
            <div className="assessment-header">
                <div className="assessment-icon">📊</div>
                <h2 className="assessment-title">আপনার বিশ্লেষণ ফলাফল</h2>
            </div>

            <div className="result-container">
                <div className="risk-meter">
                    <div className="risk-meter-label">
                        <span>কম ঝুঁকি</span>
                        <span>মধ্যম</span>
                        <span>উচ্চ ঝুঁকি</span>
                    </div>
                    <div className="risk-meter-bar">
                        <div 
                            className="risk-meter-fill" 
                            style={{ 
                                width: `${riskPercentage}%`,
                                background: `linear-gradient(90deg, #10b981, #f59e0b, #ef4444)`
                            }}
                        >
                            <span className="risk-meter-value">{riskPercentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="result-risk-card" style={{ borderColor: getRiskColor() }}>
                    <div className="result-risk-value" style={{ color: getRiskColor() }}>
                        {riskPercentage}%
                    </div>
                    <div className="result-risk-level">
                        {getRiskText()}
                        <span className="risk-badge" style={{ background: getRiskColor() }}>
                            {needsTreatment ? '⚠️' : '💚'}
                        </span>
                    </div>
                </div>

                <div className="result-recommendation-card">
                    <div className="recommendation-header">
                        <span className="recommendation-icon">📋</span>
                        <span className="recommendation-title">ব্যক্তিগত পরামর্শ</span>
                    </div>
                    <div className="recommendation-text">
                        {result.recommendation_bn || result.recommendation}
                    </div>
                    {result.recommendation_source && (
                        <div className="recommendation-source">
                            <span className="source-badge">
                                {result.recommendation_source === 'groq' ? '🤖 AI (Groq)' : 
                                 result.recommendation_source === 'huggingface' ? '🤖 AI (HuggingFace)' : 
                                 '📋 ফallback'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="result-footer">
                    <div className="confidence-info">
                        <span className="confidence-icon">🎯</span>
                        <span className="confidence-text">
                            মডেল নির্ভুলতা: {result.confidence}% 
                            <span className="confidence-note">(Stacking Ensemble)</span>
                        </span>
                    </div>
                    <div className="feature-importance">
                        <details>
                            <summary>📊 ফিচারের গুরুত্ব</summary>
                            <ul>
                                <li>👨‍👩‍👧‍👦 পারিবারিক ইতিহাস: 60%</li>
                                <li>🏥 সেবার সুযোগ: 29%</li>
                                <li>💼 স্ব-নিয়োজিত: 5.5%</li>
                                <li>👤 লিঙ্গ: 5.2%</li>
                            </ul>
                        </details>
                    </div>
                </div>

                <div className="result-actions">
                    <button className="result-action-btn retake" onClick={onReset}>
                        🔄 আবার পরীক্ষা দিন
                    </button>
                    {needsTreatment && (
                        <button className="result-action-btn help" onClick={() => window.location.href = '/consultants'}>
                            👨‍⚕️ বিশেষজ্ঞের সাথে কথা বলুন
                        </button>
                    )}
                    {isFloating && onClose && (
                        <button className="result-action-btn close" onClick={onClose}>
                            ✕ বন্ধ করুন
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                .result-container {
                    animation: fadeIn 0.5s ease;
                }
                .risk-meter {
                    margin-bottom: 1.5rem;
                }
                .risk-meter-label {
                    display: flex;
                    justify-content: space-between;
                    color: #a8c0b5;
                    font-size: 0.7rem;
                    margin-bottom: 0.25rem;
                }
                .risk-meter-bar {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    height: 8px;
                    overflow: hidden;
                }
                .risk-meter-fill {
                    height: 100%;
                    border-radius: 10px;
                    position: relative;
                    transition: width 0.5s ease;
                }
                .risk-meter-value {
                    position: absolute;
                    right: 0;
                    top: -20px;
                    font-size: 0.7rem;
                    color: #eff8f3;
                }
                .result-risk-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px solid;
                    border-radius: 16px;
                    padding: 1rem;
                    text-align: center;
                    margin-bottom: 1rem;
                }
                .result-risk-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                }
                .result-risk-level {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: #a8c0b5;
                }
                .risk-badge {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: white;
                }
                .result-recommendation-card {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 16px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .recommendation-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .recommendation-icon {
                    font-size: 1.2rem;
                }
                .recommendation-title {
                    color: #10b981;
                    font-weight: 600;
                }
                .recommendation-text {
                    color: #a8c0b5;
                    line-height: 1.6;
                }
                .recommendation-source {
                    margin-top: 0.5rem;
                    text-align: right;
                }
                .source-badge {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    background: rgba(16, 185, 129, 0.15);
                    border-radius: 12px;
                    font-size: 0.7rem;
                    color: #10b981;
                }
                .result-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                }
                .confidence-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #a8c0b5;
                    font-size: 0.8rem;
                }
                .confidence-note {
                    font-size: 0.65rem;
                    color: #6b7280;
                }
                .feature-importance details {
                    cursor: pointer;
                    color: #a8c0b5;
                    font-size: 0.75rem;
                }
                .feature-importance ul {
                    margin-top: 0.5rem;
                    padding-left: 1rem;
                    color: #6b7280;
                    font-size: 0.7rem;
                }
                .result-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .result-action-btn {
                    flex: 1;
                    padding: 0.6rem;
                    border-radius: 30px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                }
                .result-action-btn.retake {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #a8c0b5;
                }
                .result-action-btn.help {
                    background: #10b981;
                    color: white;
                }
                .result-action-btn.close {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                .result-action-btn:hover {
                    transform: translateY(-2px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spinner-small {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    margin-left: 0.3rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResultCard;