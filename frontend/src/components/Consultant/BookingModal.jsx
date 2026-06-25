import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// ── Payment Method Config ──────────────────────────────────────────────────
const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'কার্ড',
        icon: '💳',
        color: '#3b82f6',
        fields: ['number', 'name', 'expiry', 'cvv'],
    },
    {
        id: 'bkash',
        label: 'bKash',
        icon: null,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bkash_Logo.png/640px-Bkash_Logo.png',
        color: '#e2136e',
        fields: ['mobileNumber'],
    },
    {
        id: 'nagad',
        label: 'Nagad',
        icon: null,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nagad-Logo.png/640px-Nagad-Logo.png',
        color: '#f97316',
        fields: ['mobileNumber'],
    },
    {
        id: 'rocket',
        label: 'Rocket',
        icon: '🚀',
        color: '#7c3aed',
        fields: ['mobileNumber', 'pin'],
    },
];

// ── PDF Generator (proper PDF format) ────────────────────────────────────
const generatePDFContent = (booking, user, paymentMethod) => {
    const methodLabel =
        paymentMethod === 'bkash' ? 'bKash' :
        paymentMethod === 'nagad' ? 'Nagad' :
        paymentMethod === 'rocket' ? 'Rocket' :
        'ক্রেডিট/ডেবিট কার্ড';

    // Build a proper HTML receipt, then convert to a printable PDF-like page
    return `%PDF-LIKE
MENTORA Mental Health Platform
Booking Receipt / বুকিং রসিদ

Reference     : ${booking.ref}
Issued On     : ${new Date().toLocaleDateString('en-BD')}

Patient Name  : ${booking.userName}
Patient Email : ${user?.email || 'N/A'}

Consultant    : ${booking.consultant}
Date          : ${booking.date}
Time          : ${booking.time}
Session Type  : ${booking.type === 'online' ? 'Online Video Consultation' : 'Offline Visit'}

Session Fee   : BDT ${booking.fee}
Payment Via   : ${methodLabel}
Payment Status: COMPLETED ✓

------------------------------------------
Thank you for using Mentora.
Support: support@mentora.com
`;
};

