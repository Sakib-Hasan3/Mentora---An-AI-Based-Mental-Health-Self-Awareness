import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ContentManager from '../components/Admin/ContentManager';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    books: 0,
    journals: 0,
    articles: 0,
    quotes: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/cms/content');
      const content = data.content || [];
      
      setStats({
        total: content.length,
        books: content.filter(c => c.type === 'book').length,
        journals: content.filter(c => c.type === 'journal').length,
        articles: content.filter(c => c.type === 'article').length,
        quotes: content.filter(c => c.type === 'quote').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/payment/transactions');
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('bn-BD');
    } catch {
      return dateString;
    }
  };

  const successTransactions = transactions.filter(t => t.status === 'success');
  const totalRevenue = successTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="admin-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p style={{ color: '#a8c0b5' }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>🧠 অ্যাডমিন প্যানেল</h1>
        <div className="user-info">
          <span>👋 {user?.name} (অ্যাডমিন)</span>
          <button onClick={logout} className="logout-btn">🚪 লগআউট</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="number">{stats.total}</div>
          <div className="label">📄 মোট কন্টেন্ট</div>
        </div>
        <div className="stat-card">
          <div className="number">৳{totalRevenue.toLocaleString()}</div>
          <div className="label">💰 মোট আয়</div>
        </div>
        <div className="stat-card">
          <div className="number">{successTransactions.length}</div>
          <div className="label">👑 প্রমিয়াম ইউজার</div>
        </div>
        <div className="stat-card">
          <div className="number">{transactions.length}</div>
          <div className="label">💳 মোট ট্রানজেকশন</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('content')} 
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'content' ? '#10b981' : '#a8c0b5',
            fontWeight: '600',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'content' ? '3px solid #10b981' : 'none',
            transition: 'all 0.3s'
          }}
        >
          📋 কন্টেন্ট ম্যানেজার
        </button>
        <button 
          onClick={() => {
            setActiveTab('payments');
            fetchTransactions();
          }} 
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'payments' ? '#10b981' : '#a8c0b5',
            fontWeight: '600',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'payments' ? '3px solid #10b981' : 'none',
            transition: 'all 0.3s'
          }}
        >
          💳 পেমেন্ট ও লেনদেন
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'content' ? (
        <ContentManager onUpdate={fetchStats} />
      ) : (
        <div className="content-manager">
          <div className="content-manager-header">
            <h2>💳 লেনদেন ইতিহাস (SSLCommerz)</h2>
            <button className="add-btn" onClick={fetchTransactions}>🔄 রিফ্রেশ করুন</button>
          </div>

          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eff8f3', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem' }}>লেনদেন আইডি</th>
                  <th style={{ padding: '1rem' }}>গ্রাহক</th>
                  <th style={{ padding: '1rem' }}>পরিমাণ</th>
                  <th style={{ padding: '1rem' }}>প্ল্যান</th>
                  <th style={{ padding: '1rem' }}>মেথড</th>
                  <th style={{ padding: '1rem' }}>তারিখ</th>
                  <th style={{ padding: '1rem' }}>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#a8c0b5' }}>
                      কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981' }}>{t.tran_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{t.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a8c0b5' }}>{t.user_email}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>৳{t.amount}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{t.plan?.replace('premium_', '')}</td>
                      <td style={{ padding: '1rem' }}>{t.payment_method || 'N/A'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#a8c0b5' }}>{formatDate(t.created_at)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: t.status === 'success' ? 'rgba(16,185,129,0.15)' : t.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: t.status === 'success' ? '#10b981' : t.status === 'pending' ? '#f59e0b' : '#ef4444',
                          border: `1px solid ${t.status === 'success' ? 'rgba(16,185,129,0.3)' : t.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                          {t.status === 'success' ? 'সফল' : t.status === 'pending' ? 'চলমান' : t.status === 'cancelled' ? 'বাতিল' : 'ব্যর্থ'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
