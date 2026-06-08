import React, { useState } from 'react';
import { api } from '../../services/api';

const ReviewSection = ({ consultantId, reviews, onReviewAdded }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            alert('দয়া করে একটি মন্তব্য লিখুন');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/consultants/${consultantId}/review`, { rating, comment });
            setShowReviewForm(false);
            setRating(5);
            setComment('');
            onReviewAdded();
        } catch (error) {
            alert('রিভিউ দিতে পারেনি');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="reviews-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#eff8f3' }}>📝 রিভিউ ({reviews?.length || 0})</h4>
                <button 
                    className="review-btn"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', color: '#10b981', cursor: 'pointer' }}
                >
                    {showReviewForm ? 'বাতিল করুন' : '✍️ রিভিউ দিন'}
                </button>
            </div>

            {showReviewForm && (
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ color: '#a8c0b5', fontSize: '0.85rem' }}>রেটিং</label>
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{ fontSize: '1.5rem', cursor: 'pointer', color: (hoverRating || rating) >= star ? '#f59e0b' : '#a8c0b5' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <textarea
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.5rem', color: '#eff8f3' }}
                        />
                    </div>
                    <button 
                        onClick={handleSubmitReview}
                        disabled={loading}
                        style={{ background: '#10b981', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                    >
                        {loading ? 'পাঠানো হচ্ছে...' : '📤 রিভিউ পাঠান'}
                    </button>
                </div>
            )}

            <div className="reviews-list">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        <div key={idx} className="review-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="review-user">{review.user_name}</div>
                                <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
                            </div>
                            <div className="review-comment">{review.comment}</div>
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>{formatDate(review.created_at)}</div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#a8c0b5', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
