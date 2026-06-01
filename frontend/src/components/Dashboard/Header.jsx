import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
            {/* সার্চ বার */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
                <span className="text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="খুঁজুন..."
                    className="bg-transparent outline-none ml-2 w-full text-gray-600"
                />
            </div>
            
            {/* ইউজার মেনু */}
            <div className="flex items-center gap-4">
                {/* নোটিফিকেশন */}
                <button className="relative">
                    <span className="text-2xl">🔔</span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>
                
                {/* ইউজার প্রোফাইল */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="hidden md:block text-gray-700">
                            {user?.name || 'ইউজার'}
                        </span>
                    </button>
                    
                    {/* ড্রপডাউন মেনু */}
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                            <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">প্রোফাইল</a>
                            <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">সেটিংস</a>
                            <hr className="my-1" />
                            <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                                লগআউট
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;