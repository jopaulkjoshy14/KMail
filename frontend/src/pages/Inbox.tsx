import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, Search, Filter, Trash2, Eye, EyeOff } from 'lucide-react';
import { messagesAPI } from '../services/api';
import { MessageListItem, Pagination } from '../types';
import { CryptoUtils } from '../utils/crypto';

const Inbox: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filter = searchParams.get('filter') || 'inbox';
  const page = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    loadMessages();
  }, [filter, page, searchQuery]);

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (filter === 'sent') {
        response = await messagesAPI.getSent(page, pagination.limit);
      } else {
        response = await messagesAPI.getInbox(page, pagination.limit);
      }
      
      setMessages(response.messages);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await messagesAPI.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete message');
    }
  };

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilter: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', newFilter);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {filter === 'sent' ? 'Sent Messages' : 'Inbox'}
        </h1>
        <p className="text-gray-600">
          {filter === 'sent' 
            ? 'Messages you have sent' 
            : 'Messages you have received'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('inbox')}
            className={`px-4 py-2 rounded-md border ${
              filter === 'inbox'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => handleFilterChange('sent')}
            className={`px-4 py-2 rounded-md border ${
              filter === 'sent'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {messages.map((message) => (
            <li key={message.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <Link
                      to={`/message/${message.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900 truncate"
                    >
                      {message.subject || '(No Subject)'}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">
                      {filter === 'sent'
                        ? `To: ${message.recipient_email}`
                        : `From: ${message.sender_name} <${message.sender_email}>`
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      {CryptoUtils.formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {filter === 'inbox' && !message.is_read && (
                    <EyeOff className="h-4 w-4 text-yellow-500" title="Unread" />
                  )}
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Empty State */}
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'sent'
                ? "You haven't sent any messages yet."
                : "You don't have any messages in your inbox."
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
