import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const SearchPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://8000-idx-automatio-1740212543357.cluster-rz2e7e5f5ff7owzufqhsecxujc.cloudworkstations.dev/fb/');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        setConversations(data.conversations);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results = [];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (
          msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({
            ...msg,
            conversationName: conv.conversation_name,
            conversationId: conv.conversation_id
          });
        }
      });
    });
    return results;
  }, [conversations, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Search Messages</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Search in messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {searchQuery && (
            <p className="text-sm text-gray-600 mb-4">
              Found {searchResults.length} matching messages
            </p>
          )}
          
          {searchResults.map((result, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  result.sender === 'Ai Egypt' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {result.sender[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{result.sender}</span>
                    <span className="text-sm text-gray-500">in {result.conversationName}</span>
                    <span className="text-sm text-gray-400">
                      · {formatDistanceToNow(parseISO(result.created_time))} ago
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{result.message}</p>
                </div>
              </div>
            </div>
          ))}

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No messages found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;