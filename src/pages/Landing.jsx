import { useEffect } from 'react';
import CompetitiveAdvantages from '../components/landing/CompetitiveAdvantages';
import Conclusion from '../components/landing/Conclusion';
import Ecosystem from '../components/landing/Ecosystem';
import GreenEnergyStory from '../components/landing/GreenEnergyStory';
import HeroSection from '../components/landing/HeroSection';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNavbar from '../components/landing/LandingNavbar';
import NovaxisChain from '../components/landing/NovaxisChain';
import RevenueStreams from '../components/landing/RevenueStreams';
import Roadmap from '../components/landing/Roadmap';
import Tokenomics from '../components/landing/Tokenomics';
import VisionMission from '../components/landing/VisionMission';

function Landing() {
  useEffect(() => {
    // Load particles.js dynamically
    const loadParticles = async () => {
      if (!window.particlesJS) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      if (window.particlesJS) {
        window.particlesJS('particles-js', {
        particles: {
          number: { value: 80 },
          color: { value: '#00ffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: 3 },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#00ffff',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          }
        },
        retina_detect: true
        });
      }
    };

    loadParticles();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }, []);

  return (
    <div className="landing-page">
      {/* Particles Background */}
      <div id="particles-js" className="fixed inset-0 -z-10"></div>
      
      <LandingNavbar />
      {/* <HeroSection /> */}
      <VisionMission />
      <GreenEnergyStory />
      <Ecosystem />
      <NovaxisChain />
      <Tokenomics />
      <RevenueStreams />
      <Roadmap />
      <CompetitiveAdvantages />
      <Conclusion />
      <LandingFooter />
    </div>
  );
}

export default Landing;

