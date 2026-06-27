import React from 'react';

const WelcomeBanner = ({ user }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'সুপ্রভাত';
        if (hour < 18) return 'শুভ বিকেল';
        return 'শুভ সন্ধ্যা';
    };

    return (
        <div className="welcome-banner">
            <div className="welcome-text">
                <h3>{getGreeting()}!</h3>
                <h1>{user?.name?.split(' ')[0]} 👋</h1>
                <p>আজ আপনার দিন কেমন যাচ্ছে? আপনার মানসিক স্বাস্থ্যের যাত্রা এগিয়ে চলছে।</p>
            </div>
            <div className="welcome-emoji">
                {/* Current score will be passed from Dashboard and calculated there */}
                😊
            </div>
        </div>
    );
};

export default WelcomeBanner;