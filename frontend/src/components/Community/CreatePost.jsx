import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const CreatePost = ({ divisions, onPostCreated, user }) => {
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        division: '',
        district: '',
        is_anonymous: false,
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddTag = () => {
        if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
            setNewPost({
                ...newPost,
                tags: [...newPost.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setNewPost({
            ...newPost,
            tags: newPost.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async () => {
        if (!newPost.title || !newPost.content || !newPost.division) {
            alert('দয়া করে সব তথ্য পূরণ করুন');
            return;
        }

        setLoading(true);
        try {
            await api.post('/community/posts', newPost);
            setShowModal(false);
            setNewPost({
                title: '',
                content: '',
                division: '',
                district: '',
                is_anonymous: false,
                tags: []
            });
            setTagInput('');
            onPostCreated();
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('পোস্ট তৈরি করতে পারেনি');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Create Post Trigger */}
            <div className="create-post-card" onClick={() => setShowModal(true)}>
                <div className="create-post-header">
                    <div className="create-post-avatar">
                        {user?.name?.charAt(0) || 'ই'}
                    </div>
                    <div className="create-post-input">
                        কী ভাবছেন? আপনার অনুভূতি শেয়ার করুন...
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">নতুন পোস্ট তৈরি করুন</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
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
                            <label>ট্যাগ (ঐচ্ছিক)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="ট্যাগ লিখুন (যেমন: স্ট্রেস)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    style={{ flex: 1 }}
                                />
                                <button type="button" onClick={handleAddTag} className="tag-add-btn">যোগ করুন</button>
                            </div>
                            <div className="post-tags" style={{ marginTop: '0.5rem' }}>
                                {newPost.tags.map((tag, idx) => (
                                    <span key={idx} className="post-tag" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)}>
                                        #{tag} ✕
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="modal-field">
                            <label>বিস্তারিত</label>
                            <textarea
                                placeholder="আপনার কথা লিখুন..."
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                rows="5"
                            />
                        </div>
                        
                        <div className="modal-field modal-checkbox">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={newPost.is_anonymous}
                                onChange={(e) => setNewPost({ ...newPost, is_anonymous: e.target.checked })}
                            />
                            <label htmlFor="anonymous">অ্যানোনিমাস পোস্ট করুন (নাম প্রকাশ করা হবে না)</label>
                        </div>
                        
                        <button 
                            className="modal-submit" 
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'পোস্ট হচ্ছে...' : '📢 পোস্ট করুন'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePost;
