import { Link } from "react-router-dom";
import "../styles/Auth.css";

const Landing = () => {
  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">CreatorHub</span>
        <div className="navbar-actions">
          <Link to="/login" className="btn-outline">Login</Link>
          <Link to="/register" className="btn-solid">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">
          <span>📊</span>
          <span>Analytics for Creators</span>
        </div>

        <h1 className="hero-title">
          Track. Analyze.<br />Grow.
        </h1>

        <p className="hero-subtitle">
          CreatorHub gives you the tools to understand your social media
          performance and predict growth.
        </p>

        <Link to="/register" className="hero-cta">
          Get Started Free
        </Link>
      </div>
    </div>
  );
};

export default Landing;
