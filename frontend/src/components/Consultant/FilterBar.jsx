import React from 'react';

const FilterBar = ({ filters, onFilterChange, onReset, divisions, specializations }) => {
    return (
        <div className="filter-sidebar">
            <h3 className="filter-title">🔍 ফিল্টার করুন</h3>
            
            <div className="filter-group">
                <label className="filter-label">বিভাগ</label>
                <select 
                    className="filter-select" 
                    value={filters.division} 
                    onChange={(e) => onFilterChange('division', e.target.value)}
                >
                    <option value="">সব বিভাগ</option>
                    {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">বিশেষজ্ঞতা</label>
                <select 
                    className="filter-select" 
                    value={filters.specialization} 
                    onChange={(e) => onFilterChange('specialization', e.target.value)}
                >
                    <option value="">সব</option>
                    {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">ন্যূনতম রেটিং</label>
                <select 
                    className="filter-select" 
                    value={filters.min_rating} 
                    onChange={(e) => onFilterChange('min_rating', e.target.value)}
                >
                    <option value="">সব</option>
                    <option value="4">⭐ ৪+ স্টার</option>
                    <option value="3">⭐ ৩+ স্টার</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">সর্বোচ্চ ফি</label>
                <select 
                    className="filter-select" 
                    value={filters.max_fee} 
                    onChange={(e) => onFilterChange('max_fee', e.target.value)}
                >
                    <option value="">সব</option>
                    <option value="500">৳৫০০ এর কম</option>
                    <option value="1000">৳১০০০ এর কম</option>
                    <option value="1500">৳১৫০০ এর কম</option>
                </select>
            </div>

            <button className="filter-reset" onClick={onReset}>
                🔄 ফিল্টার রিসেট
            </button>

            {/* Stats */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#eff8f3', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📊 তথ্য</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span>মোট কনসালট্যান্ট</span>
                    <span style={{ color: '#10b981' }}>১২+</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span>অনলাইন সেশন</span>
                    <span style={{ color: '#10b981' }}>সব কনসালট্যান্ট</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5', fontSize: '0.8rem' }}>
                    <span>গড় রেটিং</span>
                    <span style={{ color: '#f59e0b' }}>⭐ 4.8</span>
                </div>
            </div>

            {/* Help */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#eff8f3', fontSize: '0.9rem', marginBottom: '0.5rem' }}>💡 জরুরি হেল্পলাইন</h4>
                <div style={{ color: '#a8c0b5', fontSize: '0.8rem' }}>
                    <p>📞 জাতীয় হেল্পলাইন: <strong style={{ color: '#10b981' }}>১৬২৬৩</strong></p>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>২৪/৭ মানসিক স্বাস্থ্য সহায়তা</p>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
