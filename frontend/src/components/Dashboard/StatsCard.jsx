import React from 'react';

const StatsCard = ({ title, value, icon, color, change }) => {
    const colors = {
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {change && (
                        <p className={`text-xs mt-2 ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% আগের চেয়ে
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;