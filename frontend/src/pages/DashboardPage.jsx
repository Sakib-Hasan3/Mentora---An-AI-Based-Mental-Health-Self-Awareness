import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import WelcomeBanner from '../components/Dashboard/WelcomeBanner';
import StatsCard from '../components/Dashboard/StatsCard';
import Chart from '../components/Dashboard/Chart';
import RecentActivity from '../components/Dashboard/RecentActivity';

const Dashboard = () => {
    const [userName, setUserName] = useState('রহিম');
    
    // সিমুলেটেড স্ট্যাটস ডাটা
    const statsData = [
        { title: 'মানসিক সুস্থতা স্কোর', value: '78%', icon: '🧠', color: 'purple', change: 5 },
        { title: 'মোট অ্যাসেসমেন্ট', value: '12', icon: '📝', color: 'blue', change: 2 },
        { title: 'স্ট্রেস লেভেল', value: '৩২%', icon: '😰', color: 'orange', change: -8 },
        { title: 'মেডিটেশন সেশন', value: '৮', icon: '🧘', color: 'green', change: 3 },
    ];
    
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 ml-64">
                <Header />
                
                <main className="p-6">
                    {/* ওয়েলকাম ব্যানার */}
                    <WelcomeBanner userName={userName} />
                    
                    {/* স্ট্যাটস কার্ড */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsData.map((stat, index) => (
                            <StatsCard key={index} {...stat} />
                        ))}
                    </div>
                    
                    {/* চার্ট ও কার্যকলাপ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Chart title="মানসিক সুস্থতার প্রবণতা" />
                        <RecentActivity />
                    </div>
                    
                    {/* অতিরিক্ত বিভাগ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* কুইক অ্যাকশন */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">দ্রুত পদক্ষেপ</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-purple-50 text-purple-600 p-3 rounded-lg hover:bg-purple-100 transition">
                                    🧠 মানসিক স্বাস্থ্য পরীক্ষা করুন
                                </button>
                                <button className="w-full bg-blue-50 text-blue-600 p-3 rounded-lg hover:bg-blue-100 transition">
                                    🧘 মেডিটেশন শুরু করুন
                                </button>
                                <button className="w-full bg-green-50 text-green-600 p-3 rounded-lg hover:bg-green-100 transition">
                                    📞 বিশেষজ্ঞের সাথে কথা বলুন
                                </button>
                            </div>
                        </div>
                        
                        {/* মোটিভেশনাল টিপস */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white">
                            <div className="text-4xl mb-3">💚</div>
                            <h3 className="text-xl font-bold mb-2">আজকের টিপস</h3>
                            <p className="opacity-90 mb-4">
                                "আপনার অনুভূতিগুলোকে মূল্য দিন। আজ নিজের জন্য ১০ মিনিট সময় নিন।"
                            </p>
                            <button className="bg-white/20 rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition">
                                আরও টিপস → 
                            </button>
                        </div>
                        
                        {/* নেক্সট অ্যাসেসমেন্ট */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">পরবর্তী নির্ধারিত</h3>
                            <div className="text-center py-6">
                                <div className="text-5xl mb-3">📅</div>
                                <p className="text-gray-600">আপনার পরবর্তী সাপ্তাহিক পরীক্ষা</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">২ দিন বাকি</p>
                                <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                                    রিমাইন্ডার সেট করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;