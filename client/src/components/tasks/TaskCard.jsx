import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const TaskCard = ({ task }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200">
      <Link to={`/tasks/${task._id}`}>
        <h3 className="font-semibold text-gray-900 hover:text-primary-600">{task.title}</h3>
      </Link>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center mt-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">
          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">{task.assignedTo?.name}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.status === 'completed' ? 'bg-green-100 text-green-800' :
          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;