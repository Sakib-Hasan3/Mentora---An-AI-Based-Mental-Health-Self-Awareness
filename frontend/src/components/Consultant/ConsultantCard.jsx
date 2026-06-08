import React from 'react';

const ConsultantCard = ({ consultant, onBook }) => {
    return (
        <div className="consultant-card">
            <div className="consultant-image">
                {consultant.image ? (
                    <img src={consultant.image} alt={consultant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: '3rem' }}>👨‍⚕️</span>
                )}
            </div>
            <div className="consultant-info">
                <h3 className="consultant-name">{consultant.name_bn || consultant.name}</h3>
                <p className="consultant-degree">{consultant.degree}</p>
                
                <div className="consultant-specialization">
                    {consultant.specialization?.slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="specialization-tag">{spec}</span>
                    ))}
                </div>
                
                <div className="consultant-details">
                    <div className="consultant-rating">
                        ⭐ {consultant.rating} ({consultant.total_reviews})
                    </div>
                    <div className="consultant-fee">
                        ৳{consultant.fee}
                    </div>
                </div>
                
                <div className="consultant-details">
                    <div className="consultant-location">
                        📍 {consultant.division} {consultant.district && `, ${consultant.district}`}
                    </div>
                    <div className="consultant-experience">
                        🎓 {consultant.experience_years} বছর
                    </div>
                </div>
                
                <div className="consultant-availability">
                    <div className="availability-days">
                        🗓️ {consultant.available_days?.slice(0, 3).join(', ')}...
                    </div>
                    <div className="availability-time">
                        ⏰ {consultant.available_time_start} - {consultant.available_time_end}
                    </div>
                </div>
                
                <button 
                    className="book-btn"
                    onClick={() => onBook(consultant)}
                >
                    📅 বুক করুন
                </button>
            </div>
        </div>
    );
};

export default ConsultantCard;
