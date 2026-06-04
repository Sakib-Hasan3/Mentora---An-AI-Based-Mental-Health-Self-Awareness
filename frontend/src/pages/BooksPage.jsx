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
    const [featured, setFeatured] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchAllData();
    }, [activeTab, selectedCategory]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [booksData, articlesData, videosData, quotesData, featuredData, categoriesData] = await Promise.all([
                api.get(`/books/books?page=1&limit=12${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`),
                api.get(`/books/articles?page=1&limit=8${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`),
                api.get(`/books/videos?page=1&limit=6${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`),
                api.get(`/books/quotes?page=1&limit=6${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`),
                api.get('/books/featured'),
                api.get('/books/categories')
            ]);
            
            setBooks(booksData.books || []);
            setArticles(articlesData.articles || []);
            setVideos(videosData.videos || []);
            setQuotes(quotesData.quotes || []);
            setFeatured(featuredData);
            setCategories(categoriesData.categories || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
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
                {/* Categories */}
                <div className="categories-section">
                    <div className="categories-scroll">
                        <button 
                            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            🎯 সব
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.name}
                                className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.name)}
                            >
                                {cat.icon} {cat.name_bn}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Section */}
                {featured && (
                    <div className="featured-section">
                        <h2 className="section-title">✨ সাপ্তাহিক সুপারিশ</h2>
                        <div className="featured-grid">
                            {featured.featured_books?.slice(0, 2).map(book => (
                                <div key={book.id} className="featured-card">
                                    <div className="featured-icon">📚</div>
                                    <div className="featured-info">
                                        <h3>{book.title_bn || book.title}</h3>
                                        <p>{book.author}</p>
                                        <button className="read-btn">পড়ুন →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                        {books.map(book => (
                            <div key={book.id} className="book-card">
                                <div className="book-cover">
                                    <span className="book-emoji">📚</span>
                                </div>
                                <div className="book-info">
                                    <h3 className="book-title">{book.title_bn || book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                    <div className="book-stats">
                                        <span>📖 {book.read_count} পড়েছেন</span>
                                        <span>❤️ {book.likes}</span>
                                    </div>
                                    <button 
                                        className="book-action-btn"
                                        onClick={() => handleLike('book', book.id)}
                                    >
                                        👍 লাইক দিন
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                    <div className="articles-grid">
                        {articles.map(article => (
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
                        ))}
                    </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                    <div className="videos-grid">
                        {videos.map(video => (
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
                        ))}
                    </div>
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                    <div className="quotes-grid">
                        {quotes.map(quote => (
                            <div key={quote.id} className="quote-card">
                                <div className="quote-icon">💬</div>
                                <div className="quote-content">
                                    <p className="quote-text">"{quote.text_bn || quote.text}"</p>
                                    <p className="quote-author">— {quote.author}</p>
                                    <button 
                                        className="quote-like-btn"
                                        onClick={() => handleLike('quote', quote.id)}
                                    >
                                        ❤️ {quote.likes}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;
