import React, { useState } from 'react';

const BookingModal = ({ consultant, onClose, onBook }) => {
    const [bookingForm, setBookingForm] = useState({
        date: '',
        time: '',
        type: 'online',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = parseInt(consultant.available_time_start?.split(':')[0]) || 9;
        const endHour = parseInt(consultant.available_time_end?.split(':')[0]) || 17;
        
        for (let i = startHour; i <= endHour; i++) {
            slots.push(`${i}:00`);
            if (i !== endHour) slots.push(`${i}:30`);
        }
        return slots;
    };

    const getMinDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        const yyyy = maxDate.getFullYear();
        const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
        const dd = String(maxDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingForm.date || !bookingForm.time) {
            alert('দয়া করে তারিখ এবং সময় নির্বাচন করুন');
            return;
        }
        setLoading(true);
        try {
            await onBook(consultant.id, bookingForm);
            onClose();
        } catch (error) {
            alert(error.response?.data?.detail || 'বুকিং করতে পারেনি');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        📅 অ্যাপয়েন্টমেন্ট বুক করুন
                        <span style={{ fontSize: '0.8rem', display: 'block', color: '#a8c0b5', marginTop: '0.25rem' }}>
                            {consultant.name_bn || consultant.name}
                        </span>
                    </h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-field">
                        <label>তারিখ নির্বাচন করুন</label>
                        <input
                            type="date"
                            value={bookingForm.date}
                            min={getMinDate()}
                            max={getMaxDate()}
                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="modal-field">
                        <label>সময় নির্বাচন করুন</label>
                        <div className="time-slots">
                            {generateTimeSlots().map((slot, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`time-slot ${bookingForm.time === slot ? 'selected' : ''}`}
                                    onClick={() => setBookingForm({ ...bookingForm, time: slot })}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="modal-field">
                        <label>সেশন টাইপ</label>
                        <select
                            value={bookingForm.type}
                            onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                        >
                            <option value="online">🖥️ অনলাইন (ভিডিও কনসালটেশন)</option>
                            <option value="offline">🏢 অফলাইন (সাক্ষাৎকার)</option>
                        </select>
                    </div>

                    <div className="modal-field">
                        <label>নোটস (ঐচ্ছিক)</label>
                        <textarea
                            rows="3"
                            value={bookingForm.notes}
                            onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                            placeholder="আপনার সমস্যা সম্পর্কে কিছু জানাতে চান?"
                        />
                    </div>

                    <div className="modal-field" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span>সেশন ফি:</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>৳{consultant.fee}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>সেশন সময়:</span>
                            <span>৪৫-৬০ মিনিট</span>
                        </div>
                    </div>

                    <button type="submit" className="modal-submit" disabled={loading}>
                        {loading ? 'বুকিং হচ্ছে...' : '✅ নিশ্চিত করুন'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
