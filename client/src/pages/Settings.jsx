import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, setUser, theme, setTheme, getSystemTheme } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: theme || 'light',
    notifications: true,
    emailAlerts: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/users/settings');
      const data = res.data.data;
      setSettings({
        theme: data.theme || 'light',
        notifications: data.notifications !== undefined ? data.notifications : true,
        emailAlerts: data.emailAlerts !== undefined ? data.emailAlerts : true
      });
      setTheme(data.theme || 'light');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/settings', settings);
      toast.success(res.data.message || 'Settings updated successfully!');
      
      setTheme(settings.theme);
      
      if (user) {
        setUser({ ...user, settings: settings });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const getThemeIcon = (themeValue) => {
    switch(themeValue) {
      case 'light': return <SunIcon className="w-5 h-5" />;
      case 'dark': return <MoonIcon className="w-5 h-5" />;
      case 'system': return <ComputerDesktopIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getThemeLabel = (themeValue) => {
    switch(themeValue) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System Default';
      default: return themeValue;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h1>

      <div className="glass-card">
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((themeOption) => (
                <button
                  key={themeOption}
                  type="button"
                  onClick={() => setSettings({...settings, theme: themeOption})}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200
                    ${settings.theme === themeOption 
                      ? 'border-gold bg-gold-light' 
                      : 'border-gray-200 hover:border-gold'
                    }
                  `}
                  style={{
                    backgroundColor: settings.theme === themeOption ? 'var(--gold-glow)' : 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span style={{ color: settings.theme === themeOption ? 'var(--gold)' : 'var(--text-secondary)' }}>
                    {getThemeIcon(themeOption)}
                  </span>
                  <span className="text-sm font-medium">{getThemeLabel(themeOption)}</span>
                  {settings.theme === themeOption && (
                    <span className="ml-1 text-gold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" style={{ borderColor: 'var(--border-color)' }} />

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Push Notifications</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive notifications for task updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Email Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email Alerts</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive email notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </form>
      </div>

      <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Current Theme: <span className="font-semibold text-gold">{getThemeLabel(theme)}</span>
        {theme === 'system' && (
          <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            (System is {getSystemTheme()})
          </span>
        )}
      </div>
    </div>
  );
};

export default Settings;