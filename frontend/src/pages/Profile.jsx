import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Header from '../components/Header';
import '../styles/profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        location: ''
    });

    // Sync profile state when user context is loaded
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '01712345678',
                age: user.age || '২৫',
                gender: user.gender || 'পুরুষ',
                location: user.location || 'ঢাকা, বাংলাদেশ'
            });
        }
    }, [user]);

    // Fetch user statistics from the dashboard API
    useEffect(() => {
        const fetchProfileStats = async () => {
            try {
                const data = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats for profile:', error);
            }
        };
        fetchProfileStats();
    }, []);

    const handleChange = (key, value) => {
        setProfile(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        if (!profile.name.trim()) {
            alert('নাম খালি রাখা যাবে না!');
            return;
        }

        // Update local auth context (which syncs with storage)
        const updatedUser = {
            ...user,
            name: profile.name,
            phone: profile.phone,
            age: profile.age,
            gender: profile.gender,
            location: profile.location
        };
        
        updateUser(updatedUser);
        setIsEditing(false);
        setSuccessMessage('🎉 আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
        
        // Hide success message after 4 seconds
        setTimeout(() => {
            setSuccessMessage('');
        }, 4000);
    };

    const isPremium = user?.user_type === 'paid';

    return (
        <div className="profile-container">
            <Header />
            
            <main className="profile-content">
                {/* Success Notification Banner */}
                {successMessage && (
                    <div className="profile-notification">
                        <span>✅</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Profile Header Banner */}
                <div className="profile-banner-card">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-circle">
                            {profile.name ? profile.name.charAt(0) : 'U'}
                        </div>
                    </div>
                    
                    <div className="profile-info-header">
                        <h1 className="profile-name-title">{profile.name || 'সদস্য'}</h1>
                        <div className="profile-sub-details">
                            <span className={`profile-tag ${isPremium ? 'premium' : ''}`}>
                                {isPremium ? '💎 প্রিমিয়াম মেম্বার' : '🌿 ফ্রি মেম্বার'}
                            </span>
                            <span className="profile-join-date">
                                📅 জয়েন করেছেন: {stats?.member_since || 'জুন ২০২৪'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Premium Banner Upgrade Card (if user is Free) */}
                {!isPremium && (
                    <div className="profile-upgrade-card">
                        <div className="profile-upgrade-text">
                            <h3>👑 প্রিমিয়ামে আপগ্রেড করুন!</h3>
                            <p>আনলক করুন আনলিমিটেড AI আরএজি চ্যাটবট, প্রোফাইল ট্র্যাকিং এবং থেরাপিস্টদের সাথে সরাসরি মিটিং বুকিং।</p>
                        </div>
                        <button 
                            className="profile-upgrade-btn"
                            onClick={() => window.location.href = '/pricing'}
                        >
                            আপগ্রেড করুন
                        </button>
                    </div>
                )}

                {/* Quick Stats Summary */}
                <div className="profile-stats-grid">
                    <div className="profile-stat-item">
                        <div className="profile-stat-icon">🧠</div>
                        <div className="profile-stat-value">৭৮%</div>
                        <div className="profile-stat-label">সুস্থতা স্কোর</div>
                    </div>
                    <div className="profile-stat-item">
                        <div className="profile-stat-icon">📝</div>
                        <div className="profile-stat-value">{stats?.total_assessments || 0}টি</div>
                        <div className="profile-stat-label">সম্পন্ন পরীক্ষা</div>
                    </div>
                    <div className="profile-stat-item">
                        <div className="profile-stat-icon">🧘</div>
                        <div className="profile-stat-value">{stats?.meditation_sessions || 0}টি</div>
                        <div className="profile-stat-label">মেডিটেশন সেশন</div>
                    </div>
                </div>

                {/* Personal Information Form */}
                <div className="profile-details-card">
                    <div className="profile-card-header">
                        <h2>🧑‍💼 ব্যক্তিগত তথ্য</h2>
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    // Reset profile data
                                    setProfile({
                                        name: user?.name || '',
                                        email: user?.email || '',
                                        phone: user?.phone || '01712345678',
                                        age: user?.age || '২৫',
                                        gender: user?.gender || 'পুরুষ',
                                        location: user?.location || 'ঢাকা, বাংলাদেশ'
                                    });
                                }
                                setIsEditing(!isEditing);
                            }}
                            className={`profile-edit-btn ${isEditing ? 'cancel' : ''}`}
                        >
                            {isEditing ? 'বাতিল করুন' : 'সম্পাদনা করুন'}
                        </button>
                    </div>

                    <div className="profile-form-grid">
                        {/* Name */}
                        <div className="profile-form-group">
                            <label className="profile-label">আপনার নাম</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">👤</span>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    disabled={!isEditing}
                                    className="profile-input"
                                    placeholder="আপনার নাম লিখুন"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="profile-form-group">
                            <label className="profile-label">ইমেইল ঠিকানা (পরিবর্তনযোগ্য নয়)</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">✉️</span>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled={true}
                                    className="profile-input"
                                    placeholder="rahim@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="profile-form-group">
                            <label className="profile-label">মোবাইল নম্বর</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">📞</span>
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    disabled={!isEditing}
                                    className="profile-input"
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
                        </div>

                        {/* Age */}
                        <div className="profile-form-group">
                            <label className="profile-label">আপনার বয়স</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">🎂</span>
                                <input
                                    type="text"
                                    value={profile.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    disabled={!isEditing}
                                    className="profile-input"
                                    placeholder="বয়স (উদা. ২৫)"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="profile-form-group">
                            <label className="profile-label">লিঙ্গ</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">🚻</span>
                                <select
                                    value={profile.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    disabled={!isEditing}
                                    className="profile-input profile-select"
                                >
                                    <option value="পুরুষ">পুরুষ</option>
                                    <option value="নারী">নারী</option>
                                    <option value="অন্যান্য">অন্যান্য</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="profile-form-group">
                            <label className="profile-label">ঠিকানা</label>
                            <div className="profile-input-wrapper">
                                <span className="profile-input-icon">📍</span>
                                <input
                                    type="text"
                                    value={profile.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    disabled={!isEditing}
                                    className="profile-input"
                                    placeholder="শহর, দেশ"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="profile-action-footer">
                            <button 
                                onClick={handleSave}
                                className="profile-save-btn"
                            >
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;