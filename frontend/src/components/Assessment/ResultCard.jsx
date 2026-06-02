import React from 'react';

const ResultCard = ({ result, stats, onRetake, onDashboard }) => {
    const getEmoji = (score) => {
        if (score >= 80) return '😊';
        if (score >= 60) return '😐';
        if (score >= 40) return '😟';
        return '😢';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return '📈';
        if (trend === 'declining') return '📉';
        return '📊';
    };

    const getTrendText = (trend) => {
        if (trend === 'improving') return 'উন্নতি';
        if (trend === 'declining') return 'পতন';
        return 'স্থিতিশীল';
    };

    return (
        <div className="result-section">
            <div className="result-emoji">
                {getEmoji(result?.score)}
            </div>
            <div className="result-score">{result?.score}%</div>
            <div className="result-score-label">আপনার মানসিক সুস্থতা স্কোর</div>
            
            <div className="result-level-card">
                <div className="result-level">{result?.level}</div>
                <div className="result-advice">{result?.advice}</div>
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
                        <div className="stat-item-value">{getTrendIcon(stats.trend)}</div>
                        <div className="stat-item-label">{getTrendText(stats.trend)}</div>
                    </div>
                </div>
            )}
            
            <div className="result-actions">
                <button onClick={onRetake} className="result-btn retake">
                    🔄 আবার পরীক্ষা দিন
                </button>
                <button onClick={onDashboard} className="result-btn dashboard">
                    📊 ড্যাশবোর্ডে যান
                </button>
            </div>
        </div>
    );
};

export default ResultCard;