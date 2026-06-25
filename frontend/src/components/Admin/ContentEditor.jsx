import React, { useState } from 'react';
import { api } from '../../services/api';

const ContentEditor = ({ content, onClose, onSave }) => {
  const isEditing = !!content;
  
  const [formData, setFormData] = useState({
    type: content?.type || 'journal',
    title: content?.title || '',
    title_bn: content?.title_bn || '',
    content: content?.content || '',
    content_bn: content?.content_bn || '',
    author: content?.author || '',
    category: content?.category || '',
    tags: content?.tags?.join(', ') || '',
    image_url: content?.image_url || '',
    video_url: content?.video_url || '',
    source: content?.source || '',
    is_published: content?.is_published !== undefined ? content.is_published : true,
    featured: content?.featured || false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (isEditing) {
        await api.put(`/cms/content/${content.id}`, payload);
      } else {
        await api.post('/cms/content', payload);
      }

      alert(isEditing ? '✅ আপডেট হয়েছে!' : '✅ তৈরি হয়েছে!');
      onSave();
    } catch (error) {
      alert('সেভ করতে পারেনি');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: 'journal', label: '📝 জার্নাল' },
    { value: 'book', label: '📚 বই' },
    { value: 'article', label: '📰 আর্টিকেল' },
    { value: 'quote', label: '💬 কোট' },
    { value: 'video', label: '🎬 ভিডিও' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? '✏️ কন্টেন্ট এডিট' : '➕ নতুন কন্টেন্ট'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>টাইপ</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {types.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>শিরোনাম (ইংরেজি)</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>শিরোনাম (বাংলা)</label>
            <input name="title_bn" value={formData.title_bn} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>কন্টেন্ট (ইংরেজি)</label>
            <textarea name="content" value={formData.content} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>কন্টেন্ট (বাংলা)</label>
            <textarea name="content_bn" value={formData.content_bn} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>লেখক</label>
            <input name="author" value={formData.author} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ক্যাটাগরি</label>
            <input name="category" value={formData.category} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
            <input name="tags" value={formData.tags} onChange={handleChange} placeholder="mental-health, depression, anxiety" />
          </div>

          <div className="form-group">
            <label>ইমেজ URL</label>
            <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="form-group">
            <label>ভিডিও URL</label>
            <input name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div className="form-group">
            <label>সোর্স</label>
            <input name="source" value={formData.source} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} />
              প্রকাশিত
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              ফিচার্ড
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>বাতিল</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'সেভ হচ্ছে...' : (isEditing ? '💾 আপডেট' : '➕ তৈরি')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentEditor;
