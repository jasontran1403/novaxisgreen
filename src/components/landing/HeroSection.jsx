import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';

function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center pt-20 pb-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Text */}
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Novaxis is a next-generation blockchain project designed as a
              global axis of green finance.
            </h2>
            <p className="text-lg mb-8 text-gray-300 leading-relaxed">
              The project emerges amid a worldwide energy crisis characterized
              by excessive reliance on fossil fuels, soaring carbon emissions,
              and the urgent need to transition toward renewable energy. By
              integrating Blockchain, Artificial Intelligence (AI), and Green
              Energy, Novaxis offers a sustainable, transparent, and
              value-driven ecosystem that empowers individuals, businesses, and
              governments to participate in the global green financial
              revolution.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#about"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 inline-flex items-center gap-2"
              >
                Learn More <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Column - Countdown & Payment Icons */}
          {/* <div className="text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/50">
              <h3 className="text-2xl font-bold text-white mb-6">
                ICO Starts in
              </h3>
              <CountdownTimer />
              <a
                href="#"
                className="mt-6 inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Buy token
              </a>
            </div>
            <div className="flex justify-center items-center gap-6 mt-8 flex-wrap">
              <div className="text-3xl text-gray-400 hover:text-cyan-400 transition-colors">
                <i className="fab fa-cc-visa"></i>
              </div>
              <div className="text-3xl text-gray-400 hover:text-cyan-400 transition-colors">
                <i className="fab fa-cc-mastercard"></i>
              </div>
              <div className="text-3xl text-gray-400 hover:text-cyan-400 transition-colors">
                <i className="fab fa-bitcoin"></i>
              </div>
              <div className="text-3xl text-gray-400 hover:text-cyan-400 transition-colors">
                <i className="fab fa-ethereum"></i>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

