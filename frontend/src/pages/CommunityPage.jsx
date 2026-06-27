import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/Community/PostCard';
import CreatePost from '../components/Community/CreatePost';
import DivisionSelector from '../components/Community/DivisionSelector';
import Header from '../components/Header';
import '../styles/community.css';

const CommunityPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDivisions();
    }, []);

    useEffect(() => {
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

    const handleLike = async (postId) => {
        try {
            await api.post(`/community/posts/${postId}/like`);
            fetchPosts();
        } catch (error) {
            console.error('Failed to like:', error);
        }
    };

    const handleAddComment = async (postId, commentText, isAnonymous) => {
        try {
            await api.post(`/community/posts/${postId}/comments`, {
                content: commentText,
                is_anonymous: isAnonymous
            });
            fetchPosts();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000 / 60);
        
        if (diff < 1) return 'এখনই';
        if (diff < 60) return `${diff} মিনিট আগে`;
        if (diff < 1440) return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
        if (diff < 43200) return `${Math.floor(diff / 1440)} দিন আগে`;
        return d.toLocaleDateString('bn-BD');
    };

    if (loading) {
        return (
            <div className="books-loading">
                <div className="books-spinner"></div>
            </div>
        );
    }

    return (
        <div className="community-container" style={{ paddingTop: '70px' }}>
            <Header />
            <div className="community-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← ড্যাশবোর্ড
                </button>
                <h1>👥 কমিউনিটি ফোরাম</h1>
                <div style={{ width: '100px' }}></div>
            </div>

            <div className="community-content">
                {/* Division Selector Sidebar */}
                <DivisionSelector 
                    divisions={divisions}
                    selectedDivision={selectedDivision}
                    onSelectDivision={setSelectedDivision}
                />

                {/* Main Feed */}
                <div className="community-feed">
                    {/* Create Post Component */}
                    <CreatePost 
                        divisions={divisions}
                        onPostCreated={fetchPosts}
                        user={user}
                    />

                    {/* Posts List */}
                    {posts.length === 0 ? (
                        <div className="no-data" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <p style={{ color: '#a8c0b5' }}>কোনো পোস্ট নেই। প্রথম পোস্ট করুন!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onComment={handleAddComment}
                                currentUser={user}
                                formatDate={formatDate}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
