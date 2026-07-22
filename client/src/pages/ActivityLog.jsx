import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'task_created': '📝',
      'task_updated': '✏️',
      'task_status_changed': '🔄',
      'task_completed': '✅',
      'user_created': '👤',
      'task_deleted': '🗑️'
    };
    return icons[action] || '📋';
  };

  if (loading) return <LoadingSkeleton type="table" />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h1>
      
      <div className="glass-card">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activity yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity._id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="text-2xl">{getActionIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user?.name} • {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;