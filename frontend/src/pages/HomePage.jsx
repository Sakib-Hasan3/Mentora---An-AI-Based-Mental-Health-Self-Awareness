import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import HowItWorks from '../components/Home/HowItWorks';
import StatsSection from '../components/Home/StatsSection';
import CTASection from '../components/Home/CTASection';
import Footer from '../components/Home/Footer';
import '../styles/home.css';

const HomePage = () => {
    return (
        <main className="home-page">
            <HeroSection />
            <FeaturesSection />
            <HowItWorks />
            <StatsSection />
            <CTASection />
            <Footer />
        </main>
    );
};

export default HomePage;
