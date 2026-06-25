import React, { useState, useEffect } from 'react';

const stats = [
    { number: 50000, label: 'সক্রিয় ইউজার', icon: '👥', suffix: '+' },
    { number: 98, label: 'সন্তুষ্টির হার', icon: '⭐', suffix: '%' },
    { number: 150, label: 'বিশেষজ্ঞ সাইকোলজিস্ট', icon: '🎓', suffix: '+' },
    { number: 24, label: 'ঘন্টা সাপোর্ট', icon: '🕐', suffix: '/৭' }
];

const Counter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(timer); } 
            else { setCount(Math.floor(start)); }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);

    return <span>{count.toLocaleString('bn-BD')}</span>;
};

const StatsSection = () => {
    return (
        <section className="stats-section">
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-item fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="stat-number">
                            <Counter end={stat.number} />
                            {stat.suffix}
                        </div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;
