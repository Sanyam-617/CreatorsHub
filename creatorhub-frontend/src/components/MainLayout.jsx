import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PageWrapper } from './PageWrapper';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import './MainLayout.css';

export default function MainLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />

      {/* Global Header */}
      <header className="main-header" id="main-header">
        <div className="main-header-left">
          {/* Sidebar toggle button is rendered by <Sidebar /> at fixed position */}
          <span className="main-header-logo">CreatorHub</span>
        </div>
        <div className="main-header-right">
          <button
            className="header-logout-btn"
            onClick={() => logout()}
            title="Logout"
            id="header-logout-btn"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Page content rendered by React Router */}
      <div className="main-content">
        <PageWrapper key={location.pathname}>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  );
}
