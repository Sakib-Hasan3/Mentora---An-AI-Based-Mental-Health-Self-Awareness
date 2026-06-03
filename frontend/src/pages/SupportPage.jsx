import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [typing, setTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSessions();
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const data = await api.get('/chatbot/sessions');
            setSessions(data.sessions);
            if (data.sessions.length > 0) {
                loadSession(data.sessions[0].session_id);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    const loadSession = async (sessionId) => {
        setCurrentSession(sessionId);
        try {
            const data = await api.get(`/chatbot/history/${sessionId}`);
            setMessages(data.messages);
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const sendMultimodalQuery = async (inputType, content, query) => {
        const formData = new FormData();
        formData.append('input_type', inputType);
        
        if (inputType === 'text') {
            formData.append('text', content);
            formData.append('query', content);
        } else if (inputType === 'image') {
            formData.append('image', content);
            formData.append('query', query || 'এই ছবিতে কি আছে?');
        } else if (inputType === 'pdf') {
            formData.append('pdf', content);
            formData.append('query', query || 'এই ডকুমেন্টে কি লেখা আছে?');
        }
        
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:8000/api/multimodal/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        return response.json();
    };

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || loading) return;

        if (input.trim()) {
            const userMessage = { role: 'user', content: input, type: 'text' };
            setMessages(prev => [...prev, userMessage]);
        }
        
        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            const userMessage = { 
                role: 'user', 
                content: `[${fileType === 'image' ? '🖼️ ছবি' : '📄 PDF'}] ${selectedFile.name}`,
                type: fileType,
                fileUrl: fileUrl,
                fileName: selectedFile.name
            };
            setMessages(prev => [...prev, userMessage]);
        }
        
        const currentInput = input;
        const currentFile = selectedFile;
        const currentFileType = fileType;
        
        setInput('');
        setSelectedFile(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLoading(true);
        setTyping(true);

        try {
            let result;
            
            if (currentFile) {
                result = await sendMultimodalQuery(currentFileType, currentFile, currentInput);
            } else {
                const data = await api.post('/chatbot/chat', { 
                    message: currentInput, 
                    session_id: currentSession 
                });
                result = { response: data.message };
            }
            
            const aiMessage = { 
                role: 'assistant', 
                content: result.response || result.message || "আমি আপনার কথা শুনছি। 💚",
                type: 'text'
            };
            setMessages(prev => [...prev, aiMessage]);
            
            if (!currentFile && result.session_id) {
                setCurrentSession(result.session_id);
                fetchSessions();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'দুঃখিত, সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।',
                type: 'text'
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            setFileType('image');
            setSelectedFile(file);
        } else if (file.type === 'application/pdf') {
            setFileType('pdf');
            setSelectedFile(file);
        } else {
            alert('শুধু ইমেজ (JPG, PNG) অথবা PDF ফাইল আপলোড করতে পারেন');
            e.target.value = '';
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startNewChat = () => {
        setMessages([]);
        setCurrentSession(null);
        setSelectedFile(null);
        setFileType(null);
        inputRef.current?.focus();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const quickQuestions = [
        "আমি অনেক উদ্বিগ্ন বোধ করছি, কি করা উচিত?",
        "স্ট্রেস কমানোর উপায় কি?",
        "ঘুমানোর আগে কি করা ভালো?",
        "আমি একা অনুভব করছি, সাহায্য দরকার",
        "Ami stress kivabe komate pari?",
        "Mon kharap lagche ki korbo?"
    ];

    return (
        <div className="support-container">
            <div className="support-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>💬 ২৪/৭ মাল্টিমোডাল চ্যাটবট</h1>
                <button onClick={startNewChat} className="new-chat-btn">+ নতুন চ্যাট</button>
            </div>

            <div className="chat-layout">
                <div className="chat-sidebar">
                    <h3>চ্যাট ইতিহাস</h3>
                    <div className="session-list">
                        {sessions.map(session => (
                            <div 
                                key={session.session_id}
                                className={`session-item ${currentSession === session.session_id ? 'active' : ''}`}
                                onClick={() => loadSession(session.session_id)}
                            >
                                <div className="session-icon">💬</div>
                                <div className="session-info">
                                    <div className="session-preview">{session.last_message}</div>
                                    <div className="session-time">{new Date(session.last_updated).toLocaleDateString('bn')}</div>
                                </div>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="no-sessions">কোনো চ্যাট নেই</div>
                        )}
                    </div>
                </div>

                <div className="chat-main">
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <div className="welcome-icon">🧠</div>
                                <h2>স্বাগতম!</h2>
                                <p>আমি মেন্টাল সাথীর মাল্টিমোডাল চ্যাটবট। আমি আপনাকে সাহায্য করতে পারি:</p>
                                <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto', color: '#a8c0b5' }}>
                                    <li>📝 টেক্সট প্রশ্নের উত্তর দিতে</li>
                                    <li>🖼️ ছবি আপলোড করে সেটি বিশ্লেষণ করতে</li>
                                    <li>📄 PDF ডকুমেন্ট পড়ে উত্তর দিতে</li>
                                    <li>🧠 মানসিক স্বাস্থ্য বিষয়ে পরামর্শ দিতে</li>
                                </ul>
                                <div className="quick-questions">
                                    <h4>দ্রুত প্রশ্ন:</h4>
                                    <div className="quick-buttons">
                                        {quickQuestions.map((q, idx) => (
                                            <button key={idx} onClick={() => setInput(q)}>
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? user?.name?.charAt(0) || 'ই' : '🤖'}
                                </div>
                                <div className="message-content">
                                    {msg.type === 'image' && msg.fileUrl && (
                                        <div className="message-file">
                                            <img src={msg.fileUrl} alt={msg.fileName} style={{ maxWidth: '200px', borderRadius: '10px', marginBottom: '8px' }} />
                                            <div className="message-filename">{msg.fileName}</div>
                                        </div>
                                    )}
                                    {msg.type === 'pdf' && (
                                        <div className="message-file">
                                            <div style={{ fontSize: '30px' }}>📄</div>
                                            <div className="message-filename">{msg.fileName}</div>
                                        </div>
                                    )}
                                    <div className="message-text">{msg.content}</div>
                                    <div className="message-time">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('bn') : new Date().toLocaleTimeString('bn')}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {typing && (
                            <div className="message bot-message">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <div style={{ width: '100%' }}>
                            {selectedFile && (
                                <div className="selected-file">
                                    <span>{fileType === 'image' ? '🖼️' : '📄'} {selectedFile.name}</span>
                                    <button onClick={removeFile} className="remove-file">✕</button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="attach-btn"
                                    title="ছবি বা PDF আপলোড করুন"
                                >
                                    📎
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="বাংলা বা ইংরেজিতে আপনার প্রশ্ন লিখুন... অথবা ছবি/PDF আপলোড করুন"
                                    rows="2"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={sendMessage} disabled={loading || (!input.trim() && !selectedFile)}>
                                    {loading ? '⏳' : '📤'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;