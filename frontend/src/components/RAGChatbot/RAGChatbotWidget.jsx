import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import '../../styles/rag-chatbot.css';

const RAGChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const quickQuestions = [
        'ডিপ্রেশন কি?',
        'উদ্বেগ কমানোর উপায়?',
        'স্ট্রেস কমানোর টিপস',
        'মানসিক স্বাস্থ্য সেবা কোথায় পাবো?'
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setTyping(true);

        try {
            const data = await api.post('/rag/chat', {
                message: input,
                session_id: sessionId
            });

            const botMsg = {
                role: 'bot',
                content: data.response,
                context_used: data.context_used
            };
            setMessages(prev => [...prev, botMsg]);
            setSessionId(data.session_id);
        } catch (error) {
            console.error('RAG chat error:', error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'দুঃখিত, সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'
            }]);
        } finally {
            setLoading(false);
            setTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleQuickQuestion = (q) => {
        setInput(q);
        setTimeout(() => sendMessage(), 100);
    };

    return (
        <div className="rag-widget-container">
            {/* Toggle Button */}
            <button
                className="rag-widget-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '🤖'}
                {!isOpen && (
                    <span className="badge">RAG</span>
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="rag-widget-popup">
                    <div className="rag-widget-header">
                        <h4>
                            <span>🧠</span> RAG চ্যাটবট
                        </h4>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className="rag-widget-messages">
                        {messages.length === 0 ? (
                            <div className="rag-empty-state">
                                <div className="icon">🧠</div>
                                <h5>স্বাগতম!</h5>
                                <p>আমি RAG চ্যাটবট। ডকুমেন্ট থেকে তথ্য খুঁজে উত্তর দিই।</p>
                                <div className="rag-quick-questions">
                                    {quickQuestions.map((q, idx) => (
                                        <button key={idx} onClick={() => handleQuickQuestion(q)}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`rag-msg ${msg.role}`}>
                                    <div className="avatar">
                                        {msg.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="bubble">
                                        {msg.content}
                                        {msg.context_used && (
                                            <div className="context-badge">📚 RAG</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {typing && (
                            <div className="rag-msg bot">
                                <div className="avatar">🤖</div>
                                <div className="bubble">
                                    <div className="rag-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="rag-widget-input">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="বাংলায় প্রশ্ন করুন..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button
                            className="send-btn"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? '⏳' : '➤'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RAGChatbotWidget;
