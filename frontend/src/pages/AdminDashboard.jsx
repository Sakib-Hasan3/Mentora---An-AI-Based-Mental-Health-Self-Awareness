import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ContentManager from '../components/Admin/ContentManager';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  // Tabs: overview, content, payments, users
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [stats, setStats] = useState({
    total: 0,
    books: 0,
    journals: 0,
    articles: 0,
    quotes: 0,
    videos: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filter/Search states
  const [userSearch, setUserSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  
  // Loading sub-indicators
  const [refreshingUsers, setRefreshingUsers] = useState(false);
  const [refreshingPayments, setRefreshingPayments] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchTransactions(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get('/cms/content');
      const content = data.content || [];
      
      setStats({
        total: content.length,
        books: content.filter(c => c.type === 'book').length,
        journals: content.filter(c => c.type === 'journal').length,
        articles: content.filter(c => c.type === 'article').length,
        quotes: content.filter(c => c.type === 'quote').length,
        videos: content.filter(c => c.type === 'video').length
      });
    } catch (error) {
      console.error('Failed to fetch CMS content:', error);
    }
  };

  const fetchTransactions = async () => {
    setRefreshingPayments(true);
    try {
      const data = await api.get('/payment/transactions');
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setRefreshingPayments(false);
    }
  };

  const fetchUsers = async () => {
    setRefreshingUsers(true);
    try {
      const data = await api.get('/cms/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setRefreshingUsers(false);
    }
  };

  // User Action Handlers
  const handleUpgradeUser = async (userId) => {
    try {
      const data = await api.put(`/cms/users/${userId}/upgrade`);
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, user_type: data.user_type, subscription: data.subscription } : u
        ));
      }
    } catch (err) {
      alert('ইউজার আপগ্রেড/ডাউনগ্রেড করতে ব্যর্থ হয়েছে');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const data = await api.put(`/cms/users/${userId}/toggle-status`);
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_active: data.is_active } : u
        ));
      }
    } catch (err) {
      alert('ইউজার স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে');
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const data = await api.put(`/cms/users/${userId}/toggle-admin`);
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_admin: data.is_admin } : u
        ));
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'অ্যাডমিন স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('bn-BD') + ' ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Derived Values
  const successTransactions = transactions.filter(t => t.status === 'success');
  const totalRevenue = successTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const paidUsersCount = users.filter(u => u.user_type === 'paid' || u.subscription === 'premium').length;

  // Search Filters
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.tran_id?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    t.user_name?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    t.user_email?.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="books-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#a8c0b5', fontWeight: 600 }}>লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Dynamic Background Glow */}
      <div style={{
        position: 'fixed', top: '-200px', left: '10%',
        width: '600px', height: '600px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)',
        zIndex: 0
      }} />

      {/* Header */}
      <div className="admin-header" style={{ position: 'relative', zIndex: 1 }}>
        <h1>🧠 Mentora অ্যাডমিন প্যানেল</h1>
        <div className="user-info">
          <span>👋 {user?.name} (অ্যাডমিন)</span>
          <button onClick={logout} className="logout-btn">🚪 লগআউট</button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="admin-stats" style={{ position: 'relative', zIndex: 1 }}>
        <div className="stat-card" onClick={() => setActiveTab('content')} style={{ cursor: 'pointer' }}>
          <div className="number">{stats.total}</div>
          <div className="label">📄 মোট কন্টেন্ট (বই/জার্নাল)</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('payments')} style={{ cursor: 'pointer' }}>
          <div className="number">৳{totalRevenue.toLocaleString('bn-BD')}</div>
          <div className="label">💰 মোট প্রমিয়াম আয়</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
          <div className="number">{paidUsersCount}</div>
          <div className="label">👑 প্রমিয়াম সদস্য সংখ্যা</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
          <div className="number">{users.length}</div>
          <div className="label">👥 মোট নিবন্ধিত ইউজার</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs" style={{ position: 'relative', zIndex: 1 }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 ওভারভিউ ও গ্রাফ
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            fetchUsers();
          }}
        >
          👥 ইউজার ম্যানেজার
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('content');
            fetchStats();
          }}
        >
          📋 কন্টেন্ট ম্যানেজার
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('payments');
            fetchTransactions();
          }}
        >
          💳 পেমেন্ট ও লেনদেন
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* ── Tab 1: Overview ── */}
        {activeTab === 'overview' && (
          <div className="content-manager">
            <h2>📊 কন্টেন্ট ডিস্ট্রিবিউশন ও ট্রাফিক্স অ্যানালিটিক্স</h2>
            <p style={{ color: '#a8c0b5', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              সিস্টেমে বর্তমান কন্টেন্টগুলোর ধরন অনুযায়ী তুলনামূলক চিত্র
            </p>
            
            {/* Visualizer Chart */}
            <div className="admin-chart-mock">
              {[
                { label: 'বই (Books)', val: stats.books, max: stats.total || 1, color: 'alt' },
                { label: 'জার্নাল (Journals)', val: stats.journals, max: stats.total || 1 },
                { label: 'আর্টিকেল (Articles)', val: stats.articles, max: stats.total || 1, color: 'alt' },
                { label: 'কোট (Quotes)', val: stats.quotes, max: stats.total || 1 },
                { label: 'ভিডিও (Videos)', val: stats.videos, max: stats.total || 1, color: 'alt' },
              ].map((item, idx) => {
                const heightPct = Math.max(12, Math.min(90, (item.val / item.max) * 80));
                return (
                  <div key={idx} className="chart-bar-wrap">
                    <div 
                      className={`chart-bar ${item.color === 'alt' ? 'alt' : ''}`} 
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="chart-val">{item.val}টি</span>
                    </div>
                    <span className="chart-label">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions / Activity Log */}
            <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', flexWrap: 'wrap' }} className="overview-split">
              <div>
                <h3>⚡ কুইক অ্যাডমিন অ্যাকশন</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                  <button onClick={() => setActiveTab('content')} className="add-btn" style={{ width: '100%', borderRadius: '12px', padding: '0.8rem' }}>
                    📝 নতুন বুক/আর্টিকেল প্রকাশ করুন
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="add-btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', borderRadius: '12px', padding: '0.8rem' }}>
                    🖥️ ইউজার ড্যাশবোর্ডে যান
                  </button>
                </div>
              </div>
              <div>
                <h3>🔔 সাম্প্রতিক অ্যাক্টিভিটি লগ</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--emerald)', borderRadius: '0 8px 8px 0', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold' }}>নয়া প্রিমিয়াম মেম্বার</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>sakib@gmail.com সফলভাবে পেমেন্ট করে মেম্বারশিপ নিয়েছেন।</div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--cyan)', borderRadius: '0 8px 8px 0', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold' }}>কন্টেন্ট ডেটাবেজ সিঙ্ক</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ডেটাবেজে সফলভাবে সিডিং স্ক্রিপ্ট রান করানো হয়েছে।</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Users Manager ── */}
        {activeTab === 'users' && (
          <div className="content-manager">
            <div className="content-manager-header">
              <h2>👥 ইউজার অ্যাকাউন্টস ও সাবস্ক্রিপশন ম্যানেজার ({filteredUsers.length})</h2>
              <button className="add-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)' }} onClick={fetchUsers}>
                {refreshingUsers ? '🔄 রিফ্রেশ হচ্ছে...' : '🔄 রিফ্রেশ'}
              </button>
            </div>

            {/* Search */}
            <div className="user-search-bar">
              <input 
                type="text" 
                placeholder="🔍 নাম অথবা ইমেইল দিয়ে সার্চ করুন..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ব্যবহারকারীর নাম</th>
                    <th>ইমেইল এড্রেস</th>
                    <th>মোবাইল</th>
                    <th>সাবস্ক্রিপশন</th>
                    <th>রোল</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        কোনো ইউজার খুঁজে পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 'bold', color: u.is_active ? '#fff' : 'rgba(239,68,68,0.7)' }}>
                            {u.name} {!u.is_active && '(নিষ্ক্রিয়)'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: u.user_type === 'paid' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.12)',
                            color: u.user_type === 'paid' ? '#f59e0b' : 'var(--text-muted)',
                            border: `1px solid ${u.user_type === 'paid' ? 'rgba(245,158,11,0.3)' : 'rgba(100,116,139,0.2)'}`
                          }}>
                            {u.user_type === 'paid' ? '👑 Premium' : 'Free User'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-role ${u.is_admin ? 'badge-admin' : 'badge-user'}`}>
                            {u.is_admin ? '🛡️ Admin' : 'Member'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button 
                              className={`action-icon-btn ${u.user_type === 'paid' ? 'active' : ''}`}
                              onClick={() => handleUpgradeUser(u.id)}
                              title={u.user_type === 'paid' ? 'ডাউনগ্রেড টু ফ্রি' : 'আপগ্রেড টু প্রিমিয়াম'}
                            >
                              {u.user_type === 'paid' ? '👑 Premium' : '⭐ Upgrade'}
                            </button>
                            <button 
                              className="action-icon-btn"
                              style={{ color: u.is_active ? '#ef4444' : '#10b981' }}
                              onClick={() => handleToggleStatus(u.id)}
                            >
                              {u.is_active ? '🚫 Deactivate' : '✅ Activate'}
                            </button>
                            <button 
                              className="action-icon-btn"
                              onClick={() => handleToggleAdmin(u.id)}
                              disabled={u.id === user.id}
                            >
                              👤 Toggle Admin
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Content Manager ── */}
        {activeTab === 'content' && (
          <ContentManager onUpdate={fetchStats} />
        )}

        {/* ── Tab 4: Payments & Transactions ── */}
        {activeTab === 'payments' && (
          <div className="content-manager">
            <div className="content-manager-header">
              <h2>💳 লেনদেন ও রাজস্ব বিবরণী (SSLCommerz / Bkash / Nagad)</h2>
              <button className="add-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)' }} onClick={fetchTransactions}>
                {refreshingPayments ? '🔄 রিফ্রেশ হচ্ছে...' : '🔄 রিফ্রেশ বিবরণী'}
              </button>
            </div>

            {/* Search */}
            <div className="user-search-bar">
              <input 
                type="text" 
                placeholder="🔍 ট্রানজেকশন আইডি, নাম অথবা ইমেইল..." 
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>লেনদেন আইডি</th>
                    <th>ইউজার বিবরণ</th>
                    <th>পরিমাণ</th>
                    <th>প্ল্যান</th>
                    <th>পেমেন্ট মেথড</th>
                    <th>তারিখ ও সময়</th>
                    <th>স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>{t.tran_id}</td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{t.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.user_email}</div>
                        </td>
                        <td style={{ fontWeight: '800', color: '#fff' }}>৳{t.amount}</td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{t.plan?.replace('premium_', '')}</td>
                        <td>{t.payment_method || 'MOCK'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(t.created_at)}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: t.status === 'success' ? 'rgba(16,185,129,0.12)' : t.status === 'pending' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                            color: t.status === 'success' ? '#10b981' : t.status === 'pending' ? '#f59e0b' : '#ef4444',
                            border: `1px solid ${t.status === 'success' ? 'rgba(16,185,129,0.25)' : t.status === 'pending' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`
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
    </div>
  );
};

export default AdminDashboard;
