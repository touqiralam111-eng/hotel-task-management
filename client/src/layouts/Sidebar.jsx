import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UsersIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../services/api';

const Sidebar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { path: '/dashboard', icon: Squares2X2Icon, label: 'Dashboard' },
    { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tasks' },
    ...(isAdmin ? [{ path: '/users', icon: UsersIcon, label: 'Users' }] : []),
    { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gold-light transition-colors"
      >
        <Bars3Icon className="w-6 h-6 text-gold" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar-elegant w-64 flex flex-col h-screen fixed top-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className="logo text-xl">Hotel Tasks</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <item.icon className="icon w-5 h-5" />
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom - User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <img
              src={user?.avatar ? `${SERVER_URL}${user.avatar}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=40`}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-gold"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=40`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;