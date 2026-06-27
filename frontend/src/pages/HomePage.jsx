import React from 'react';
import { Navbar, HeroSection, FeaturesSection, HowItWorks, StatsSection, CTASection, Footer } from '../components/Home/HomeComponents';
import '../styles/home.css';

const HomePage = () => {
    return (
        <main className="home-page">
            <Navbar />
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
