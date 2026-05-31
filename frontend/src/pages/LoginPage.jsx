import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    return (
        <div className="container" style={{ padding: '48px 0' }}>
            <h2>লগইনপেজ (ধারণাগত)</h2>
            <p>এই পাতা এখনও তৈরি করা হয়নি — ডেমোর জন্য আপনি <Link to="/signup">সাইনআপ পেজে</Link> ফিরে যেতে পারেন।</p>
        </div>
    );
};

export default LoginPage;
