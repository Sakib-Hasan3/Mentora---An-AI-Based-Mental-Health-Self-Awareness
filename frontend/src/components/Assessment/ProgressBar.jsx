import React from 'react';

const ProgressBar = ({ current, total, showLabel = true }) => {
    const percentage = ((current + 1) / total) * 100;
    
    return (
        <div className="progress-section">
            {showLabel && (
                <div className="progress-header">
                    <span className="progress-label">অগ্রগতি</span>
                    <span className="progress-count">{current + 1} / {total}</span>
                </div>
            )}
            <div className="progress-bar-track">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                >
                    <div className="progress-glow"></div>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;