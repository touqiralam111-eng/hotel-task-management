import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { SERVER_URL } from '../services/api';
import toast from 'react-hot-toast';
import { CameraIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
    });

  // Track changes
  useEffect(() => {
    const hasChanges = 
      formData.name !== user?.name ||
      formData.email !== user?.email ||
      formData.phone !== user?.phone ||
      formData.department !== user?.department;
    setIsDirty(hasChanges);
  }, [formData, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, JPG, GIF, WEBP)');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    setUploading(true);
    try {
      const res = await api.post(
        '/users/upload-photo',
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );
      
      if (res.data.success) {
        setUser(res.data.data);
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Profile photo uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data.data);
      setIsDirty(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar || user.avatar === 'default-avatar.png') {
      return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=128`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${SERVER_URL}${user.avatar}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      
      {/* Profile Photo Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={preview || getAvatarUrl()}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=C9A84C&color=fff&size=128`;
              }}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
              disabled={uploading}
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Change Photo
            </button>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-primary-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Photo'
                  )}
                </button>
                <button
                  onClick={cancelUpload}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          >
            <option value="">Select Department</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Reception">Reception</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Laundry">Laundry</option>
            <option value="Security">Security</option>
          </select>
          <button
            type="submit"
            disabled={loading || !isDirty}
            className={`w-full py-2 rounded-md transition-colors ${
              isDirty 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Updating...' : isDirty ? 'Update Profile' : 'No Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
          />
          <input
            type="password"
            placeholder="New Password (min 6 characters)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; // ← This is the important part!