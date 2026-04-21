import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Globe,
    TrendingUp,
    PlusCircle,
    LogOut,
    User,
    Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/platforms', icon: Globe, label: 'Platforms' },
        { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
        { to: '/add-analytics', icon: PlusCircle, label: 'Add Data' },
    ];

    return (
        <>
            {/* Hamburger toggle button — visible when sidebar is closed */}
            {!isOpen && (
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsOpen(true)}
                    title="Open menu"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Overlay — closes sidebar on click */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>
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
                            onClick={() => setIsOpen(false)}
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