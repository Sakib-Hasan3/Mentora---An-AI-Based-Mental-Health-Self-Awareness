import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const menuItems = [
        { path: '/dashboard', name: 'ড্যাশবোর্ড', icon: '📊' },
        { path: '/assessment', name: 'মানসিক স্বাস্থ্য পরীক্ষা', icon: '🧠' },
        { path: '/profile', name: 'প্রোফাইল', icon: '👤' },
        { path: '/reports', name: 'রিপোর্ট', icon: '📈' },
        { path: '/resources', name: 'হেল্প ও রিসোর্স', icon: '💚' },
        { path: '/settings', name: 'সেটিংস', icon: '⚙️' },
    ];
    
    return (
        <div className={`bg-gradient-to-b from-purple-800 to-purple-900 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-20`}>
            {/* লোগো */}
            <div className="flex items-center justify-between p-4 border-b border-purple-700">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        <span className="font-bold">মেন্টাল সাথী</span>
                    </div>
                )}
                {isCollapsed && <span className="text-2xl mx-auto">🧠</span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg hover:bg-purple-700 transition"
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>
            
            {/* মেনু আইটেম */}
            <nav className="mt-8">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200
                            ${isActive 
                                ? 'bg-purple-700 text-white' 
                                : 'text-purple-200 hover:bg-purple-700 hover:text-white'
                            }
                        `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>
            
            {/* নিচের অংশ */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700">
                <button className="flex items-center gap-3 text-purple-200 hover:text-white transition w-full">
                    <span className="text-xl">🚪</span>
                    {!isCollapsed && <span>লগআউট</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;