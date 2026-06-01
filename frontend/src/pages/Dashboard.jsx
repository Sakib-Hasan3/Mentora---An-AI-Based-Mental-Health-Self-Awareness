import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [activities, setActivities] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('weekly');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, chartData, activitiesData] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/chart-data'),
                    api.get('/dashboard/recent-activity')
                ]);
                setStats(statsData);
                setChartData(chartData);
                setActivities(activitiesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'সুপ্রভাত';
        if (hour < 18) return 'শুভ বিকেল';
        return 'শুভ সন্ধ্যা';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const maxScore = 100;
    const currentScore = stats?.mental_health_score || 0;
    const progressWidth = (currentScore / maxScore) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🧠</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">Mentora</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative">
                            <span className="text-2xl">🔔</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <button 
                                onClick={logout}
                                className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 mb-8 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">{getGreeting()}</p>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                            <p className="text-purple-100">How are you feeling today? Your mental wellness journey continues.</p>
                        </div>
                        <div className="text-6xl animate-bounce hidden md:block">
                            {currentScore >= 70 ? '😊' : currentScore >= 40 ? '😐' : '😟'}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Mental Health Score</p>
                                <p className="text-3xl font-bold text-gray-800">{stats?.mental_health_score}%</p>
                                <p className="text-green-500 text-xs mt-2">↑ {stats?.improvement} from last month</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🧠</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressWidth}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Total Assessments</p>
                                <p className="text-3xl font-bold text-gray-800">{stats?.total_assessments || 0}</p>
                                <p className="text-gray-400 text-xs mt-2">Member since {stats?.member_since}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📝</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Stress Level</p>
                                <p className="text-3xl font-bold text-orange-500">{stats?.stress_level}%</p>
                                <p className="text-green-500 text-xs mt-2">↓ 12% from last week</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">😰</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Meditation Sessions</p>
                                <p className="text-3xl font-bold text-gray-800">{stats?.meditation_sessions || 0}</p>
                                <p className="text-green-500 text-xs mt-2">↑ 3 this week</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🧘</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Progress Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Mental Health Progress</h3>
                            <div className="flex gap-2">
                                {['weekly', 'monthly', 'yearly'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 rounded-lg text-sm transition ${
                                            activeTab === tab 
                                                ? 'bg-purple-600 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'Yearly'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {chartData && chartData.labels && chartData.data && (
                            <div className="space-y-3">
                                {chartData.labels.slice(-7).map((label, index) => {
                                    const value = chartData.data[chartData.data.length - 7 + index];
                                    return (
                                        <div key={index} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-16">{label}</span>
                                            <div className="flex-1">
                                                <div 
                                                    className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                                                    style={{ width: `${(value / 100) * 100}%` }}
                                                >
                                                    <span className="text-white text-sm font-medium">{value}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {chartData && chartData.total_assessments === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No assessments yet.</p>
                                <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    Take First Assessment →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                            <button className="text-purple-600 text-sm hover:underline">View all →</button>
                        </div>
                        
                        <div className="space-y-4">
                            {activities?.activities?.map((activity, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `${activity.color}20` }}>
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{activity.title}</p>
                                        <p className="text-sm text-gray-500">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-purple-600">→</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="text-3xl mb-3">🧠</div>
                        <h4 className="text-lg font-semibold mb-2">Mental Health Assessment</h4>
                        <p className="text-purple-100 text-sm mb-4">Take a quick assessment to track your mental wellness.</p>
                        <button className="bg-white/20 rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition">Start Assessment →</button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
                        <div className="text-3xl mb-3">🧘</div>
                        <h4 className="text-lg font-semibold mb-2">Meditation Session</h4>
                        <p className="text-blue-100 text-sm mb-4">10-minute guided meditation for stress relief.</p>
                        <button className="bg-white/20 rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition">Start Meditation →</button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                        <div className="text-3xl mb-3">💬</div>
                        <h4 className="text-lg font-semibold mb-2">Talk to Specialist</h4>
                        <p className="text-green-100 text-sm mb-4">Connect with a mental health professional.</p>
                        <button className="bg-white/20 rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition">Book Session →</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
