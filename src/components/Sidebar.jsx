import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  TrendingUp, 
  PlusCircle, 
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/platforms', icon: Globe, label: 'Platforms' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/add-analytics', icon: PlusCircle, label: 'Add Data' },
  ];

  return (
    <>
      {/* Backdrop overlay — visible only when sidebar is open */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            CH
          </div>
          <span className="sidebar-logo-text">CreatorHub</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button 
            className="logout-btn"
            onClick={() => logout()}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
