import React from 'react';

const WelcomeBanner = ({ userName }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'সুপ্রভাত';
        if (hour < 18) return 'শুভ বিকেল';
        return 'শুভ সন্ধ্যা';
    };

    return (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2">
                        {getGreeting()}, {userName || 'বন্ধু'}! 👋
                    </h2>
                    <p className="text-purple-100">
                        আপনার মানসিক স্বাস্থ্যের যাত্রা আজ কেমন যাচ্ছে?
                    </p>
                </div>
                <div className="text-6xl animate-bounce">
                    🧠
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;