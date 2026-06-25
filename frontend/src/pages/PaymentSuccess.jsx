import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || 'N/A';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🎉</span>
        </div>
        <h1 style={styles.title}>পেমেন্ট সফল হয়েছে!</h1>
        <p style={styles.subtitle}>
          আপনার Premium মেম্বারশিপ এখন সক্রিয়। আপনি এখন মেন্টাল সাথী-র সমস্ত প্রিমিয়াম ফিচার ব্যবহার করতে পারবেন।
        </p>

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>লেনদেন আইডি (Tran ID)</span>
            <span style={styles.infoValue}>{tranId}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>স্ট্যাটাস</span>
            <span style={{ ...styles.infoValue, color: '#10b981', fontWeight: 'bold' }}>SUCCESS</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={() => navigate('/rag-chatbot')} style={styles.primaryBtn}>
            🤖 RAG চ্যাটবট ব্যবহার করুন →
          </button>
          <button onClick={() => navigate('/dashboard')} style={styles.secondaryBtn}>
            ড্যাশবোর্ডে যান
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0E1E19 0%, #162420 50%, #202920 100%)',
    padding: '1.5rem',
    fontFamily: "'Hind Siliguri', sans-serif",
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '3rem 2rem',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    backdropFilter: 'blur(8px)',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto',
  },
  icon: {
    fontSize: '2.5rem',
  },
  title: {
    color: '#eff8f3',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  subtitle: {
    color: '#a8c0b5',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  infoBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1.2rem',
    marginBottom: '2rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
  infoLabel: {
    color: '#a8c0b5',
  },
  infoValue: {
    color: '#eff8f3',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  secondaryBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#eff8f3',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export default PaymentSuccess;
