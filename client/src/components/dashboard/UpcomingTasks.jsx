import React from 'react';

const UpcomingTasks = () => {
  const tasks = [
    { id: 1, title: 'Clean Room 101', dueDate: 'Today', priority: 'High' },
    { id: 2, title: 'Fix AC in lobby', dueDate: 'Tomorrow', priority: 'Medium' },
    { id: 3, title: 'Prepare breakfast', dueDate: 'Tomorrow', priority: 'Low' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div>
              <p className="font-medium text-gray-800">{task.title}</p>
              <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.priority === 'High' ? 'bg-red-100 text-red-800' :
              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;