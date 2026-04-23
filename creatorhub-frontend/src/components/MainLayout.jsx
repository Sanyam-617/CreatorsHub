import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';
import '../App.css';

export default function MainLayout() {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* ── Global Header ── */}
      <header className="main-header">

        {/* LEFT — CreatorHub brand on top, three-line hamburger below */}
        <div className="main-header-left">
          <span className="main-header-logo">CreatorHub</span>

          {/* Pure three-line hamburger — no text */}
          <button
            className="main-hamburger-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
            title="Toggle menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        {/* RIGHT — avatar with dropdown */}
        <div className="main-header-right" ref={dropdownRef}>
          <button
            className="header-avatar-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-expanded={dropdownOpen}
            title="Account"
          >
            <span className="header-avatar-initials">{initials}</span>
          </button>

          {dropdownOpen && (
            <div className="header-dropdown">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar-large">{initials}</div>
                <div className="dropdown-user-text">
                  <span className="dropdown-user-name">{user?.name || 'User'}</span>
                  <span className="dropdown-user-email">{user?.email || ''}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={14} />
                <span>View Profile</span>
              </button>

              <button
                className="dropdown-item dropdown-item--danger"
                onClick={() => { setDropdownOpen(false); logout(); }}
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}