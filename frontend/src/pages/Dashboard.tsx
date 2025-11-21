import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Inbox, Shield, Key, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { messagesAPI } from '../services/api';
import { UserStats } from '../types';
import { CryptoUtils } from '../utils/crypto';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ inbox: 0, unread: 0, sent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await messagesAPI.getMessageStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    link: string;
  }> = ({ title, value, icon, color, link }) => (
    <Link
      to={link}
      className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${color}`}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {loading ? '...' : value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );

  const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
  }> = ({ title, description, icon, link }) => (
    <Link
      to={link}
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-200"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Secure quantum-resistant email platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Unread Messages"
          value={stats.unread}
          icon={<Mail className="h-6 w-6 text-blue-600" />}
          color="border-l-4 border-blue-500"
          link="/inbox"
        />
        <StatCard
          title="Inbox Messages"
          value={stats.inbox}
          icon={<Inbox className="h-6 w-6 text-green-600" />}
          color="border-l-4 border-green-500"
          link="/inbox"
        />
        <StatCard
          title="Sent Messages"
          value={stats.sent}
          icon={<Send className="h-6 w-6 text-purple-600" />}
          color="border-l-4 border-purple-500"
          link="/inbox?filter=sent"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Compose Message"
            description="Send a new quantum-resistant encrypted message"
            icon={<MessageSquare className="h-8 w-8 text-primary-600" />}
            link="/compose"
          />
          <FeatureCard
            title="View Inbox"
            description="Check your received messages"
            icon={<Inbox className="h-8 w-8 text-primary-600" />}
            link="/inbox"
          />
          <FeatureCard
            title="Manage Keys"
            description="Rotate your encryption keys"
            icon={<Key className="h-8 w-8 text-primary-600" />}
            link="/settings"
          />
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Status</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Quantum-Resistant Encryption Active
                </h4>
                <p className="text-sm text-gray-500">
                  Your messages are protected with CRYSTALS-Kyber and CRYSTALS-Dilithium
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Key Rotation</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.key_rotated_at 
                  ? CryptoUtils.formatDate(user.key_rotated_at)
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