const printHTMLReceipt = (booking, user, paymentMethod) => {
    const methodLabel =
        paymentMethod === 'bkash' ? 'bKash' :
        paymentMethod === 'nagad' ? 'Nagad' :
        paymentMethod === 'rocket' ? 'Rocket' :
        'ক্রেডিট/ডেবিট কার্ড';

    const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<title>Mentora Booking Receipt - ${booking.ref}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f5f5f5; display:flex; justify-content:center; padding:40px 20px; }
  .receipt { background:#fff; max-width:480px; width:100%; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.12); }
  .header { background:linear-gradient(135deg,#10b981,#059669); color:#fff; padding:28px 32px; text-align:center; }
  .header h1 { margin:0; font-size:1.6rem; letter-spacing:1px; }
  .header p { margin:4px 0 0; opacity:.85; font-size:.9rem; }
  .badge { display:inline-block; background:rgba(255,255,255,.2); border-radius:30px; padding:4px 16px; font-size:.8rem; margin-top:12px; }
  .body { padding:28px 32px; }
  .ref-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; text-align:center; margin-bottom:20px; }
  .ref-box .label { font-size:.75rem; color:#6b7280; text-transform:uppercase; letter-spacing:.5px; }
  .ref-box .value { font-size:1.2rem; font-weight:700; color:#059669; margin-top:4px; }
  .section { margin-bottom:20px; }
  .section h3 { font-size:.75rem; color:#9ca3af; text-transform:uppercase; letter-spacing:.5px; margin:0 0 10px; border-bottom:1px solid #f3f4f6; padding-bottom:6px; }
  .row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:.88rem; }
  .row .k { color:#6b7280; }
  .row .v { color:#111827; font-weight:500; text-align:right; }
  .total-row { background:#f0fdf4; border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; margin-top:12px; }
  .total-row .k { color:#059669; font-weight:600; }
  .total-row .v { color:#059669; font-weight:700; font-size:1.1rem; }
  .status { display:inline-flex; align-items:center; gap:4px; background:#dcfce7; color:#16a34a; padding:4px 12px; border-radius:20px; font-size:.8rem; font-weight:600; }
  .footer { background:#f9fafb; border-top:1px solid #f3f4f6; padding:16px 32px; text-align:center; font-size:.78rem; color:#9ca3af; }
  @media print { body{background:#fff;padding:0;} .receipt{box-shadow:none;} }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>🧠 Mentora</h1>
    <p>মানসিক স্বাস্থ্য সেবা প্ল্যাটফর্ম</p>
    <div class="badge">বুকিং রসিদ / Booking Receipt</div>
  </div>
  <div class="body">
    <div class="ref-box">
      <div class="label">বুকিং রেফারেন্স</div>
      <div class="value">${booking.ref}</div>
    </div>

    <div class="section">
      <h3>রোগীর তথ্য</h3>
      <div class="row"><span class="k">নাম</span><span class="v">${booking.userName}</span></div>
      <div class="row"><span class="k">ইমেইল</span><span class="v">${user?.email || 'N/A'}</span></div>
    </div>

    <div class="section">
      <h3>অ্যাপয়েন্টমেন্ট তথ্য</h3>
      <div class="row"><span class="k">কনসালট্যান্ট</span><span class="v">${booking.consultant}</span></div>
      <div class="row"><span class="k">তারিখ</span><span class="v">${booking.date}</span></div>
      <div class="row"><span class="k">সময়</span><span class="v">${booking.time}</span></div>
      <div class="row"><span class="k">সেশন</span><span class="v">${booking.type === 'online' ? '🖥️ অনলাইন' : '🏢 অফলাইন'}</span></div>
    </div>

    <div class="section">
      <h3>পেমেন্ট তথ্য</h3>
      <div class="row"><span class="k">পেমেন্ট পদ্ধতি</span><span class="v">${methodLabel}</span></div>
      <div class="row"><span class="k">স্ট্যাটাস</span><span class="v"><span class="status">✓ সম্পন্ন</span></span></div>
      <div class="total-row">
        <span class="k">মোট পরিশোধ</span>
        <span class="v">৳${booking.fee}</span>
      </div>
    </div>

    <p style="font-size:.78rem;color:#9ca3af;margin-top:20px;text-align:center;">
      ${new Date().toLocaleString('en-BD')}
    </p>
  </div>
  <div class="footer">
    ধন্যবাদ Mentora ব্যবহার করার জন্য।<br/>
    সমস্যায়: <strong>support@mentora.com</strong>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;
    return html;
};

// ── Main Component ────────────────────────────────────────────────────────
const BookingModal = ({ consultant, onClose, onBook }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [bookingForm, setBookingForm] = useState({ date: '', time: '', type: 'online', notes: '' });
    const [selectedMethod, setSelectedMethod] = useState('bkash');
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [mobileData, setMobileData] = useState({ mobileNumber: '', pin: '' });
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);

    const sessionFee = bookingForm.type === 'online' ? (consultant.fee || 500) : ((consultant.fee || 500) + 300);

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

    const getMinDate = () => new Date().toISOString().split('T')[0];
    const getMaxDate = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; };

    const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (val) => { const d = val.replace(/\D/g, '').slice(0, 4); return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
    const formatMobile = (val) => val.replace(/\D/g, '').slice(0, 11);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        if (!bookingForm.date || !bookingForm.time) { alert('দয়া করে তারিখ এবং সময় নির্বাচন করুন'); return; }
        setStep(2);
    };

    const validatePayment = () => {
        if (selectedMethod === 'card') {
            if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
                alert('সমস্ত কার্ড তথ্য পূরণ করুন'); return false;
            }
        } else if (selectedMethod === 'rocket') {
            if (!mobileData.mobileNumber || !mobileData.pin) {
                alert('মোবাইল নম্বর এবং PIN দিন'); return false;
            }
        } else {
            if (!mobileData.mobileNumber) {
                alert('মোবাইল নম্বর দিন'); return false;
            }
        }
        return true;
    };

    const handlePayment = async () => {
        if (!validatePayment()) return;
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 2000));
            await onBook(consultant.id, bookingForm);
            const bookingRef = 'MNT-' + Date.now().toString().slice(-6);
            setBooking({
                ref: bookingRef,
                consultant: consultant.name_bn || consultant.name,
                date: bookingForm.date,
                time: bookingForm.time,
                type: bookingForm.type,
                fee: sessionFee,
                userName: user?.name || 'ব্যবহারকারী',
                method: selectedMethod,
            });
            setStep(3);
        } catch (error) {
            alert('পেমেন্ট বা বুকিং করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const html = printHTMLReceipt(booking, user, booking.method);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
            // The window auto-prints, and the user can save as PDF from the print dialog
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    const methodConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Stepper */}
                <div style={styles.stepper}>
                    {['📅 বুকিং', '💳 পেমেন্ট', '✅ সম্পন্ন'].map((label, i) => (
                        <React.Fragment key={i}>
                            <div style={{ ...styles.stepItem, ...(step === i + 1 ? styles.stepActive : step > i + 1 ? styles.stepDone : {}) }}>
                                <div style={{ ...styles.stepCircle, ...(step === i + 1 ? styles.stepCircleActive : step > i + 1 ? styles.stepCircleDone : {}) }}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span style={styles.stepLabel}>{label}</span>
                            </div>
                            {i < 2 && <div style={{ ...styles.stepLine, ...(step > i + 1 ? styles.stepLineDone : {}) }} />}
                        </React.Fragment>
                    ))}
                </div>

                <button style={styles.closeBtn} onClick={onClose}>✕</button>

                {/* ── STEP 1: Booking Form ── */}
                {step === 1 && (
                    <form onSubmit={handleBookingSubmit}>
                        <h3 style={styles.modalTitle}>📅 অ্যাপয়েন্টমেন্ট বুক করুন</h3>
                        <p style={styles.consultantName}>{consultant.name_bn || consultant.name}</p>

                        <div style={styles.field}>
                            <label style={styles.label}>তারিখ নির্বাচন</label>
                            <input type="date" style={styles.input}
                                value={bookingForm.date} min={getMinDate()} max={getMaxDate()}
                                onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} required />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>সময় নির্বাচন</label>
                            <div style={styles.timeSlots}>
                                {generateTimeSlots().map((slot, idx) => (
                                    <button key={idx} type="button"
                                        style={{ ...styles.timeSlot, ...(bookingForm.time === slot ? styles.timeSlotActive : {}) }}
                                        onClick={() => setBookingForm({ ...bookingForm, time: slot })}
                                    >{slot}</button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>সেশন টাইপ</label>
                            <div style={styles.typeButtons}>
                                {[{ val: 'online', label: '🖥️ অনলাইন', fee: consultant.fee || 500 },
                                  { val: 'offline', label: '🏢 অফলাইন', fee: (consultant.fee || 500) + 300 }].map(t => (
                                    <button key={t.val} type="button"
                                        style={{ ...styles.typeBtn, ...(bookingForm.type === t.val ? styles.typeBtnActive : {}) }}
                                        onClick={() => setBookingForm({ ...bookingForm, type: t.val })}
                                    >
                                        {t.label}
                                        <span style={styles.typeFee}>৳{t.fee}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>নোটস (ঐচ্ছিক)</label>
                            <textarea rows="2" style={styles.textarea}
                                value={bookingForm.notes}
                                onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                placeholder="আপনার সমস্যা সম্পর্কে কিছু জানাতে চান?" />
                        </div>

                        <div style={styles.feeSummary}>
                            <span style={styles.feeLabel}>মোট পেমেন্ট:</span>
                            <span style={styles.feeAmount}>৳{sessionFee}</span>
                        </div>

                        <button type="submit" style={styles.submitBtn}>পরবর্তী: পেমেন্ট → 💳</button>
                    </form>
                )}

                {/* ── STEP 2: Payment ── */}
                {step === 2 && (
                    <div>
                        <h3 style={styles.modalTitle}>💳 পেমেন্ট সম্পন্ন করুন</h3>

                        {/* Order summary */}
                        <div style={styles.orderBox}>
                            <div style={styles.orderRow}>
                                <span style={styles.orderLabel}>{consultant.name_bn || consultant.name}</span>
                                <span style={styles.orderFee}>৳{sessionFee}</span>
                            </div>
                            <div style={styles.orderMeta}>{bookingForm.date} • {bookingForm.time} • {bookingForm.type === 'online' ? 'অনলাইন' : 'অফলাইন'}</div>
                        </div>

                        {/* Payment Method Tabs */}
                        <div style={styles.field}>
                            <label style={styles.label}>পেমেন্ট পদ্ধতি নির্বাচন করুন</label>
                            <div style={styles.methodGrid}>
                                {PAYMENT_METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        style={{
                                            ...styles.methodBtn,
                                            ...(selectedMethod === m.id ? { ...styles.methodBtnActive, borderColor: m.color, boxShadow: `0 0 0 2px ${m.color}40` } : {}),
                                        }}
                                        onClick={() => setSelectedMethod(m.id)}
                                    >
                                        {m.logo ? (
                                            <img src={m.logo} alt={m.label}
                                                style={{ height: '22px', objectFit: 'contain', filter: selectedMethod === m.id ? 'none' : 'grayscale(60%)' }}
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                                        )}
                                        <span style={{ fontSize: '0.75rem', marginTop: '3px', color: selectedMethod === m.id ? '#e2e8f0' : '#6b7280' }}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Card Fields ── */}
                        {selectedMethod === 'card' && (
                            <>
                                <div style={styles.cardVisual}>
                                    <div style={styles.cardTop}>
                                        <span style={styles.cardChip}>💳</span>
                                        <span style={styles.cardLogo}>VISA</span>
                                    </div>
                                    <div style={styles.cardNumDisplay}>{cardData.number || '•••• •••• •••• ••••'}</div>
                                    <div style={styles.cardFooter}>
                                        <span>{cardData.name || 'কার্ডধারীর নাম'}</span>
                                        <span>{cardData.expiry || 'MM/YY'}</span>
                                    </div>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>কার্ড নম্বর</label>
                                    <input style={styles.input} placeholder="1234 5678 9012 3456" maxLength={19}
                                        value={cardData.number} onChange={e => setCardData(p => ({ ...p, number: formatCardNumber(e.target.value) }))} />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>কার্ডধারীর নাম</label>
                                    <input style={styles.input} placeholder="Md. John Doe"
                                        value={cardData.name} onChange={e => setCardData(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div style={styles.fieldRow}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>মেয়াদ</label>
                                        <input style={styles.input} placeholder="MM/YY" maxLength={5}
                                            value={cardData.expiry} onChange={e => setCardData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>CVV</label>
                                        <input style={styles.input} placeholder="•••" type="password" maxLength={3}
                                            value={cardData.cvv} onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.slice(0, 3) }))} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── bKash Fields ── */}
                        {selectedMethod === 'bkash' && (
                            <div style={{ ...styles.mobilePayBox, borderColor: '#e2136e33', background: 'rgba(226,19,110,0.05)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bkash_Logo.png/640px-Bkash_Logo.png"
                                        alt="bKash" style={{ height: '30px', objectFit: 'contain' }}
                                        onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: '🔴 bKash', style: 'font-size:1.2rem;font-weight:700;color:#e2136e' })); }}
                                    />
                                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '6px' }}>
                                        আপনার bKash মোবাইল নম্বর দিন
                                    </p>
                                </div>
                                <label style={styles.label}>bKash নম্বর</label>
                                <input style={{ ...styles.input, borderColor: '#e2136e66' }} placeholder="01XXXXXXXXX"
                                    value={mobileData.mobileNumber}
                                    onChange={e => setMobileData(p => ({ ...p, mobileNumber: formatMobile(e.target.value) }))} />
                                <p style={{ color: '#6b8f7f', fontSize: '0.72rem', marginTop: '8px' }}>
                                    ✅ পেমেন্ট সম্পন্ন হলে আপনার bKash নম্বরে OTP আসবে
                                </p>
                            </div>
                        )}

                        {/* ── Nagad Fields ── */}
                        {selectedMethod === 'nagad' && (
                            <div style={{ ...styles.mobilePayBox, borderColor: '#f9731633', background: 'rgba(249,115,22,0.05)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nagad-Logo.png/640px-Nagad-Logo.png"
                                        alt="Nagad" style={{ height: '30px', objectFit: 'contain' }}
                                        onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { textContent: '🟠 Nagad', style: 'font-size:1.2rem;font-weight:700;color:#f97316' })); }}
                                    />
                                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '6px' }}>
                                        আপনার Nagad মোবাইল নম্বর দিন
                                    </p>
                                </div>
                                <label style={styles.label}>Nagad নম্বর</label>
                                <input style={{ ...styles.input, borderColor: '#f9731666' }} placeholder="01XXXXXXXXX"
                                    value={mobileData.mobileNumber}
                                    onChange={e => setMobileData(p => ({ ...p, mobileNumber: formatMobile(e.target.value) }))} />
                                <p style={{ color: '#6b8f7f', fontSize: '0.72rem', marginTop: '8px' }}>
                                    ✅ পেমেন্ট সম্পন্ন হলে আপনার Nagad নম্বরে নিশ্চিতকরণ SMS আসবে
                                </p>
                            </div>
                        )}

                        {/* ── Rocket Fields ── */}
                        {selectedMethod === 'rocket' && (
                            <div style={{ ...styles.mobilePayBox, borderColor: '#7c3aed33', background: 'rgba(124,58,237,0.05)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🚀</span>
                                    <span style={{ fontWeight: 700, color: '#7c3aed', marginLeft: '6px', fontSize: '1.1rem' }}>Rocket</span>
                                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '6px' }}>
                                        আপনার Rocket মোবাইল নম্বর এবং PIN দিন
                                    </p>
                                </div>
                                <label style={styles.label}>Rocket নম্বর</label>
                                <input style={{ ...styles.input, borderColor: '#7c3aed66', marginBottom: '10px' }} placeholder="01XXXXXXXXX"
                                    value={mobileData.mobileNumber}
                                    onChange={e => setMobileData(p => ({ ...p, mobileNumber: formatMobile(e.target.value) }))} />
                                <label style={styles.label}>PIN</label>
                                <input style={{ ...styles.input, borderColor: '#7c3aed66' }} placeholder="••••" type="password" maxLength={4}
                                    value={mobileData.pin}
                                    onChange={e => setMobileData(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                                <p style={{ color: '#6b8f7f', fontSize: '0.72rem', marginTop: '8px' }}>
                                    ✅ পেমেন্ট সম্পন্ন হলে SMS নিশ্চিতকরণ পাবেন
                                </p>
                            </div>
                        )}

                        <div style={styles.secureNote}>🔒 SSL এনক্রিপ্টেড নিরাপদ পেমেন্ট</div>

                        <button onClick={handlePayment} disabled={loading}
                            style={{ ...styles.submitBtn, background: loading ? '#4b5563' : (methodConfig?.color ? `linear-gradient(135deg, ${methodConfig.color}dd, ${methodConfig.color}aa)` : 'linear-gradient(135deg, #10b981, #059669)') }}>
                            {loading ? '⏳ পেমেন্ট হচ্ছে...' : `✅ ৳${sessionFee} পরিশোধ করুন`}
                        </button>
                        <button onClick={() => setStep(1)} style={styles.backBtn}>← পিছনে যান</button>
                    </div>
                )}

                {/* ── STEP 3: Success ── */}
                {step === 3 && booking && (
                    <div style={styles.successSection}>
                        <div style={styles.successIcon}>🎉</div>
                        <h3 style={styles.successTitle}>বুকিং সম্পন্ন হয়েছে!</h3>
                        <div style={styles.receiptBox}>
                            <h4 style={styles.receiptTitle}>📄 বুকিং রসিদ</h4>
                            <div style={styles.receiptRow}><span>রেফারেন্স:</span><strong>{booking.ref}</strong></div>
                            <div style={styles.receiptRow}><span>কনসালট্যান্ট:</span><span>{booking.consultant}</span></div>
                            <div style={styles.receiptRow}><span>তারিখ:</span><span>{booking.date}</span></div>
                            <div style={styles.receiptRow}><span>সময়:</span><span>{booking.time}</span></div>
                            <div style={styles.receiptRow}><span>সেশন:</span><span>{booking.type === 'online' ? '🖥️ অনলাইন' : '🏢 অফলাইন'}</span></div>
                            <div style={styles.receiptRow}>
                                <span>পেমেন্ট:</span>
                                <strong style={{ color: '#10b981' }}>৳{booking.fee} ✓</strong>
                            </div>
                        </div>
                        <button onClick={downloadPDF} style={styles.pdfBtn}>
                            📥 PDF রসিদ ডাউনলোড/প্রিন্ট করুন
                        </button>
                        <button onClick={onClose} style={styles.doneBtn}>ঠিক আছে</button>
                    </div>
                )}
            </div>
            <style>{`@keyframes slideIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>
        </div>
    );
};

const styles = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
    modal: { background:'#0d1425', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'2rem', maxWidth:'500px', width:'100%', maxHeight:'90vh', overflowY:'auto', position:'relative', animation:'slideIn 0.3s ease', fontFamily:"'Hind Siliguri', sans-serif" },
    closeBtn: { position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.08)', border:'none', color:'#a8c0b5', cursor:'pointer', fontSize:'1rem', width:'32px', height:'32px', borderRadius:'50%' },
    stepper: { display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem', gap:0 },
    stepItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
    stepActive: {}, stepDone: {},
    stepCircle: { width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color:'#6b7280', fontWeight:700 },
    stepCircleActive: { background:'rgba(16,185,129,0.2)', border:'2px solid #10b981', color:'#10b981' },
    stepCircleDone: { background:'rgba(16,185,129,0.3)', border:'2px solid #10b981', color:'#10b981' },
    stepLabel: { fontSize:'0.65rem', color:'#6b7280', whiteSpace:'nowrap' },
    stepLine: { width:'40px', height:'2px', background:'rgba(255,255,255,0.1)', margin:'0 4px', marginBottom:'16px' },
    stepLineDone: { background:'#10b981' },
    modalTitle: { color:'#e2e8f0', fontSize:'1.1rem', margin:'0 0 0.25rem', textAlign:'center' },
    consultantName: { color:'#10b981', fontSize:'0.85rem', textAlign:'center', margin:'0 0 1.5rem' },
    field: { marginBottom:'1rem' },
    fieldRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' },
    label: { display:'block', color:'#6b8f7f', fontSize:'0.78rem', marginBottom:'0.35rem' },
    input: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'0.65rem 0.85rem', color:'#e2e8f0', fontSize:'0.88rem', outline:'none', boxSizing:'border-box', colorScheme:'dark' },
    textarea: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'0.65rem 0.85rem', color:'#e2e8f0', fontSize:'0.88rem', outline:'none', boxSizing:'border-box', resize:'none' },
    timeSlots: { display:'flex', flexWrap:'wrap', gap:'0.4rem' },
    timeSlot: { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0.35rem 0.7rem', color:'#a8c0b5', cursor:'pointer', fontSize:'0.8rem' },
    timeSlotActive: { background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' },
    typeButtons: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' },
    typeBtn: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.75rem', color:'#a8c0b5', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', fontSize:'0.85rem' },
    typeBtnActive: { background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.35)', color:'#10b981' },
    typeFee: { fontSize:'0.75rem', fontWeight:700 },
    feeSummary: { display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', padding:'0.75rem 1rem', marginBottom:'1rem' },
    feeLabel: { color:'#a8c0b5', fontSize:'0.88rem' },
    feeAmount: { color:'#10b981', fontWeight:800, fontSize:'1.1rem' },
    orderBox: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' },
    orderRow: { display:'flex', justifyContent:'space-between', alignItems:'center' },
    orderLabel: { color:'#e2e8f0', fontSize:'0.9rem' },
    orderFee: { color:'#10b981', fontWeight:800, fontSize:'1.1rem' },
    orderMeta: { color:'#6b8f7f', fontSize:'0.75rem', marginTop:'0.25rem' },
    // Payment method selector
    methodGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginTop:'6px' },
    methodBtn: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 6px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', transition:'all 0.2s' },
    methodBtnActive: { background:'rgba(255,255,255,0.1)', border:'2px solid #10b981' },
    mobilePayBox: { border:'1px solid', borderRadius:'12px', padding:'16px', marginBottom:'12px' },
    // Card visual
    cardVisual: { background:'linear-gradient(135deg, #1a2540, #0f1a30)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'1.25rem', marginBottom:'1rem' },
    cardTop: { display:'flex', justifyContent:'space-between', marginBottom:'1rem' },
    cardChip: { fontSize:'1.2rem' },
    cardLogo: { color:'#f59e0b', fontWeight:700, fontStyle:'italic' },
    cardNumDisplay: { color:'#e2e8f0', fontSize:'1rem', letterSpacing:'4px', marginBottom:'0.75rem', fontFamily:'monospace' },
    cardFooter: { display:'flex', justifyContent:'space-between', color:'#a8c0b5', fontSize:'0.8rem' },
    secureNote: { color:'#6b8f7f', fontSize:'0.72rem', textAlign:'center', marginBottom:'0.75rem' },
    submitBtn: { width:'100%', background:'linear-gradient(135deg, #10b981, #059669)', border:'none', color:'#fff', padding:'0.85rem', borderRadius:'12px', cursor:'pointer', fontWeight:700, fontSize:'0.95rem', marginBottom:'0.5rem' },
    backBtn: { width:'100%', background:'none', border:'none', color:'#6b8f7f', cursor:'pointer', fontSize:'0.85rem', padding:'0.5rem' },
    successSection: { textAlign:'center' },
    successIcon: { fontSize:'4rem', marginBottom:'0.75rem' },
    successTitle: { color:'#10b981', fontSize:'1.2rem', marginBottom:'1rem' },
    receiptBox: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'1.25rem', marginBottom:'1.5rem', textAlign:'left' },
    receiptTitle: { color:'#e2e8f0', margin:'0 0 1rem', fontSize:'0.95rem' },
    receiptRow: { display:'flex', justifyContent:'space-between', color:'#a8c0b5', fontSize:'0.82rem', padding:'0.35rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
    pdfBtn: { width:'100%', background:'linear-gradient(135deg, #3b82f6, #2563eb)', border:'none', color:'#fff', padding:'0.85rem', borderRadius:'12px', cursor:'pointer', fontWeight:700, fontSize:'0.95rem', marginBottom:'0.75rem' },
    doneBtn: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#a8c0b5', padding:'0.75rem', borderRadius:'12px', cursor:'pointer', fontSize:'0.88rem' },
};

export default BookingModal;
