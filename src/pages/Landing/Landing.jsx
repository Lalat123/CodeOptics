import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.landingContainer}>
      {/* Top Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Layers className={styles.logoIcon} size={24} />
          <span className={styles.logoText}>CODEOPTICS</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.loginLink} onClick={handleStart}>
            Log In
          </button>
          <button className={styles.getStartedBtn} onClick={handleStart}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Master complex data structures<br />
          with interactive<br />
          <span className={styles.highlightText}>visualizations & deep theory.</span>
        </h1>
        
        <p className={styles.heroSubtitle}>
          Dive deep into algorithms like Segment Trees. Understand the mathematical theory, learn the code, and play with interactive visualizers to master competitive programming.
        </p>
        
        <div className={styles.heroActions}>
          <button className={styles.primaryBtn} onClick={handleStart}>
            Start Learning
          </button>
          <button className={styles.secondaryBtn} onClick={handleLearnMore}>
            Learn More
          </button>
        </div>
      </main>

      {/* Features / Images Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresWrapper}>
          <div className={styles.featureLeft}>
            <img src="/Segment tree logo1.jpg" alt="Segment Tree Logo" className={styles.logoFeatureImage} />
          </div>
          <div className={styles.featureRight}>
            <img src="/page1.2.jpg" alt="CodeOptics Interface" className={styles.screenshotFeatureImage} />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className={styles.footerContainer}>
        <div className={styles.backToTop} onClick={handleBackToTop}>
          Back to top
        </div>
        
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h3>Get to Know Us</h3>
            <ul>
              <li><a href="#">About CodeOptics</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press Releases</a></li>
              <li><a href="#">CodeOptics Science</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Connect with Us</h3>
            <ul>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Contact Us</h3>
            <ul>
              <li><a href="mailto:contact@codeoptics.com">contact@codeoptics.com</a></li>
              <li><a href="tel:+11234567890">+1 (123) 456-7890</a></li>
              <li><a href="#">Support Center</a></li>
              <li><a href="#">Feedback</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Let Us Help You</h3>
            <ul>
              <li><a href="#">Your Account</a></li>
              <li><a href="#">Returns Centre</a></li>
              <li><a href="#">100% Purchase Protection</a></li>
              <li><a href="#">CodeOptics App Download</a></li>
              <li><a href="#">Help</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerLogoContainer}>
            <Layers className={styles.footerLogoIcon} size={32} />
            <span className={styles.footerLogoText}>CODEOPTICS</span>
          </div>
          <div className={styles.footerSettings}>
            <button className={styles.footerLangBtn}>🌐 English</button>
            <button className={styles.footerRegionBtn}>🇮🇳 India</button>
          </div>
          <div className={styles.footerCopyright}>
            © 2026 CodeOptics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
