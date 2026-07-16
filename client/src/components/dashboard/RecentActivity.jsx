import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, action: 'Task completed', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'New task created', user: 'Jane Smith', time: '3 hours ago' },
    { id: 3, action: 'Task assigned', user: 'Mike Johnson', time: '5 hours ago' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map(activity => (
          <div key={activity.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div>
              <p className="font-medium text-gray-800">{activity.action}</p>
              <p className="text-sm text-gray-500">{activity.user}</p>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;