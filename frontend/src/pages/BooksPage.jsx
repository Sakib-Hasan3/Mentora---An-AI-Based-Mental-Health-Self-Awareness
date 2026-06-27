import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
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
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'books') {
                const data = await api.get('/books/books?page=1&limit=20');
                setBooks(data.books || []);
            } else if (activeTab === 'articles') {
                const data = await api.get('/books/articles?page=1&limit=20');
                setArticles(data.articles || []);
            } else if (activeTab === 'videos') {
                const data = await api.get('/books/videos?page=1&limit=20');
                setVideos(data.videos || []);
            } else if (activeTab === 'quotes') {
                const data = await api.get('/books/quotes?page=1&limit=20');
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

    // বই ওপেন করার ফাংশন
    const openBook = (book) => {
        if (book.file_url) {
            window.open(book.file_url, '_blank');
        } else {
            alert(`"${book.title_bn || book.title}" - এই বইটি পড়ার জন্য লিংক যোগ করা হয়নি।`);
        }
    };

    // ভিডিও চালানোর ফাংশন
    const playVideo = (video) => {
        if (video.youtube_url) {
            let videoId = video.youtube_url.split('v=')[1] || video.youtube_url.split('/').pop();
            if (videoId.includes('&')) videoId = videoId.split('&')[0];
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            window.open(embedUrl, '_blank');
        } else {
            alert(`"${video.title_bn || video.title}" - এই ভিডিওটি চালানোর জন্য লিংক যোগ করা হয়নি।`);
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
        <div className="books-container" style={{ paddingTop: '70px' }}>
            <Header />
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
                                <div key={book.id} className="book-card" onClick={() => openBook(book)} style={{ cursor: 'pointer' }}>
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike('book', book.id);
                                            }}
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
                                <div key={video.id} className="video-card" onClick={() => playVideo(video)} style={{ cursor: 'pointer' }}>
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
                                        <button 
                                            className="watch-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playVideo(video);
                                            }}
                                        >
                                            ওয়াচ →
                                        </button>
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

            {/* Video Modal */}
            {selectedVideo && (
                <div className="video-modal" onClick={() => setSelectedVideo(null)}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="video-modal-close" onClick={() => setSelectedVideo(null)}>✕</button>
                        <iframe
                            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                            title="YouTube Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPage;
