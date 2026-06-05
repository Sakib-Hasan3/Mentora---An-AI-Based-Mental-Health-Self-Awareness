import React, { useState } from 'react';

const CommentSection = ({ postId, comments, onAddComment, formatDate }) => {
    const [newComment, setNewComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        
        setLoading(true);
        try {
            await onAddComment(postId, newComment, isAnonymous);
            setNewComment('');
            setIsAnonymous(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comments-section">
            <div className="comment-form">
                <textarea
                    className="comment-input"
                    placeholder="আপনার মন্তব্য লিখুন..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="2"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <label className="anonymous-checkbox">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>অ্যানোনিমাস</span>
                    </label>
                    <button 
                        className="comment-submit"
                        onClick={handleSubmit}
                        disabled={loading || !newComment.trim()}
                    >
                        {loading ? 'পাঠানো হচ্ছে...' : '💬 মন্তব্য করুন'}
                    </button>
                </div>
            </div>
            
            <div className="comments-list">
                {comments && comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.user_name === 'অনামিকা' ? '🤫' : '👤'}
                            </div>
                            <div className="comment-content">
                                <div className="comment-user">
                                    {comment.user_name}
                                    <span className="comment-time">{formatDate(comment.created_at)}</span>
                                </div>
                                <div className="comment-text">{comment.content}</div>
                                <div className="comment-actions">
                                    <button className="comment-like-btn">
                                        ❤️ {comment.likes_count || 0}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-comments">
                        💬 কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
