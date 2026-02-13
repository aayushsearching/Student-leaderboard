import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-title">Our Mission: Unlock Potential</h1>
          <p className="about-intro">
            We believe that learning should be collaborative, practical, and inspiring. MentorFlow was born from a desire to bridge the gap between academic knowledge and real-world skills, creating a community where students can grow together.
          </p>
        </div>
        <div className="about-illustration-container">
          <div className="about-abstract-shape shape-1"></div>
          <div className="about-abstract-shape shape-2"></div>
          <div className="about-card-visual">
            <div className="about-human-figure">
              <span>&#x1F5A5;&#xFE0F;</span> {/* Desktop Computer Emoji */}
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2 className="team-title">Meet the Visionaries</h2>
        <div className="team-grid-container">
          <div className="team-card">
            <h3>Aayush</h3>
            <p>Lead Developer & Founder</p>
          </div>
        </div>
      </section>

      {/* Stickers */}
      <div className="sticker sticker-1">&#x1F4A1; Vision</div>

    </div>
  );
}

export default About;

