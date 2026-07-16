import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, CheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');

  useEffect(() => {
    fetchTasks();
  }, [filters, search]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        params: { ...filters, search }
      });
      setTasks(res.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, { status });
      toast.success(`Task status updated to ${status}`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}/archive`);
      toast.success('Task archived!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to archive task');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        {isAdmin && (
          <Link
            to="/create-task"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            New Task
          </Link>
        )}
      </div>

      <TaskFilters filters={filters} setFilters={setFilters} />
      
      {/* Admin Action Buttons */}
      {isAdmin && (
        <div className="flex gap-2 mt-4 mb-4 flex-wrap">
          <button 
            onClick={() => setFilters({})} 
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
          >
            All Tasks
          </button>
          <button 
            onClick={() => setFilters({ status: 'todo' })} 
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
          >
            To Do
          </button>
          <button 
            onClick={() => setFilters({ status: 'in-progress' })} 
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200"
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilters({ status: 'completed' })} 
            className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
          >
            Completed
          </button>
          <button 
            onClick={() => setFilters({ priority: 'high' })} 
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
          >
            High Priority
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tasks.map(task => (
          <div key={task._id} className="relative">
            <TaskCard task={task} />
            
            {/* Admin Actions */}
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleStatusUpdate(task._id, 'completed')}
                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                  title="Mark Complete"
                >
                  <CheckIcon className="w-3 h-3" />
                </button>
                <Link
                  to={`/edit-task/${task._id}`}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Edit Task"
                >
                  <PencilIcon className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => handleArchiveTask(task._id)}
                  className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  title="Archive"
                >
                  <ArchiveBoxIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found</p>
          {isAdmin && (
            <Link to="/create-task" className="text-primary-600 hover:underline mt-2 inline-block">
              Create your first task
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;