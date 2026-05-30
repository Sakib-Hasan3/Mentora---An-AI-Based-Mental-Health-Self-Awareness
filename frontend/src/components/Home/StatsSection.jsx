import React, { useState, useEffect } from 'react';

const stats = [
    {
        number: 50000,
        label: 'ট্র্যাক করা সেশন',
        icon: '👥',
        suffix: '+'
    },
    {
        number: 98,
        label: 'সন্তুষ্টির হার',
        icon: '⭐',
        suffix: '%'
    },
    {
        number: 150,
        label: 'কেয়ার বিশেষজ্ঞ',
        icon: '🎓',
        suffix: '+'
    },
    {
        number: 24,
        label: 'ঘণ্টা সহায়তা',
        icon: '🕐',
        suffix: '/7'
    }
];

const Counter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, duration]);

    return <span>{count.toLocaleString('bn-BD')}</span>;
};

const StatsSection = () => {
    return (
        <section className="stats-section">
            <div className="container">
                <div className="stats-grid reveal">
                    {stats.map((stat, index) => (
                        <article key={index} className="stat-card">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-value">
                                <Counter end={stat.number} />
                                {stat.suffix}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </article>
                    ))}
                </div>

                <div className="social-proof reveal">
                    <div className="avatar-stack">
                        <span>🙂</span>
                        <span>🙂</span>
                        <span>🙂</span>
                        <span>🙂</span>
                    </div>
                    <p>বাংলাদেশের ৫,০০০+ মানুষ মেন্টোরার সাথে আরও স্বাস্থ্যকর check-in অভ্যাস গড়ে তুলেছেন।</p>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;