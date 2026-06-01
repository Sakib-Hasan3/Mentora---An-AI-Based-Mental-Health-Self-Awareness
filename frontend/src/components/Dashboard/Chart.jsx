import React, { useState, useEffect } from 'react';

const Chart = ({ title, data, labels }) => {
    const [activeTab, setActiveTab] = useState('weekly');
    
    // সিমুলেটেড ডাটা (পরে ব্যাকএন্ড থেকে আসবে)
    const chartData = {
        weekly: [65, 72, 68, 75, 80, 78, 82],
        monthly: [65, 70, 75, 72, 78, 80, 85, 82, 88, 85, 90, 92],
        yearly: [65, 72, 78, 85]
    };
    
    const maxValue = 100;
    const barHeight = 40;
    
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className="flex gap-2">
                    {['weekly', 'monthly', 'yearly'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 rounded-lg text-sm transition ${
                                activeTab === tab 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab === 'weekly' ? 'সাপ্তাহিক' : tab === 'monthly' ? 'মাসিক' : 'বার্ষিক'}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* চার্ট গ্রাফ */}
            <div className="space-y-3">
                {chartData[activeTab].map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-10">
                            {activeTab === 'weekly' ? ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি'][index] :
                             activeTab === 'monthly' ? `${index + 1} সপ্তাহ` :
                             `${['শীত', 'বসন্ত', 'গ্রীষ্ম', 'বর্ষা'][index]}`}
                        </span>
                        <div className="flex-1">
                            <div 
                                className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                                style={{ width: `${(value / maxValue) * 100}%` }}
                            >
                                <span className="text-white text-sm font-medium">{value}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-6">
                মানসিক সুস্থতার স্কোর (গত {activeTab === 'weekly' ? '৭ দিনে' : activeTab === 'monthly' ? '৩০ দিনে' : 'বছরে'})
            </p>
        </div>
    );
};

export default Chart;