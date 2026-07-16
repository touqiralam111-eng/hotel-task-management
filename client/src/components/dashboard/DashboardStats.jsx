import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  FlagIcon 
} from '@heroicons/react/24/outline';

const DashboardStats = ({ stats, loading }) => {
  const statCards = [
    { 
      title: 'Total Tasks', 
      value: stats?.total || 0, 
      icon: DocumentCheckIcon, 
      color: 'text-gold',
      bg: 'bg-gold-light'
    },
    { 
      title: 'Completed', 
      value: stats?.completed || 0, 
      icon: CheckCircleIcon, 
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      title: 'In Progress', 
      value: stats?.inProgress || 0, 
      icon: ClockIcon, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'High Priority', 
      value: stats?.highPriority || 0, 
      icon: FlagIcon, 
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      title: 'Overdue', 
      value: stats?.overdue || 0, 
      icon: ExclamationCircleIcon, 
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      title: 'Total Staff', 
      value: stats?.totalStaff || 0, 
      icon: UserGroupIcon, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="stat-card fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">{stat.title}</p>
              <p className="stat-number">{stat.value}</p>
            </div>
            <div className={`stat-icon ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;