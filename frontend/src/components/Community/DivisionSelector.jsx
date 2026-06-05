import React from 'react';

const DivisionSelector = ({ divisions, selectedDivision, onSelectDivision }) => {
    return (
        <div className="community-sidebar">
            <h3 className="sidebar-title">📍 বিভাগ অনুযায়ী ফিল্টার</h3>
            <div className="divisions-list">
                <button
                    className={`division-btn ${!selectedDivision ? 'active' : ''}`}
                    onClick={() => onSelectDivision('')}
                >
                    🎯 সব বিভাগ
                </button>
                {divisions.map(div => (
                    <button
                        key={div.name}
                        className={`division-btn ${selectedDivision === div.name ? 'active' : ''}`}
                        onClick={() => onSelectDivision(div.name)}
                    >
                        📍 {div.name}
                    </button>
                ))}
            </div>
            
            {/* Stats */}
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="sidebar-title">📊 কমিউনিটি স্ট্যাটস</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5' }}>
                        <span>মোট সদস্য</span>
                        <span style={{ color: '#10b981' }}>1,234</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5' }}>
                        <span>মোট পোস্ট</span>
                        <span style={{ color: '#10b981' }}>567</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a8c0b5' }}>
                        <span>সক্রিয় সদস্য</span>
                        <span style={{ color: '#10b981' }}>89</span>
                    </div>
                </div>
            </div>
            
            {/* Guidelines */}
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="sidebar-title">📋 কমিউনিটি গাইডলাইন</h3>
                <ul style={{ color: '#a8c0b5', fontSize: '0.8rem', lineHeight: '1.6', paddingLeft: '1rem' }}>
                    <li>🤝 সবাইকে সম্মান করুন</li>
                    <li>🔒 ব্যক্তিগত তথ্য শেয়ার করবেন না</li>
                    <li>💚 মানসিক স্বাস্থ্য নিয়ে ইতিবাচক আলোচনা করুন</li>
                    <li>🚫 ঘৃণামূলক বক্তব্য থেকে বিরত থাকুন</li>
                    <li>📞 জরুরি প্রয়োজনে হেল্পলাইন: ১৬২৬৩</li>
                </ul>
            </div>
        </div>
    );
};

export default DivisionSelector;
