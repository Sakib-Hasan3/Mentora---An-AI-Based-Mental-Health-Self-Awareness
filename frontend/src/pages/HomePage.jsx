import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import HowItWorks from '../components/Home/HowItWorks';
import StatsSection from '../components/Home/StatsSection';
import Footer from '../components/Home/Footer';

const HomePage = () => {
    return (
        <main className="home-page app-shell">
            <HeroSection />
            <FeaturesSection />
            <HowItWorks />
            <StatsSection />
            <Footer />
        </main>
    );
};

export default HomePage;
