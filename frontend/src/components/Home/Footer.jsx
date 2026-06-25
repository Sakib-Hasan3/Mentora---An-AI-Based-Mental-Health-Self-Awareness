import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            padding: '4rem 2rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'linear-gradient(180deg, #0E1E19 0%, #162420 40%, #202920 100%)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>🧠</span>
                            <h3 style={{ color: '#eff8f3', fontSize: '1.2rem', fontWeight: '700' }}>মেন্টাল সাথী</h3>
                        </div>
                        <p style={{ color: '#a8c0b5', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            আপনার মানসিক স্বাস্থ্যের যত্ন নেওয়ার জন্য বাংলা প্ল্যাটফর্ম।
                        </p>
                    </div>
                    
                    <div>
                        <h4 style={{ color: '#eff8f3', fontWeight: '600', marginBottom: '1rem' }}>দ্রুত লিংক</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>হোম</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>মানসিক স্বাস্থ্য পরীক্ষা</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>বিশেষজ্ঞদের তালিকা</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>ব্লগ</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={{ color: '#eff8f3', fontWeight: '600', marginBottom: '1rem' }}>সাপোর্ট</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>হেল্প সেন্টার</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>প্রাইভেসি পলিসি</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>টার্মস এন্ড কন্ডিশন</a></li>
                            <li><a href="#" style={{ color: '#a8c0b5', textDecoration: 'none', transition: 'color 0.3s' }}>যোগাযোগ</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style={{ color: '#eff8f3', fontWeight: '600', marginBottom: '1rem' }}>যোগাযোগ</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#a8c0b5', fontSize: '0.9rem' }}>
                            <li>📧 support@mentora.com</li>
                            <li>📞 ১৬২৬৩ (হেল্পলাইন)</li>
                            <li>🇧🇩 বাংলাদেশ</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <a href="#" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8c0b5', textDecoration: 'none', transition: 'all 0.3s' }}>📘</a>
                            <a href="#" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8c0b5', textDecoration: 'none', transition: 'all 0.3s' }}>🐦</a>
                            <a href="#" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8c0b5', textDecoration: 'none', transition: 'all 0.3s' }}>📸</a>
                        </div>
                    </div>
                </div>
                
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '1.5rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '0.85rem'
                }}>
                    <p>© {year} মেন্টাল সাথী। সব অধিকার সংরক্ষিত।</p>
                    <p style={{ marginTop: '0.25rem' }}>💚 আপনার মানসিক স্বাস্থ্যই আমাদের প্রথম priority</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
