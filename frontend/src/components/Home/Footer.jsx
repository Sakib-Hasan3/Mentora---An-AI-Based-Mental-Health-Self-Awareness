import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer" id="footer">
            <div className="container footer-grid">
                <div>
                    <div className="footer-brand">
                        <span className="footer-mark">M</span>
                        <div>
                            <h3>Mentora</h3>
                            <p>বাংলা AI মানসিক সুস্থতা সবার জন্য</p>
                        </div>
                    </div>
                    <p className="footer-copy">
                        মুড ট্র্যাকিং, নির্দেশিত self-awareness, আর privacy-first সহায়তার জন্য বানানো একটি পরিপাটি SaaS হোমপেজ।
                    </p>
                </div>

                <div>
                    <h4>পণ্য</h4>
                    <ul>
                        <li><a href="#features">ফিচার</a></li>
                        <li><a href="#demo">ডেমো</a></li>
                        <li><a href="#">মূল্যতালিকা</a></li>
                        <li><a href="#">আপডেট লগ</a></li>
                    </ul>
                </div>

                <div>
                    <h4>সহায়তা</h4>
                    <ul>
                        <li><a href="#">সহায়তা কেন্দ্র</a></li>
                        <li><a href="#">গোপনীয়তা</a></li>
                        <li><a href="#">শর্তাবলি</a></li>
                        <li><a href="#">যোগাযোগ</a></li>
                    </ul>
                </div>

                <div>
                    <h4>যোগাযোগ</h4>
                    <ul>
                        <li>support@mentora.app</li>
                        <li>Dhaka, Bangladesh</li>
                        <li>২৪/৭ প্রোডাক্ট সহায়তা</li>
                    </ul>
                </div>
            </div>

            <div className="container footer-bottom">
                <p>© {currentYear} Mentora. সর্বস্বত্ব সংরক্ষিত।</p>
                <p>সচেতন ডিজিটাল সুস্থতার জন্য নির্মিত।</p>
            </div>
        </footer>
    );
};

export default Footer;