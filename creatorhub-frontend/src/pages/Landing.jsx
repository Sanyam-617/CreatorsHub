import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Star,
  Globe,
  Activity
} from "lucide-react";
import "../styles/Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <span className="logo-icon-text">CH</span>
          </div>
          <span className="nav-logo-text">CreatorHub</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/register" className="nav-cta">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="hero-badge">
            <div className="badge-icon">
              <Zap size={20} />
            </div>
            <span>Analytics for Modern Creators</span>
          </div>

          <h1 className="hero-title">
            Understand Your
            <span className="gradient-text"> Social Impact</span>
          </h1>

          <p className="hero-subtitle">
            Track performance across all platforms, analyze engagement patterns,
            and predict growth with AI-powered insights.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="hero-cta primary">
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="hero-cta secondary">
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="proof-content"
        >
          <div className="proof-header">
            <h2>Trusted by 10,000+ Creators</h2>
            <p>Join thousands of creators already growing their audience</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">2.5M+</div>
              <div className="stat-label">Data Points Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Prediction Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <div className="stat-label">Platforms Supported</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-content"
        >
          <div className="section-header">
            <h2>How CreatorHub Works</h2>
            <p>Get started in three simple steps</p>
          </div>

          <div className="steps-grid">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="step-card"
            >
              <div className="step-icon">
                <div className="icon-bg">
                  <Globe size={24} />
                </div>
                <div className="step-number">1</div>
              </div>
              <h3>Connect Your Platforms</h3>
              <p>Link your social media accounts or import existing data in seconds</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="step-card"
            >
              <div className="step-icon">
                <div className="icon-bg">
                  <BarChart3 size={24} />
                </div>
                <div className="step-number">2</div>
              </div>
              <h3>Analyze Performance</h3>
              <p>Get deep insights into your engagement, reach, and growth trends</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="step-card"
            >
              <div className="step-icon">
                <div className="icon-bg">
                  <TrendingUp size={24} />
                </div>
                <div className="step-number">3</div>
              </div>
              <h3>Predict & Grow</h3>
              <p>Use AI-powered predictions to plan your content strategy</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-content"
        >
          <div className="section-header">
            <h2>Powerful Features for Creators</h2>
            <p>Everything you need to grow your audience</p>
          </div>

          <div className="features-grid">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="feature-card"
            >
              <div className="feature-header">
                <div className="feature-icon">
                  <BarChart3 size={28} />
                </div>
                <div className="feature-badge">
                  <Star size={14} />
                </div>
              </div>
              <h3>Advanced Analytics</h3>
              <p>Track views, engagement, and growth across all your platforms with beautiful dashboards</p>
              <div className="feature-features">
                <span>Real-time data</span>
                <span>Custom reports</span>
                <span>Export options</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="feature-card"
            >
              <div className="feature-header">
                <div className="feature-icon">
                  <TrendingUp size={28} />
                </div>
                <div className="feature-badge">
                  <Zap size={14} />
                </div>
              </div>
              <h3>Growth Predictions</h3>
              <p>AI-powered forecasts help you plan content and predict your future performance</p>
              <div className="feature-features">
                <span>Machine learning</span>
                <span>95% accuracy</span>
                <span>Weekly insights</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="feature-card"
            >
              <div className="feature-header">
                <div className="feature-icon">
                  <Shield size={28} />
                </div>
                <div className="feature-badge">
                  <Users size={14} />
                </div>
              </div>
              <h3>Team Collaboration</h3>
              <p>Work with your team to manage multiple creator accounts from one dashboard</p>
              <div className="feature-features">
                <span>Role-based access</span>
                <span>Shared reports</span>
                <span>Activity tracking</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="cta-content"
        >
          <div className="cta-text">
            <h2>Ready to Grow Your Audience?</h2>
            <p>Join thousands of creators using CreatorHub to accelerate their growth</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="cta-button primary">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link to="/dashboard" className="cta-button secondary">
              View Live Demo
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;