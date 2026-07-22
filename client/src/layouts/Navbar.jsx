import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { SERVER_URL } from '../services/api';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get avatar URL for navbar
  const getAvatarUrl = () => {
    if (!user) return 'https://ui-avatars.com/api/?name=User&background=C9A84C&color=fff&size=40';

    if (!user.avatar || user.avatar.includes('default') || user.avatar.includes('ui-avatars')) {
      return `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=C9A84C&color=fff&size=40`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${SERVER_URL}${user.avatar}`;
  };

  return (
    <header className="navbar-gold h-16 flex items-center justify-between px-6">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="search-input w-full pl-10 pr-4 py-2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="notification-btn relative p-2 rounded-lg hover:bg-gold-light transition-colors"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-gold-light' : ''}`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Dropdown with Photo */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-gold-light"
          >
            <img
              src={getAvatarUrl()}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-gold"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=40`;
              }}
            />
            <span className="user-name text-sm font-medium hidden md:block">{user?.name}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=40`;
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gold-light flex items-center gap-2 transition-colors"
              >
                <UserCircleIcon className="w-4 h-4 text-gold" />
                Profile
              </button>
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gold-light flex items-center gap-2 transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4 text-gold" />
                Settings
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;