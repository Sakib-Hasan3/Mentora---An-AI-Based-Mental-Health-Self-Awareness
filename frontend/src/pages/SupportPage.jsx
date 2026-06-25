import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const SupportPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'আস্সালামু আলাইকুম! আমি Mentora AI সহায়ক। আমি মানসিক স্বাস্থ্য বিষয়ে আপনাকে সাহায্য করতে এখানে আছি। আপনি কি নিয়ে কথা বলতে চান?',
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const MAX_CHARS = 500;

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage = { role: 'user', content: trimmed, time: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setCharCount(0);
        setLoading(true);
        setTyping(true);

        try {
            // Free users: /chatbot/chat uses Groq API
            const data = await api.post('/chatbot/chat', {
                message: trimmed,
                session_id: sessionId
            });

            const aiMessage = {
                role: 'assistant',
                content: data.message,
                time: new Date(),
                provider: 'groq'
            };
            setMessages(prev => [...prev, aiMessage]);
            if (data.session_id) setSessionId(data.session_id);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'দুঃখিত, এই মুহূর্তে সংযোগ করতে পারছি না। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
                time: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
            setTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) {
            setInput(val);
            setCharCount(val.length);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: 'নতুন কথোপকথন শুরু হলো। আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
            time: new Date()
        }]);
        setSessionId(null);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    };

    const quickTopics = [
        { icon: '😔', text: 'ডিপ্রেশন সম্পর্কে জানতে চাই' },
        { icon: '😰', text: 'উদ্বেগ কমানোর উপায়' },
        { icon: '😴', text: 'ঘুমের সমস্যা নিয়ে কথা বলতে চাই' },
        { icon: '💪', text: 'মানসিক শক্তি বাড়ানোর টিপস' },
        { icon: '🧘', text: 'স্ট্রেস ম্যানেজমেন্ট পরামর্শ' },
        { icon: '❤️', text: 'সম্পর্কের সমস্যা নিয়ে কথা বলতে চাই' }
    ];

    return (
        <div style={{...styles.container, paddingTop: '70px'}}>
            <Header />
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                        ← ড্যাশবোর্ড
                    </button>
                    <div style={styles.headerInfo}>
                        <div style={styles.aiAvatar}>🤖</div>
                        <div>
                            <h2 style={styles.headerTitle}>২৪/৭ সাপোর্ট চ্যাট</h2>
                            <div style={styles.headerSub}>
                                <span style={styles.onlineDot}></span>
                                <span style={styles.onlineText}>সর্বদা অনলাইন • Groq AI</span>
                                <span style={styles.freeBadge}>🆓 বিনামূল্যে</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <button onClick={() => navigate('/pricing')} style={styles.upgradeBtn}>
                        👑 আপগ্রেড
                    </button>
                    <button onClick={clearChat} style={styles.newChatBtn}>
                        + নতুন চ্যাট
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div style={styles.infoBanner}>
                <span style={styles.infoIcon}>ℹ️</span>
                <span style={styles.infoText}>
                    এই চ্যাট Groq AI ব্যবহার করে। পেশাদার চিকিৎসার বিকল্প নয়।
                    <button onClick={() => navigate('/consultants')} style={styles.infoLink}> কনসালট্যান্ট বুক করুন →</button>
                </span>
                <div style={styles.ragPromo}>
                    🧠 RAG Chatbot চাই?
                    <button onClick={() => navigate('/pricing')} style={styles.ragPromoBtn}> আপগ্রেড করুন</button>
                </div>
            </div>

            <div style={styles.chatWrapper}>
                {/* Quick Topics (shown when few messages) */}
                {messages.length <= 1 && (
                    <div style={styles.quickTopics}>
                        <p style={styles.quickTopicsTitle}>💬 দ্রুত বিষয় বেছে নিন:</p>
                        <div style={styles.quickGrid}>
                            {quickTopics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    style={styles.quickBtn}
                                    onClick={() => { setInput(topic.text); inputRef.current?.focus(); }}
                                >
                                    <span style={styles.quickIcon}>{topic.icon}</span>
                                    <span style={styles.quickText}>{topic.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div style={styles.messages}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            ...styles.messageRow,
                            ...(msg.role === 'user' ? styles.userRow : styles.botRow)
                        }}>
                            {msg.role === 'assistant' && (
                                <div style={styles.botAvatar}>🤖</div>
                            )}
                            <div style={{
                                ...styles.bubble,
                                ...(msg.role === 'user' ? styles.userBubble : styles.botBubble),
                                ...(msg.isError ? styles.errorBubble : {})
                            }}>
                                <p style={styles.bubbleText}>{msg.content}</p>
                                <div style={styles.bubbleMeta}>
                                    <span style={styles.timeText}>{formatTime(msg.time)}</span>
                                    {msg.provider === 'groq' && (
                                        <span style={styles.groqTag}>⚡ Groq</span>
                                    )}
                                </div>
                            </div>
                            {msg.role === 'user' && (
                                <div style={styles.userAvatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'আ'}
                                </div>
                            )}
                        </div>
                    ))}

                    {typing && (
                        <div style={{ ...styles.messageRow, ...styles.botRow }}>
                            <div style={styles.botAvatar}>🤖</div>
                            <div style={{ ...styles.bubble, ...styles.botBubble }}>
                                <div style={styles.typingIndicator}>
                                    <span style={styles.typingDot}></span>
                                    <span style={styles.typingDot}></span>
                                    <span style={styles.typingDot}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
                <div style={styles.inputWrapper}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="আপনার মনের কথা লিখুন... (Enter পাঠান, Shift+Enter নতুন লাইন)"
                        style={styles.textarea}
                        rows={2}
                        disabled={loading}
                    />
                    <div style={styles.inputFooter}>
                        <span style={{
                            ...styles.charCount,
                            color: charCount > MAX_CHARS * 0.9 ? '#ef4444' : '#6b7280'
                        }}>
                            {charCount}/{MAX_CHARS}
                        </span>
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                ...styles.sendBtn,
                                opacity: loading || !input.trim() ? 0.5 : 1
                            }}
                        >
                            {loading ? '⏳' : '➤ পাঠান'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    headerRight: { display: 'flex', gap: '0.75rem' },
    backBtn: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#a8c0b5',
        padding: '0.4rem 0.9rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        transition: 'all 0.2s',
    },
    headerInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    aiAvatar: {
        width: '42px', height: '42px',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem',
        boxShadow: '0 0 15px rgba(139,92,246,0.4)',
    },
    headerTitle: { margin: 0, fontSize: '1rem', color: '#e2e8f0', fontWeight: 700 },
    headerSub: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' },
    onlineDot: {
        width: '8px', height: '8px',
        background: '#10b981', borderRadius: '50%',
        boxShadow: '0 0 6px #10b981',
        animation: 'pulse 2s infinite',
    },
    onlineText: { fontSize: '0.72rem', color: '#6b8f7f' },
    freeBadge: {
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.3)',
        color: '#10b981', fontSize: '0.65rem',
        padding: '1px 6px', borderRadius: '10px',
    },
    upgradeBtn: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'none', color: '#000',
        padding: '0.4rem 0.9rem', borderRadius: '8px',
        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
    },
    newChatBtn: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#a8c0b5', padding: '0.4rem 0.9rem',
        borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem',
    },
    infoBanner: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 1.5rem',
        background: 'rgba(59,130,246,0.08)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        flexWrap: 'wrap',
    },
    infoIcon: { fontSize: '0.85rem' },
    infoText: { fontSize: '0.75rem', color: '#6b8f7f' },
    infoLink: {
        background: 'none', border: 'none', color: '#10b981',
        cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem',
    },
    ragPromo: {
        marginLeft: 'auto', fontSize: '0.75rem', color: '#f59e0b',
        display: 'flex', alignItems: 'center', gap: '0.3rem',
    },
    ragPromoBtn: {
        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
        color: '#f59e0b', fontSize: '0.7rem', padding: '2px 8px',
        borderRadius: '6px', cursor: 'pointer',
    },
    chatWrapper: {
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '800px', width: '100%', margin: '0 auto',
        padding: '1rem 1rem 0',
        overflowY: 'auto',
    },
    quickTopics: {
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '16px', padding: '1.2rem',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '1rem',
    },
    quickTopicsTitle: { margin: '0 0 0.8rem', fontSize: '0.85rem', color: '#a8c0b5' },
    quickGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.5rem',
    },
    quickBtn: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '0.6rem 0.8rem',
        color: '#c4d8cf', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        transition: 'all 0.2s', textAlign: 'left',
        fontSize: '0.82rem',
    },
    quickIcon: { fontSize: '1.1rem' },
    quickText: { lineHeight: 1.3 },
    messages: { display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' },
    messageRow: { display: 'flex', gap: '0.75rem', animation: 'fadeIn 0.3s ease' },
    userRow: { flexDirection: 'row-reverse' },
    botRow: { flexDirection: 'row' },
    botAvatar: {
        width: '36px', height: '36px', minWidth: '36px',
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1rem', alignSelf: 'flex-end',
    },
    userAvatar: {
        width: '36px', height: '36px', minWidth: '36px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700,
        color: '#fff', alignSelf: 'flex-end',
    },
    bubble: {
        maxWidth: '70%', padding: '0.9rem 1.1rem',
        borderRadius: '16px', lineHeight: 1.6,
    },
    userBubble: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderBottomRightRadius: '4px',
    },
    botBubble: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottomLeftRadius: '4px',
    },
    errorBubble: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
    },
    bubbleText: { margin: 0, color: '#e2e8f0', fontSize: '0.9rem' },
    bubbleMeta: {
        display: 'flex', gap: '0.5rem', alignItems: 'center',
        marginTop: '0.4rem',
    },
    timeText: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' },
    groqTag: {
        fontSize: '0.6rem', padding: '1px 5px',
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '8px', color: '#10b981',
    },
    typingIndicator: { display: 'flex', gap: '5px', padding: '4px 0' },
    typingDot: {
        width: '8px', height: '8px',
        background: '#6b7280', borderRadius: '50%',
        animation: 'bounce 1.4s infinite',
    },
    inputArea: {
        position: 'sticky', bottom: 0,
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 1.5rem',
    },
    inputWrapper: {
        maxWidth: '800px', margin: '0 auto',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px', padding: '0.75rem 1rem',
    },
    textarea: {
        width: '100%', background: 'transparent',
        border: 'none', outline: 'none',
        color: '#e2e8f0', fontSize: '0.9rem',
        resize: 'none', fontFamily: 'inherit',
        lineHeight: 1.5,
    },
    inputFooter: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: '0.5rem',
    },
    charCount: { fontSize: '0.7rem' },
    sendBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        border: 'none', color: '#fff',
        padding: '0.5rem 1.2rem', borderRadius: '10px',
        cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
        transition: 'all 0.2s',
    },
};

export default SupportPage;
