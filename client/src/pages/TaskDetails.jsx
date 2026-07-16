import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${id}`);
      setTask(res.data.data);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${id}/status`, { status });
      fetchTask();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/tasks/${id}/notes`, { text: note });
      setNote('');
      fetchTask();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return <div className="text-center py-12">Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/tasks')} className="text-primary-600 hover:underline mb-4">
        ← Back to Tasks
      </button>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
        </div>
        <p className="text-gray-600 mt-4">{task.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="text-sm text-gray-500">Assigned To</label>
            <p className="font-medium">{task.assignedTo?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Due Date</label>
            <p className="font-medium">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <select
              value={task.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500">Category</label>
            <p className="font-medium">{task.category?.name}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Notes</h3>
          <form onSubmit={addNote} className="mt-2 flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
              Add
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {task.notes?.map((n, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-800">{n.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.createdBy?.name} - {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;