import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Globe,
    TrendingUp,
    PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// BUG FIX: Sidebar no longer owns its open/close state — the header's
// hamburger button controls it via props. This avoids two separate state
// sources fighting each other. Logout button also removed from sidebar;
// it now lives exclusively in the header avatar dropdown.

export function Sidebar({ isOpen, setIsOpen }) {
    const { user } = useAuth();

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/platforms', icon: Globe,            label: 'Platforms'  },
        { to: '/analytics', icon: TrendingUp,       label: 'Analytics'  },
        { to: '/add-analytics', icon: PlusCircle,   label: 'Add Data'   },
    ];

    const close = () => setIsOpen(false);

    return (
        <>
            {/* Dark overlay behind sidebar — click to close */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={close} />
            )}

            {/* Sidebar panel */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* Logo / branding row */}
                <div className="sidebar-logo" onClick={close}>
                    <div className="sidebar-logo-icon">CH</div>
                    <span className="sidebar-logo-text">CreatorHub</span>
                </div>

                {/* Nav links */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-nav-item${isActive ? ' active' : ''}`
                            }
                            onClick={close}
                        >
                            <item.icon size={17} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User info strip at the bottom — display only, no logout */}
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.name  || 'User'}</div>
                        <div className="user-email">{user?.email || ''  }</div>
                    </div>
                </div>
            </div>
        </>
    );
}