import React, { useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'রহিম উদ্দিন',
        email: 'rahim@example.com',
        phone: '01712345678',
        age: '২৫',
        gender: 'পুরুষ',
        location: 'ঢাকা, বাংলাদেশ'
    });
    
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            
            <div className="flex-1 ml-64">
                <Header />
                
                <main className="p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* প্রোফাইল হেডার */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                                🧑
                            </div>
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                            <p className="text-purple-100">সক্রিয় সদস্য • জয়েন করেছেন জানু ২০২৪</p>
                        </div>
                        
                        {/* প্রোফাইল ফর্ম */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">ব্যক্তিগত তথ্য</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-purple-600 hover:underline"
                                >
                                    {isEditing ? 'বাতিল করুন' : 'সম্পাদনা করুন'}
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {Object.entries(profile).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b">
                                        <div className="font-medium text-gray-600">
                                            {key === 'name' ? 'নাম' :
                                             key === 'email' ? 'ইমেইল' :
                                             key === 'phone' ? 'মোবাইল' :
                                             key === 'age' ? 'বয়স' :
                                             key === 'gender' ? 'লিঙ্গ' :
                                             key === 'location' ? 'ঠিকানা' : key}
                                        </div>
                                        <div className="col-span-2">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={value}
                                                    className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    onChange={(e) => setProfile({...profile, [key]: e.target.value})}
                                                />
                                            ) : (
                                                <p className="text-gray-800">{value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {isEditing && (
                                <div className="mt-6 flex gap-3">
                                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                                        সংরক্ষণ করুন
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;