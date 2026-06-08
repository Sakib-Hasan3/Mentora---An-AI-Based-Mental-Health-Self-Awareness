import React, { useState } from 'react';
import MentalHealthCheck from './MentalHealthCheck';

const FloatingWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="floating-widget">
            {isOpen && (
                <div className="floating-window">
                    <div className="floating-header">
                        <h4>🧠 দ্রুত মানসিক স্বাস্থ্য পরীক্ষা</h4>
                        <button className="close-floating" onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    <MentalHealthCheck onClose={() => setIsOpen(false)} isFloating={true} />
                </div>
            )}
            <button className="floating-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '🧠'}
            </button>
        </div>
    );
};

export default FloatingWidget;
