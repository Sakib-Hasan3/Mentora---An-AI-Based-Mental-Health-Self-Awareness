import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const WellnessHub = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mood');
    const [todayMood, setTodayMood] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [affirmation, setAffirmation] = useState('');
    const [tips, setTips] = useState([]);
    const [gratitudeNote, setGratitudeNote] = useState('');
    const [savedGratitude, setSavedGratitude] = useState('');
    const [gratitudeSaved, setGratitudeSaved] = useState(false);
    const [moodSaved, setMoodSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Breathing exercise state
    const [breathPhase, setBreathPhase] = useState('idle'); // idle, inhale, hold, exhale
    const [breathCount, setBreathCount] = useState(0);
    const [breathCycles, setBreathCycles] = useState(0);
    const breathTimerRef = useRef(null);

    const moods = [
        { value: 5, emoji: '😄', label: 'দুর্দান্ত', color: '#10b981' },
        { value: 4, emoji: '😊', label: 'ভালো', color: '#06b6d4' },
        { value: 3, emoji: '😐', label: 'ঠিক আছে', color: '#f59e0b' },
        { value: 2, emoji: '😔', label: 'মন খারাপ', color: '#f97316' },
        { value: 1, emoji: '😢', label: 'খুব কষ্ট', color: '#ef4444' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [moodData, streakData, affirmData, gratData] = await Promise.allSettled([
                api.get('/wellness/mood'),
                api.get('/wellness/streak'),
                api.get('/wellness/affirmation'),
                api.get('/wellness/gratitude'),
            ]);

            if (moodData.status === 'fulfilled') {
                setTodayMood(moodData.value?.today);
                setMoodHistory(moodData.value?.history || []);
            }
            if (streakData.status === 'fulfilled') {
                setStreak(streakData.value?.streak || 0);
            }
            if (affirmData.status === 'fulfilled') {
                setAffirmation(affirmData.value?.affirmation || '');
                setTips(affirmData.value?.tips || []);
            }
            if (gratData.status === 'fulfilled') {
                setSavedGratitude(gratData.value?.note || '');
                setGratitudeNote(gratData.value?.note || '');
            }
        } catch (err) {
            console.error('Failed to load wellness data:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveMood = async (mood) => {
        try {
            await api.post('/wellness/mood', { mood: mood.value, emoji: mood.emoji });
            setTodayMood({ mood: mood.value, emoji: mood.emoji });
            setMoodSaved(true);
            // Update streak
            const s = await api.get('/wellness/streak');
            setStreak(s.streak || 0);
            setTimeout(() => setMoodSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save mood:', err);
        }
    };

    const saveGratitude = async () => {
        if (!gratitudeNote.trim()) return;
        try {
            await api.post('/wellness/gratitude', { note: gratitudeNote });
            setSavedGratitude(gratitudeNote);
            setGratitudeSaved(true);
            setTimeout(() => setGratitudeSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save gratitude:', err);
        }
    };

    // Breathing exercise
    const startBreathing = () => {
        setBreathCycles(0);
        runBreathCycle(0);
    };

    const runBreathCycle = (cycle) => {
        if (cycle >= 4) {
            setBreathPhase('idle');
            setBreathCount(0);
            return;
        }
        // Inhale 4s
        setBreathPhase('inhale');
        setBreathCount(4);
        let c = 4;
        const inhaleInterval = setInterval(() => {
            c--;
            setBreathCount(c);
            if (c <= 0) {
                clearInterval(inhaleInterval);
                // Hold 4s
                setBreathPhase('hold');
                let h = 4;
                setBreathCount(h);
                const holdInterval = setInterval(() => {
                    h--;
                    setBreathCount(h);
                    if (h <= 0) {
                        clearInterval(holdInterval);
                        // Exhale 6s
                        setBreathPhase('exhale');
                        let e = 6;
                        setBreathCount(e);
                        const exhaleInterval = setInterval(() => {
                            e--;
                            setBreathCount(e);
                            if (e <= 0) {
                                clearInterval(exhaleInterval);
                                setBreathCycles(cycle + 1);
                                runBreathCycle(cycle + 1);
                            }
                        }, 1000);
                    }
                }, 1000);
            }
        }, 1000);
    };

    const stopBreathing = () => {
        setBreathPhase('idle');
        setBreathCount(0);
        setBreathCycles(0);
    };

    const getMoodEmoji = (val) => moods.find(m => m.value === val)?.emoji || '😐';
    const getMoodColor = (val) => moods.find(m => m.value === val)?.color || '#a8c0b5';
    const getMoodLabel = (val) => moods.find(m => m.value === val)?.label || '';

    const breathConfig = {
        inhale: { label: 'শ্বাস নিন...', color: '#10b981', bgColor: 'rgba(16,185,129,0.15)', scale: 1.3 },
        hold: { label: 'ধরে রাখুন...', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.15)', scale: 1.3 },
        exhale: { label: 'শ্বাস ছাড়ুন...', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.15)', scale: 1.0 },
        idle: { label: 'শুরু করতে ক্লিক করুন', color: '#a8c0b5', bgColor: 'rgba(168,192,181,0.1)', scale: 1.0 },
    };
    const bc = breathConfig[breathPhase];

    const tabs = [
        { id: 'mood', label: 'মেজাজ', icon: '😊' },
        { id: 'breathing', label: 'শ্বাস', icon: '🫁' },
        { id: 'gratitude', label: 'কৃতজ্ঞতা', icon: '🙏' },
        { id: 'tips', label: 'পরামর্শ', icon: '💡' },
    ];

    return (
        <div style={styles.page}>
            <Header />

            <div style={styles.container}>
                {/* Hero Section */}
                <div style={styles.hero}>
                    <div style={styles.heroContent}>
                        <div style={styles.streakBadge}>
                            🔥 {streak} দিনের ধারাবাহিকতা
                        </div>
                        <h1 style={styles.heroTitle}>🌿 ওয়েলনেস হাব</h1>
                        <p style={styles.heroSubtitle}>
                            আজকের অনুপ্রেরণা: <em>"{affirmation}"</em>
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.id ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={styles.tabContent}>

                    {/* MOOD TAB */}
                    {activeTab === 'mood' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>😊 আজ আপনার মেজাজ কেমন?</h2>
                            {todayMood ? (
                                <div style={styles.moodChecked}>
                                    <div style={{ fontSize: '4rem' }}>{todayMood.emoji}</div>
                                    <p style={{ color: '#a8c0b5', marginTop: '0.5rem' }}>
                                        আজকের মেজাজ: <strong style={{ color: getMoodColor(todayMood.mood) }}>{getMoodLabel(todayMood.mood)}</strong>
                                    </p>
                                    <p style={{ color: '#6b8a7a', fontSize: '0.9rem' }}>পরিবর্তন করতে নিচে ক্লিক করুন</p>
                                </div>
                            ) : (
                                <p style={{ color: '#a8c0b5', textAlign: 'center', marginBottom: '1.5rem' }}>
                                    আজ এখনো মেজাজ রেকর্ড করা হয়নি
                                </p>
                            )}

                            <div style={styles.moodGrid}>
                                {moods.map(mood => (
                                    <button
                                        key={mood.value}
                                        style={{
                                            ...styles.moodBtn,
                                            border: todayMood?.mood === mood.value ? `2px solid ${mood.color}` : '2px solid transparent',
                                            background: todayMood?.mood === mood.value ? `${mood.color}22` : 'rgba(255,255,255,0.04)',
                                        }}
                                        onClick={() => saveMood(mood)}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{mood.emoji}</span>
                                        <span style={{ color: mood.color, fontSize: '0.85rem', fontWeight: '600' }}>{mood.label}</span>
                                    </button>
                                ))}
                            </div>

                            {moodSaved && (
                                <div style={styles.successMsg}>✅ মেজাজ সংরক্ষিত হয়েছে!</div>
                            )}

                            {/* Mood History */}
                            {moodHistory.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{ color: '#eff8f3', marginBottom: '1rem', fontSize: '1rem' }}>📅 সাম্প্রতিক মেজাজের ইতিহাস</h3>
                                    <div style={styles.moodHistory}>
                                        {moodHistory.slice(0, 7).map((m, i) => (
                                            <div key={i} style={styles.moodHistoryItem}>
                                                <div style={{ fontSize: '1.5rem' }}>{m.emoji}</div>
                                                <div style={{ color: '#6b8a7a', fontSize: '0.7rem' }}>
                                                    {new Date(m.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* BREATHING TAB */}
                    {activeTab === 'breathing' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>🫁 গভীর শ্বাসের ব্যায়াম</h2>
                            <p style={{ color: '#a8c0b5', textAlign: 'center', marginBottom: '2rem' }}>
                                ৪-৪-৬ পদ্ধতি: ৪ সেকেন্ড নিন, ৪ সেকেন্ড ধরুন, ৬ সেকেন্ড ছাড়ুন
                            </p>

                            <div style={styles.breathCircleWrapper}>
                                <div
                                    style={{
                                        ...styles.breathCircle,
                                        background: bc.bgColor,
                                        border: `3px solid ${bc.color}`,
                                        transform: `scale(${bc.scale})`,
                                        boxShadow: breathPhase !== 'idle' ? `0 0 40px ${bc.color}55` : 'none',
                                    }}
                                >
                                    <div style={{ fontSize: '3rem' }}>
                                        {breathPhase === 'inhale' ? '🌬️' : breathPhase === 'hold' ? '🧘' : breathPhase === 'exhale' ? '💨' : '🌿'}
                                    </div>
                                    {breathPhase !== 'idle' && (
                                        <div style={{ color: bc.color, fontSize: '2.5rem', fontWeight: '700' }}>{breathCount}</div>
                                    )}
                                    <div style={{ color: bc.color, fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' }}>
                                        {bc.label}
                                    </div>
                                </div>
                            </div>

                            {breathPhase !== 'idle' && (
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <span style={{ color: '#a8c0b5' }}>চক্র: {breathCycles + 1} / 4</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                {breathPhase === 'idle' ? (
                                    <button onClick={startBreathing} style={styles.btnGreen}>
                                        🌿 শুরু করুন
                                    </button>
                                ) : (
                                    <button onClick={stopBreathing} style={styles.btnRed}>
                                        ⛔ থামুন
                                    </button>
                                )}
                            </div>

                            <div style={styles.breathingTips}>
                                <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>কেন গুরুত্বপূর্ণ?</h4>
                                <ul style={{ color: '#a8c0b5', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
                                    <li>মানসিক চাপ ও উদ্বেগ কমায়</li>
                                    <li>মনোযোগ বাড়ায়</li>
                                    <li>ঘুমের মান উন্নত করে</li>
                                    <li>হৃদযন্ত্রের স্বাস্থ্য ভালো রাখে</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* GRATITUDE TAB */}
                    {activeTab === 'gratitude' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>🙏 কৃতজ্ঞতা জার্নাল</h2>
                            <p style={{ color: '#a8c0b5', textAlign: 'center', marginBottom: '1.5rem' }}>
                                আজকে আপনি কোন বিষয়গুলোর জন্য কৃতজ্ঞ? মনের কথা লিখুন।
                            </p>

                            <textarea
                                style={styles.textarea}
                                value={gratitudeNote}
                                onChange={e => setGratitudeNote(e.target.value)}
                                placeholder="যেমন: আজকের সুন্দর আবহাওয়ার জন্য, পরিবারের জন্য, সুস্বাস্থ্যের জন্য..."
                                rows={6}
                            />

                            <button
                                onClick={saveGratitude}
                                style={styles.btnGreen}
                                disabled={!gratitudeNote.trim()}
                            >
                                🙏 সংরক্ষণ করুন
                            </button>

                            {gratitudeSaved && (
                                <div style={styles.successMsg}>✅ কৃতজ্ঞতা সংরক্ষিত হয়েছে!</div>
                            )}

                            {savedGratitude && (
                                <div style={styles.savedNote}>
                                    <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✍️ আজকের নোট:</h4>
                                    <p style={{ color: '#eff8f3', lineHeight: '1.7' }}>{savedGratitude}</p>
                                </div>
                            )}

                            <div style={styles.gratitudeInfo}>
                                <p style={{ color: '#a8c0b5', fontSize: '0.9rem', lineHeight: '1.7' }}>
                                    💡 গবেষণায় দেখা গেছে, প্রতিদিন কৃতজ্ঞতা প্রকাশ করলে মানসিক স্বাস্থ্য উন্নত হয়,
                                    বিষণ্নতা কমে এবং সুখানুভূতি বাড়ে।
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TIPS TAB */}
                    {activeTab === 'tips' && (
                        <div>
                            <h2 style={{ ...styles.cardTitle, textAlign: 'center', marginBottom: '1.5rem' }}>💡 আজকের স্বাস্থ্যকর পরামর্শ</h2>
                            <div style={styles.tipsGrid}>
                                {tips.map((tip, i) => (
                                    <div key={i} style={styles.tipCard}>
                                        <div style={styles.tipIcon}>{tip.icon}</div>
                                        <h3 style={{ color: '#eff8f3', marginBottom: '0.5rem' }}>{tip.title}</h3>
                                        <p style={{ color: '#a8c0b5', lineHeight: '1.7', fontSize: '0.95rem' }}>{tip.body}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Affirmation card */}
                            <div style={styles.affirmationCard}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✨</div>
                                <h3 style={{ color: '#10b981', marginBottom: '0.75rem' }}>আজকের অনুপ্রেরণা</h3>
                                <p style={{ color: '#eff8f3', fontSize: '1.1rem', lineHeight: '1.8', fontStyle: 'italic' }}>
                                    "{affirmation}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1a2e 100%)',
        paddingTop: '70px',
    },
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    hero: {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.08))',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
    },
    heroContent: {},
    streakBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(245,158,11,0.15)',
        border: '1px solid rgba(245,158,11,0.3)',
        color: '#f59e0b',
        padding: '0.4rem 1rem',
        borderRadius: '100px',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '1rem',
    },
    heroTitle: {
        fontSize: '2rem',
        color: '#eff8f3',
        fontWeight: '700',
        marginBottom: '0.75rem',
    },
    heroSubtitle: {
        color: '#a8c0b5',
        fontSize: '1rem',
        lineHeight: '1.7',
        maxWidth: '550px',
        margin: '0 auto',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.6rem 1.2rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '100px',
        color: '#a8c0b5',
        cursor: 'pointer',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
    },
    tabActive: {
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.4)',
        color: '#10b981',
    },
    tabContent: {},
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '2rem',
    },
    cardTitle: {
        color: '#eff8f3',
        fontSize: '1.4rem',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    moodChecked: {
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    moodGrid: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    moodBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '1rem',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '80px',
    },
    moodHistory: {
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
    },
    moodHistoryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'rgba(255,255,255,0.04)',
        padding: '0.75rem',
        borderRadius: '12px',
        minWidth: '60px',
    },
    successMsg: {
        textAlign: 'center',
        color: '#10b981',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '10px',
        padding: '0.75rem',
        marginTop: '1rem',
    },
    breathCircleWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '220px',
        marginBottom: '1.5rem',
    },
    breathCircle: {
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        transition: 'all 1s ease-in-out',
    },
    breathingTips: {
        marginTop: '2rem',
        background: 'rgba(16,185,129,0.05)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: '12px',
        padding: '1.25rem',
    },
    btnGreen: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '0.75rem 2rem',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'block',
        margin: '1rem auto 0',
        transition: 'all 0.2s',
    },
    btnRed: {
        background: 'rgba(239,68,68,0.15)',
        color: '#ef4444',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px',
        padding: '0.75rem 2rem',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    textarea: {
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#eff8f3',
        padding: '1rem',
        fontSize: '1rem',
        lineHeight: '1.7',
        resize: 'vertical',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        marginBottom: '1rem',
    },
    savedNote: {
        marginTop: '1.5rem',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px',
        padding: '1.25rem',
    },
    gratitudeInfo: {
        marginTop: '1.5rem',
        background: 'rgba(6,182,212,0.06)',
        border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: '12px',
        padding: '1.25rem',
    },
    tipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    tipCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        textAlign: 'center',
        transition: 'all 0.2s',
    },
    tipIcon: {
        fontSize: '2.5rem',
        marginBottom: '0.75rem',
    },
    affirmationCard: {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '1.5rem',
    },
};

export default WellnessHub;
