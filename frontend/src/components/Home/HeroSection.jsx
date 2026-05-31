import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-glow hero-glow-left" />
            <div className="hero-glow hero-glow-right" />
            <div className="container hero-grid">
                <header className="hero-nav reveal">
                    <div className="hero-brand">
                        <span className="hero-brand-mark">M</span>
                        <div>
                            <h2>Mentora</h2>
                            <p>বাংলা AI মানসিক সুস্থতা প্ল্যাটফর্ম</p>
                        </div>
                    </div>

                    <div className="hero-nav-pills" aria-label="প্ল্যাটফর্মের বৈশিষ্ট্য">
                        <span>বাংলা সাপোর্ট</span>
                        <span>গোপনীয়তা সুরক্ষিত</span>
                        <span>২৪/৭ সহায়তা</span>
                    </div>
                    <div className="hero-auth">
                        <Link className="btn btn-login" to="/login">সাইন ইন</Link>
                        <Link className="btn btn-primary btn-signup" to="/signup">নতুন একাউন্ট</Link>
                    </div>
                </header>

                <div className="hero-copy reveal">
                    <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        বাংলাদেশের জন্য AI মানসিক যত্ন
                    </div>
                    <h1>
                        প্রতিদিনের যত্ন,
                        <span>বাংলায় AI সাপোর্ট, আর আরও শান্ত মন</span>
                    </h1>
                    <p className="hero-description">
                        মেন্টোরা এমন একটি privacy-first প্ল্যাটফর্ম, যেখানে আপনি সহজে মুড ট্র্যাক করতে পারেন, বাংলায় AI সারাংশ পেতে পারেন, আর ছোট ছোট অভ্যাস গড়ে তুলতে পারেন যা সত্যিই কাজে লাগে।
                    </p>

                    <div className="hero-actions">
                        <a className="btn btn-primary" href="#features">
                            ফ্রি শুরু করুন
                        </a>
                        <a className="btn btn-secondary" href="#demo">
                            লাইভ ডেমো দেখুন
                        </a>
                    </div>

                    <div className="hero-metrics">
                        <article className="hero-metric">
                            <strong>৯৮%</strong>
                            <span>ব্যবহারকারী সন্তুষ্টি</span>
                        </article>
                        <article className="hero-metric">
                            <strong>২৪/৭</strong>
                            <span>সহায়তা ও সঙ্গ</span>
                        </article>
                        <article className="hero-metric">
                            <strong>বাংলা</strong>
                            <span>প্রথম ভাষা অভিজ্ঞতা</span>
                        </article>
                    </div>

                    <div className="hero-trust">
                        <div className="trust-pill">এনক্রিপ্টেড journaling</div>
                        <div className="trust-pill">মোবাইলে দ্রুত চলে</div>
                        <div className="trust-pill">বাংলাদেশ-ফার্স্ট ডিজাইন</div>
                    </div>
                </div>

                <div className="hero-panel reveal">
                    <div className="dashboard-card">
                        <div className="dashboard-topbar">
                            <span />
                            <span />
                            <span />
                        </div>
                        <div className="dashboard-content">
                            <div className="dashboard-metric">
                                <p>আজকের মুড সারাংশ</p>
                                <strong>শান্ত</strong>
                                <span className="metric-up">গত সপ্তাহের তুলনায় ১৪% ভালো</span>
                            </div>
                            <div className="dashboard-chart">
                                <div className="chart-bar bar-1" />
                                <div className="chart-bar bar-2" />
                                <div className="chart-bar bar-3" />
                                <div className="chart-bar bar-4" />
                                <div className="chart-bar bar-5" />
                                <div className="chart-bar bar-6" />
                            </div>
                            <div className="dashboard-grid">
                                <div className="dashboard-insight">
                                    <span className="insight-label">বাংলায় AI সারাংশ</span>
                                    <p>
                                        আপনার ঘুম ৭ ঘণ্টার বেশি হলে মুড বেশি স্থিতিশীল থাকে। রাতে ১০ মিনিটের শান্ত শ্বাস-প্রশ্বাস অনুশীলন চেষ্টা করুন।
                                    </p>
                                </div>
                                <ul className="dashboard-list" aria-label="আজকের করণীয়">
                                    <li>রাত ১০টার পর স্ক্রিন টাইম কমান</li>
                                    <li>সকালে ৫ মিনিট সূর্যালোকে বসুন</li>
                                    <li>দুপুরে পর্যাপ্ত পানি পান করুন</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;