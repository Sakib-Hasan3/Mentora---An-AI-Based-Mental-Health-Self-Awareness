import React from 'react';

const QuestionCard = ({ question, index, selectedValue, onAnswer }) => {
    return (
        <div className="question-item" data-question-index={index}>
            <div className="question-header">
                <span className="question-icon">{question.icon}</span>
                <span className="question-number">{index + 1}/4</span>
            </div>
            <div className="question-text">{question.text}</div>
            <div className="options-group">
                {question.options.map((opt, idx) => (
                    <button
                        key={idx}
                        className={`option-btn ${selectedValue === question.values[idx] ? 'selected' : ''}`}
                        onClick={() => onAnswer(question.id, question.values[idx])}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;