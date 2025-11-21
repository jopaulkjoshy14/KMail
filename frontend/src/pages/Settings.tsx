import React, { useState, useEffect } from 'react';
import { Key, User, Shield, RotateCw, History } from 'lucide-react';
import { keysAPI, usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { KeyHistory, KeyInfo, AuditLog } from '../types';
import { ValidationUtils } from '../utils/validation';
import { CryptoUtils } from '../utils/crypto';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'keys' | 'audit'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Security state
  const [keyHistory, setKeyHistory] = useState<KeyHistory[]>([]);
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (activeTab === 'keys') {
      loadKeyInfo();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadKeyInfo = async () => {
    try {
      const [historyResponse, infoResponse] = await Promise.all([
        keysAPI.getKeyHistory(),
        keysAPI.getKeyInfo(),
      ]);
      setKeyHistory(historyResponse.keyHistory);
      setKeyInfo(infoResponse.keyInfo);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load key information');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await usersAPI.getAuditLogs();
      setAuditLogs(response.logs);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load audit logs');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const validation = ValidationUtils.validateProfileUpdate(profile);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return;
    }

    try {
      await usersAPI.updateProfile(
        profile.name,
        profile.newPassword ? profile.currentPassword : undefined,
        profile.newPassword || undefined
      );

      setMessage('Profile updated successfully');
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyRotation = async () => {
    if (!window.confirm('Are you sure you want to rotate your encryption keys? This will generate new key pairs.')) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await keysAPI.rotateKeys();
      setMessage('Keys rotated successfully');
      loadKeyInfo(); // Refresh key info
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to rotate keys');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'security' as const, name: 'Security', icon: Shield },
    { id: 'keys' as const, name: 'Encryption Keys', icon: Key },
    { id: 'audit' as const, name: 'Audit Logs', icon: History },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and security preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="inline h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'profile' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Change Password</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                        value={profile.currentPassword}
                        onChange={(e) => setProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                        value={profile.newPassword}
                        onChange={(e) => setProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                        value={profile.confirmPassword}
                        onChange={(e) => setProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Encryption Keys</h2>
              <button
                onClick={handleKeyRotation}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate Keys
              </button>
            </div>

            {keyInfo && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Current Key Information</h3>
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-blue-700">Algorithms</dt>
                      <dd className="text-sm text-blue-900">{keyInfo.algorithms.join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-blue-700">Key Rotation</dt>
                      <dd className="text-sm text-blue-900">
                        {CryptoUtils.formatDate(keyInfo.keyRotationDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-blue-700">Account Created</dt>
                      <dd className="text-sm text-blue-900">
                        {CryptoUtils.formatDate(keyInfo.accountCreationDate)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {keyHistory.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Key Rotation History</h3>
                    <div className="space-y-2">
                      {keyHistory.map((history, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">{history.algorithm}</span>
                          <span className="text-sm text-gray-500">
                            {CryptoUtils.formatDate(history.rotated_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Logs</h2>
            
            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                        <p className="text-sm text-gray-500">
                          {log.resource_type} • {log.resource_id}
                        </p>
                        {log.details && (
                          <pre className="text-xs text-gray-600 mt-1">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {CryptoUtils.formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No audit logs found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
