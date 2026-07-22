import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import UpcomingTasks from '../components/dashboard/UpcomingTasks';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <DashboardStats stats={stats} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentActivity />
        <UpcomingTasks />
      </div>
    </div>
  );
};

export default Dashboard;