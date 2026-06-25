import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ContentEditor from './ContentEditor';

const ContentManager = ({ onUpdate }) => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const fetchContents = async () => {
    try {
      const url = filter !== 'all' ? `/cms/content?type=${filter}` : '/cms/content';
      const data = await api.get(url);
      setContents(data.content || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি এই কন্টেন্ট ডিলিট করতে চান?')) return;
    
    try {
      await api.delete(`/cms/content/${id}`);
      fetchContents();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('ডিলিট করতে পারেনি');
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingContent(null);
    fetchContents();
    if (onUpdate) onUpdate();
  };

  const typeLabels = {
    book: '📚',
    journal: '📝',
    article: '📰',
    quote: '💬',
    video: '🎬'
  };

  const typeNames = {
    book: 'বই',
    journal: 'জার্নাল',
    article: 'আর্টিকেল',
    quote: 'কোট',
    video: 'ভিডিও'
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#a8c0b5' }}>লোড হচ্ছে...</div>;
  }

  return (
    <div className="content-manager">
      <div className="content-manager-header">
        <h2>📋 কন্টেন্ট ম্যানেজার</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#eff8f3'
            }}
          >
            <option value="all">সব</option>
            <option value="book">বই</option>
            <option value="journal">জার্নাল</option>
            <option value="article">আর্টিকেল</option>
            <option value="quote">কোট</option>
            <option value="video">ভিডিও</option>
          </select>
          <button className="add-btn" onClick={() => setShowEditor(true)}>
            + নতুন যোগ করুন
          </button>
        </div>
      </div>

      <div className="content-list">
        {contents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#a8c0b5' }}>
            কোনো কন্টেন্ট নেই। নতুন যোগ করুন!
          </div>
        ) : (
          contents.map((item) => (
            <div key={item.id} className="content-item">
              <div className="info">
                <div className="title">
                  {typeLabels[item.type] || '📄'} {item.title_bn || item.title}
                </div>
                <div className="meta">
                  {typeNames[item.type] || item.type} • 
                  {item.author && ` ${item.author} • `}
                  {item.category && ` ${item.category} • `}
                  {item.is_published ? '🟢 প্রকাশিত' : '🔴 ড্রাফট'}
                </div>
              </div>
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showEditor && (
        <ContentEditor
          content={editingContent}
          onClose={handleCloseEditor}
          onSave={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default ContentManager;
