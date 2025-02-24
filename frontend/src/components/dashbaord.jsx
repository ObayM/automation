import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { 
  MessageCircle, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Clock, 
  UserPlus, 
  User, 
  Hash, 
  ChevronDown, 
  ChevronUp,
  Brain,
} from 'lucide-react';
import ReactMarkdown from "react-markdown";

const API_URL = "http://127.0.0.1:8000"

const ConversationCard = ({ 
  conversation, 
  isSubscribed, 
  isSelected,
  onAnalyze 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lastMessage = conversation.messages[0];
	const subscriptionEnd = isSubscribed ? new Date(new Date(conversation.subscription_date).setDate(new Date(conversation.subscription_date).getDate() + 30)) : null;
  const remainingDays = subscriptionEnd ? differenceInDays(subscriptionEnd, new Date()) : null;
  const isExpiringSoon = remainingDays !== null && remainingDays <= 7;

  return (
    <div className={`bg-white rounded-xl shadow-lg transition-all hover:shadow-xl ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${isSubscribed ? 'bg-green-100' : 'bg-gray-100'}`}>
              <MessageCircle className={`w-6 h-6 ${isSubscribed ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{conversation.conversation_name}</h3>
              <p className="text-sm text-gray-500">
                Last active: {formatDistanceToNow(parseISO(lastMessage.created_time))} ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSubscribed && remainingDays !== null && (
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                isExpiringSoon ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {remainingDays} days remaining
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4">
                {/* IDs Section */}
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    ID: {conversation.conversation_id}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    User ID: {lastMessage.user_id}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Messages</h4>
                  <div className="space-y-3">
                    {conversation.messages.slice(0, 3).map((msg, idx) => (
                      <div key={idx} className="flex space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender === 'Ai Egypt' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {msg.sender[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{msg.sender}</p>
                          <p className="text-sm text-gray-600">{msg.message}</p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(parseISO(msg.created_time))} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyze(conversation);
                    }}
                    className={`${
                      isSelected ? 'bg-gray-100 text-gray-600' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors`}
                    disabled={isSelected}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSelected ? 'Analyzing...' : 'Analyze'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Stats Component
const StatsCard = ({ icon: Icon, title, value, gradient }) => (
  <div className={`rounded-lg p-6 shadow-lg ${gradient}`}>
    <div className="flex items-center space-x-4">
      <Icon className="w-8 h-8 text-white opacity-80" />
      <div>
        <p className="text-white text-sm">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
    </div>
  </div>
);


const AnalysisSection = ({ conversation, analysis, analyzing }) => {
  if (!conversation) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Conversation Analysis</h3>
            <p className="text-sm text-gray-500">
              Analyzing: {conversation.conversation_name}
            </p>
          </div>
        </div>
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin">
              <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Analyzing conversation patterns...</p>
          <p className="text-sm text-gray-500">This might take a few moments</p>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Select a conversation to analyze
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [aiAnalysis, setAiAnalysis] = useState(null);
	const [analyzing, setAnalyzing] = useState(false);
	

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL+'/fb');
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;

    const subscribed = data.conversations.filter(conv => conv.subscription_date);
    const unsubscribed = data.conversations.filter(conv => !conv.subscription_date);
    const renewingNextWeek = subscribed.filter(conv => {
			const endDate = new Date(new Date(conv.subscription_date).setDate(new Date(conv.subscription_date).getDate() + 30));
      const daysUntilRenewal = differenceInDays(endDate, new Date());
      return daysUntilRenewal <= 7 && daysUntilRenewal > 0;
    });

    return {
      totalSubs: subscribed.length,
      totalUnsubs: unsubscribed.length,
      renewingNextWeek: renewingNextWeek.length,
      conversionRate: ((subscribed.length / data.conversations.length) * 100).toFixed(1),
      subscribed,
      unsubscribed
    };
  }, [data]);

  const analyzeConversation = async (conversation) => {
    setAnalyzing(true);
    setSelectedConversation(conversation);
    try {
      const response = await fetch(API_URL+'/analyze-messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversation.conversation_id,
          messages: conversation.messages
        }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
			const result = await response.json();
      setAiAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center">
        <AlertCircle className="w-6 h-6 mr-3" />
        <span>{error}</span>
      </div>
    </div>
  );

  if (!data || !stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-gray-600">Last updated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatsCard
            icon={Users}
            title="Active Subscriptions"
            value={stats.totalSubs}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatsCard
            icon={Clock}
            title="Renewing Next Week"
            value={stats.renewingNextWeek}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <StatsCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            gradient="bg-gradient-to-br from-green-500 to-green-700"
          />
          <StatsCard
            icon={UserPlus}
            title="Potential Leads"
            value={stats.totalUnsubs}
            gradient="bg-gradient-to-br from-gray-500 to-gray-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-purple-800 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Active Subscribers ({stats.totalSubs})
              </h2>
              <div className="space-y-6">
                {stats.subscribed.map(conv => (
                  <ConversationCard 
                    key={conv.conversation_id} 
                    conversation={conv} 
                    isSubscribed={true}
                    isSelected={selectedConversation?.conversation_id === conv.conversation_id}
                    onAnalyze={analyzeConversation}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <UserPlus className="w-6 h-6 mr-2" />
                Potential Leads ({stats.totalUnsubs})
              </h2>
              <div className="space-y-6">
                {stats.unsubscribed.map(conv => (
                  <ConversationCard 
                    key={conv.conversation_id} 
                    conversation={conv} 
                    isSubscribed={false}
                    isSelected={selectedConversation?.conversation_id === conv.conversation_id}
                    onAnalyze={analyzeConversation}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-8 space-y-6 self-start">
            <AnalysisSection 
              conversation={selectedConversation}
              analysis={aiAnalysis}
              analyzing={analyzing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;