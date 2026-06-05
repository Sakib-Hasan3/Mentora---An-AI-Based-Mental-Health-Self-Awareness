import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/community.css';

const CommunityPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showComments, setShowComments] = useState({});
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        division: '',
        district: '',
        is_anonymous: false,
        tags: []
    });
    const [newComment, setNewComment] = useState({});

    useEffect(() => {
        fetchDivisions();
        fetchPosts();
    }, [selectedDivision]);

    const fetchDivisions = async () => {
        try {
            const data = await api.get('/community/divisions');
            setDivisions(data.divisions);
        } catch (error) {
            console.error('Failed to fetch divisions:', error);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = selectedDivision 
                ? `/community/posts?division=${selectedDivision}`
                : '/community/posts';
            const data = await api.get(url);
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content || !newPost.division) {
            alert('দয়া করে সব তথ্য পূরণ করুন');
            return;
        }

        try {
            await api.post('/community/posts', newPost);
            setShowCreateModal(false);
            setNewPost({
                title: '',
                content: '',
                division: '',
                district: '',
                is_anonymous: false,
                tags: []
            });
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('পোস্ট তৈরি করতে পারেনি');
        }
    };

    const handleLike = async (postId) => {
        try {
            await api.post(`/community/posts/${postId}/like`);
            fetchPosts();
        } catch (error) {
            console.error('Failed to like:', error);
        }
    };

    const handleAddComment = async (postId) => {
        if (!newComment[postId]) return;

        try {
            await api.post(`/community/posts/${postId}/comments`, {
                content: newComment[postId],
                is_anonymous: false
            });
            setNewComment({ ...newComment, [postId]: '' });
            fetchPosts();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const toggleComments = (postId) => {
        setShowComments({
            ...showComments,
            [postId]: !showComments[postId]
        });
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000 / 60);
        
        if (diff < 1) return 'এখনই';
        if (diff < 60) return `${diff} মিনিট আগে`;
        if (diff < 1440) return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
        return `${Math.floor(diff / 1440)} দিন আগে`;
    };

    if (loading) {
        return (
            <div className="books-loading">
                <div className="books-spinner"></div>
            </div>
        );
    }

    return (
        <div className="community-container">
            <div className="community-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>👥 কমিউনিটি ফোরাম</h1>
                <button onClick={() => setShowCreateModal(true)} className="new-chat-btn">
                    + নতুন পোস্ট
                </button>
            </div>

            <div className="community-content">
                {/* Sidebar */}
                <div className="community-sidebar">
                    <h3 className="sidebar-title">📍 বিভাগ</h3>
                    <div className="divisions-list">
                        <button
                            className={`division-btn ${!selectedDivision ? 'active' : ''}`}
                            onClick={() => setSelectedDivision('')}
                        >
                            🎯 সব বিভাগ
                        </button>
                        {divisions.map(div => (
                            <button
                                key={div.name}
                                className={`division-btn ${selectedDivision === div.name ? 'active' : ''}`}
                                onClick={() => setSelectedDivision(div.name)}
                            >
                                📍 {div.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Feed */}
                <div className="community-feed">
                    {/* Create Post Card */}
                    <div className="create-post-card" onClick={() => setShowCreateModal(true)}>
                        <div className="create-post-header">
                            <div className="create-post-avatar">
                                {user?.name?.charAt(0) || 'ই'}
                            </div>
                            <div className="create-post-input">
                                কী ভাবছেন? আপনার অনুভূতি শেয়ার করুন...
                            </div>
                        </div>
                    </div>

                    {/* Posts */}
                    {posts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <div className="post-user">
                                    <div className="post-avatar">{post.user_avatar}</div>
                                    <div className="post-user-info">
                                        <div className="post-user-name">{post.user_name}</div>
                                        <div className="post-location">
                                            📍 {post.division} {post.district && `, ${post.district}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="post-time">{formatDate(post.created_at)}</div>
                            </div>
                            
                            <h3 className="post-title">{post.title}</h3>
                            <p className="post-content">{post.content}</p>
                            
                            {post.tags && post.tags.length > 0 && (
                                <div className="post-tags">
                                    {post.tags.map((tag, idx) => (
                                        <span key={idx} className="post-tag">#{tag}</span>
                                    ))}
                                </div>
                            )}
                            
                            <div className="post-actions">
                                <button 
                                    className="post-action-btn"
                                    onClick={() => handleLike(post.id)}
                                >
                                    ❤️ {post.likes_count || 0}
                                </button>
                                <button 
                                    className="post-action-btn"
                                    onClick={() => toggleComments(post.id)}
                                >
                                    💬 {post.comments_count || 0}
                                </button>
                            </div>
                            
                            {showComments[post.id] && (
                                <div className="comments-section">
                                    <div className="comment-form">
                                        <input
                                            type="text"
                                            className="comment-input"
                                            placeholder="একটি মন্তব্য লিখুন..."
                                            value={newComment[post.id] || ''}
                                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        />
                                        <button 
                                            className="comment-submit"
                                            onClick={() => handleAddComment(post.id)}
                                        >
                                            পাঠান
                                        </button>
                                    </div>
                                    <div className="comments-list">
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-avatar">👤</div>
                                                <div className="comment-content">
                                                    <div className="comment-user">{comment.user_name}</div>
                                                    <div className="comment-text">{comment.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">নতুন পোস্ট তৈরি করুন</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
                        </div>
                        
                        <div className="modal-field">
                            <label>শিরোনাম</label>
                            <input
                                type="text"
                                placeholder="পোস্টের শিরোনাম"
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            />
                        </div>
                        
                        <div className="modal-field">
                            <label>বিভাগ</label>
                            <select
                                value={newPost.division}
                                onChange={(e) => setNewPost({ ...newPost, division: e.target.value })}
                            >
                                <option value="">বিভাগ নির্বাচন করুন</option>
                                {divisions.map(div => (
                                    <option key={div.name} value={div.name}>{div.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="modal-field">
                            <label>জেলা (ঐচ্ছিক)</label>
                            <select
                                value={newPost.district}
                                onChange={(e) => setNewPost({ ...newPost, district: e.target.value })}
                                disabled={!newPost.division}
                            >
                                <option value="">জেলা নির্বাচন করুন</option>
                                {newPost.division && divisions.find(d => d.name === newPost.division)?.districts.map(dist => (
                                    <option key={dist} value={dist}>{dist}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="modal-field">
                            <label>বিস্তারিত</label>
                            <textarea
                                placeholder="আপনার কথা লিখুন..."
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            />
                        </div>
                        
                        <div className="modal-field modal-checkbox">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={newPost.is_anonymous}
                                onChange={(e) => setNewPost({ ...newPost, is_anonymous: e.target.checked })}
                            />
                            <label htmlFor="anonymous">অ্যানোনিমাস পোস্ট করুন</label>
                        </div>
                        
                        <button className="modal-submit" onClick={handleCreatePost}>
                            পোস্ট করুন
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
