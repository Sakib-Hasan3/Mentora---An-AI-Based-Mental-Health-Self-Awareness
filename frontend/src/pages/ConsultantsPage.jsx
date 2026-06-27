import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ConsultantCard from '../components/Consultant/ConsultantCard';
import BookingModal from '../components/Consultant/BookingModal';
import FilterBar from '../components/Consultant/FilterBar';
import Header from '../components/Header';
import '../styles/consultant.css';

const ConsultantsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [consultants, setConsultants] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ division: '', specialization: '', min_rating: '', max_fee: '' });

    const divisions = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
    const specializations = ['ডিপ্রেশন', 'এংজাইটি', 'স্ট্রেস', 'CBT', 'চাইল্ড সাইকোলজি', 'সাইকোসিস', 'বাইপোলার'];

    useEffect(() => {
        fetchConsultants();
        fetchMyBookings();
    }, [filters]);

    const fetchConsultants = async () => {
        setLoading(true);
        try {
            let url = '/consultants/?';
            if (filters.division) url += `division=${filters.division}&`;
            if (filters.specialization) url += `specialization=${filters.specialization}&`;
            if (filters.min_rating) url += `min_rating=${filters.min_rating}&`;
            const data = await api.get(url);
            let consultantList = data.consultants || [];
            if (filters.max_fee) {
                consultantList = consultantList.filter(c => c.fee <= parseInt(filters.max_fee));
            }
            setConsultants(consultantList);
        } catch (error) {
            console.error('Failed to fetch consultants:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const data = await api.get('/consultants/my-bookings');
            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const handleBook = async (consultantId, bookingData) => {
        await api.post(`/consultants/${consultantId}/book`, bookingData);
        alert('অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!');
        fetchMyBookings();
    };

    const cancelBooking = async (bookingId) => {
        if (window.confirm('আপনি কি এই বুকিং বাতিল করতে চান?')) {
            try {
                await api.put(`/consultants/bookings/${bookingId}/cancel`);
                fetchMyBookings();
            } catch (error) {
                alert('বুকিং বাতিল করতে পারেনি');
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        setFilters({ division: '', specialization: '', min_rating: '', max_fee: '' });
    };

    if (loading) return <div className="loading-spinner"><div className="books-spinner"></div></div>;

    return (
        <div className="consultant-container" style={{ paddingTop: '70px' }}>
            <Header />
            <div className="consultant-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">← ড্যাশবোর্ড</button>
                <h1>🧑‍⚕️ মেন্টাল কনসালট্যান্ট</h1>
                <div style={{ width: '80px' }}></div>
            </div>

            <div className="consultant-content">
                <FilterBar 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                    divisions={divisions}
                    specializations={specializations}
                />

                <div>
                    <div className="consultants-grid">
                        {consultants.map(consultant => (
                            <ConsultantCard 
                                key={consultant.id}
                                consultant={consultant}
                                onBook={(c) => { setSelectedConsultant(c); setShowModal(true); }}
                            />
                        ))}
                        {consultants.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#a8c0b5' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
                                <p>কোনো কনসালট্যান্ট পাওয়া যায়নি</p>
                            </div>
                        )}
                    </div>

                    <div className="my-bookings-section">
                        <h3 className="section-title">📋 আমার অ্যাপয়েন্টমেন্ট</h3>
                        {bookings.length === 0 ? (
                            <p style={{ color: '#a8c0b5', textAlign: 'center', padding: '1rem' }}>কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                        ) : (
                            <div className="bookings-list">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="booking-card">
                                        <div className="booking-info">
                                            <div className="booking-consultant">{booking.consultant_name_bn || booking.consultant_name}</div>
                                            <div className="booking-datetime">
                                                📅 {booking.date} | 🕐 {booking.time} | {booking.type === 'online' ? '🖥️ অনলাইন' : '🏢 অফলাইন'}
                                            </div>
                                            {booking.meeting_link && (
                                                <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: '0.75rem' }}>
                                                    🔗 জয়েন করুন
                                                </a>
                                            )}
                                        </div>
                                        <span className={`booking-status status-${booking.status}`}>
                                            {booking.status === 'pending' ? 'pending' : booking.status === 'confirmed' ? 'নিশ্চিত' : 'বাতিল'}
                                        </span>
                                        {booking.status !== 'cancelled' && (
                                            <button className="cancel-btn" onClick={() => cancelBooking(booking.id)}>বাতিল করুন</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && selectedConsultant && (
                <BookingModal 
                    consultant={selectedConsultant}
                    onClose={() => setShowModal(false)}
                    onBook={handleBook}
                />
            )}
        </div>
    );
};

export default ConsultantsPage;
