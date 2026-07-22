import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { SERVER_URL } from '../../services/api';

const UserCard = ({ user }) => {
  // Function to get correct avatar URL
  const getAvatarUrl = () => {
    if (!user?.avatar || user.avatar === 'default-avatar.png') {
      // Use UI Avatars API as fallback
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=C9A84C&color=fff&size=80`;
    }
    
    // If avatar starts with http, it's a full URL
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    
    // For local uploads, prepend server URL
    if (user.avatar.startsWith('/uploads/')) {
      return `${SERVER_URL}${user.avatar}`;
    }
    
    // Fallback to UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=C9A84C&color=fff&size=80`;
  };

  return (
    <div className="task-card hover:shadow-md transition-shadow p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={getAvatarUrl()}
            alt={user?.name || 'User'}
            className="w-12 h-12 rounded-full object-cover border-2 border-gold"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=C9A84C&color=fff&size=80`;
            }}
          />
          {/* Online status indicator - optional */}
          {user?.isActive && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              user?.role === 'admin' 
                ? 'bg-gold-light text-gold-dark' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {user?.role}
            </span>
            {user?.department && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {user?.department}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;