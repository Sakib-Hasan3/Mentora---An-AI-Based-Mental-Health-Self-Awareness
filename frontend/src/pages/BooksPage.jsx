import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/books.css';

const BooksPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState([]);
    const [articles, setArticles] = useState([]);
    const [videos, setVideos] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'books') {
                const data = await api.get('/books/books?page=1&limit=20');
                console.log('Books data:', data);
                setBooks(data.books || []);
            } else if (activeTab === 'articles') {
                const data = await api.get('/books/articles?page=1&limit=20');
                console.log('Articles data:', data);
                setArticles(data.articles || []);
            } else if (activeTab === 'videos') {
                const data = await api.get('/books/videos?page=1&limit=20');
                console.log('Videos data:', data);
                setVideos(data.videos || []);
            } else if (activeTab === 'quotes') {
                const data = await api.get('/books/quotes?page=1&limit=20');
                console.log('Quotes data:', data);
                setQuotes(data.quotes || []);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (type, id) => {
        try {
            await api.post(`/books/${type}/${id}/like`);
            fetchAllData();
        } catch (error) {
            console.error('Failed to like:', error);
        }
    };

    const tabs = [
        { id: 'books', label: '📚 বই', icon: '📚' },
        { id: 'articles', label: '📖 আর্টিকেল', icon: '📖' },
        { id: 'videos', label: '🎬 ভিডিও', icon: '🎬' },
        { id: 'quotes', label: '💬 কোটস', icon: '💬' }
    ];

    if (loading) {
        return (
            <div className="books-loading">
                <div className="books-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="books-container">
                <div className="books-header">
                    <button onClick={() => navigate('/dashboard')} className="back-btn">← ড্যাশবোর্ড</button>
                    <h1>📚 বুক জার্নাল</h1>
                    <div></div>
                </div>
                <div className="books-content">
                    <div className="error-message" style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
                        Error: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="books-container">
            <div className="books-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>📚 বুক জার্নাল</h1>
                <div></div>
            </div>

            <div className="books-content">
                {/* Tabs */}
                <div className="tabs-section">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Books Tab */}
                {activeTab === 'books' && (
                    <div className="books-grid">
                        {books.length === 0 ? (
                            <div className="no-data">কোনো বই পাওয়া যায়নি</div>
                        ) : (
                            books.map(book => (
                                <div key={book.id} className="book-card">
                                    <div className="book-cover">
                                        <span className="book-emoji">📚</span>
                                    </div>
                                    <div className="book-info">
                                        <h3 className="book-title">{book.title_bn || book.title}</h3>
                                        <p className="book-author">{book.author}</p>
                                        <div className="book-stats">
                                            <span>📖 {book.read_count || 0} পড়েছেন</span>
                                            <span>❤️ {book.likes || 0}</span>
                                        </div>
                                        <button 
                                            className="book-action-btn"
                                            onClick={() => handleLike('book', book.id)}
                                        >
                                            👍 লাইক দিন
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                    <div className="articles-grid">
                        {articles.length === 0 ? (
                            <div className="no-data">কোনো আর্টিকেল পাওয়া যায়নি</div>
                        ) : (
                            articles.map(article => (
                                <div key={article.id} className="article-card">
                                    <div className="article-icon">📄</div>
                                    <div className="article-info">
                                        <h3 className="article-title">{article.title_bn || article.title}</h3>
                                        <p className="article-excerpt">{article.excerpt}</p>
                                        <div className="article-meta">
                                            <span>✍️ {article.author}</span>
                                            <span>⏱️ {article.read_time} মিনিট পড়া</span>
                                        </div>
                                        <button className="read-btn">পড়ুন →</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                    <div className="videos-grid">
                        {videos.length === 0 ? (
                            <div className="no-data">কোনো ভিডিও পাওয়া যায়নি</div>
                        ) : (
                            videos.map(video => (
                                <div key={video.id} className="video-card">
                                    <div className="video-thumbnail">
                                        <span className="video-play">▶️</span>
                                    </div>
                                    <div className="video-info">
                                        <h3 className="video-title">{video.title_bn || video.title}</h3>
                                        <p className="video-channel">{video.channel}</p>
                                        <div className="video-stats">
                                            <span>👁️ {video.views} ভিউ</span>
                                            <span>⏱️ {video.duration}</span>
                                        </div>
                                        <button className="watch-btn">ওয়াচ →</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                    <div className="quotes-grid">
                        {quotes.length === 0 ? (
                            <div className="no-data">কোনো কোটস পাওয়া যায়নি</div>
                        ) : (
                            quotes.map(quote => (
                                <div key={quote.id} className="quote-card">
                                    <div className="quote-icon">💬</div>
                                    <div className="quote-content">
                                        <p className="quote-text">"{quote.text_bn || quote.text}"</p>
                                        <p className="quote-author">— {quote.author}</p>
                                        <button 
                                            className="quote-like-btn"
                                            onClick={() => handleLike('quote', quote.id)}
                                        >
                                            ❤️ {quote.likes || 0}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;
