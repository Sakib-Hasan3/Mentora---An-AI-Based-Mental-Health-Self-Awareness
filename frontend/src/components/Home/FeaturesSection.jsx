import React from 'react';

const features = [
    {
        icon: '🤖',
        title: 'AI-নির্দেশিত প্রতিফলন',
        description: 'স্মার্ট প্রম্পট আর সহজ বিশ্লেষণ আপনাকে নিজের আবেগের ধরন দ্রুত বুঝতে সাহায্য করে।'
    },
    {
        icon: '🔒',
        title: 'ডিফল্টভাবেই গোপনীয়তা',
        description: 'এনক্রিপ্টেড নোট, নিরাপদ স্টোরেজ, আর বিশ্বাসভিত্তিক অভিজ্ঞতা প্রতিটি সেশনে।'
    },
    {
        icon: '💬',
        title: 'সদা-সচল সহায়তা',
        description: 'আপনি যখন সবচেয়ে বেশি ভরসা চান, তখনও কথা বলার মতো একটি সহায়তা স্তর সবসময় প্রস্তুত।'
    },
    {
        icon: '📊',
        title: 'দৈনিক অভ্যাস ট্র্যাকিং',
        description: 'মুড, ঘুম, আর mindfulness এক জায়গায় দেখে আপনি নিজের রুটিন সহজে বুঝতে পারেন।'
    },
    {
        icon: '👥',
        title: 'পরিবার ও কমিউনিটি সাপোর্ট',
        description: 'সহযোগিতামূলক সার্কেল তৈরি করুন, যা হইচই না করে বরং নিরাপদ আর সহানুভূতিশীল থাকে।'
    },
    {
        icon: '📱',
        title: 'মোবাইল-প্রথম অভিজ্ঞতা',
        description: 'ফোন, ট্যাব, আর ডেস্কটপে একইভাবে দ্রুত, পরিষ্কার, আর স্বাচ্ছন্দ্যময় ইন্টারফেস।'
    }
];

const FeaturesSection = () => {
    return (
        <section className="content-section" id="features">
            <div className="container">
                <div className="section-heading reveal">
                    <span className="section-kicker">কেন মেন্টোরা</span>
                    <h2>এক জায়গায় মানসিক যত্ন, AI insight, আর পরিষ্কার SaaS অভিজ্ঞতা</h2>
                    <p>
                        আমরা প্ল্যাটফর্মটি এমনভাবে বানিয়েছি যাতে পরিষ্কার বোঝা যায়, ভরসা তৈরি হয়, আর ব্যবহার করতে আলাদা কোনো ঝামেলা না থাকে।
                    </p>
                </div>

                <div className="feature-grid">
                    {features.map((feature, index) => (
                        <article key={index} className="feature-card reveal">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;