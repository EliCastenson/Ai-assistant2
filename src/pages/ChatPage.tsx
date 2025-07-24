import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  Bot,
  User,
  Calendar,
  CheckSquare,
  Mail,
  Sparkles,
  RefreshCw,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { useChat, useTasks, useUpcomingEvents, useEmails, useSuggestions } from '../hooks/useApi';
import { useVoice } from '../hooks/useVoice';
import { useNotifications } from '../contexts/NotificationContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
}

const ChatPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { messages, loading: chatLoading, error: chatError, sendMessage } = useChat(sessionId);
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks({ status: 'todo' });
  const { data: upcomingEvents, loading: eventsLoading } = useUpcomingEvents(5);
  const { emails, loading: emailsLoading, syncEmails } = useEmails(5);
  const { suggestions, loading: suggestionsLoading, acceptSuggestion, dismissSuggestion } = useSuggestions();

  // Voice hook
  const { 
    isListening, 
    transcript, 
    error: voiceError, 
    toggleListening, 
    speak,
    clearTranscript 
  } = useVoice();
  
  // Notifications
  const { showNotification } = useNotifications();

  const handleSuggestionAccept = async (suggestion: any) => {
    try {
      await acceptSuggestion(suggestion.id);
      
      // Show success notification
      showNotification({
        type: 'success',
        title: 'Suggestion Accepted',
        message: `Successfully executed: ${suggestion.title || suggestion.type}`,
        duration: 3000,
      });

      // Handle specific suggestion types
      if (suggestion.type === 'task' && suggestion.data) {
        await createTask(suggestion.data);
        showNotification({
          type: 'info',
          title: 'Task Created',
          message: `Created task: ${suggestion.data.title}`,
          duration: 3000,
        });
      } else if (suggestion.type === 'calendar' && suggestion.data) {
        // TODO: Create calendar event
        showNotification({
          type: 'info',
          title: 'Event Created',
          message: `Created event: ${suggestion.data.title}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      showNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to execute the suggestion. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleSuggestionDismiss = async (suggestion: any) => {
    try {
      await dismissSuggestion(suggestion.id);
      showNotification({
        type: 'info',
        title: 'Suggestion Dismissed',
        message: 'The suggestion has been removed.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to dismiss suggestion.',
        duration: 3000,
      });
    }
  };

  const quickActions: Suggestion[] = [
    {
      id: '1',
      title: 'Create Task',
      description: 'Add a new task with priority and due date',
      action: 'Create a high-priority task to review quarterly reports by Friday',
      icon: CheckSquare,
    },
    {
      id: '2',
      title: 'Schedule Meeting',
      description: 'Book a calendar event with attendees',
      action: 'Schedule a team meeting for tomorrow at 2 PM',
      icon: Calendar,
    },
    {
      id: '3',
      title: 'Email Summary',
      description: 'Get a summary of recent emails',
      action: 'Summarize my last 5 emails and suggest replies',
      icon: Mail,
    },
    {
      id: '4',
      title: 'Quick Search',
      description: 'Search for information on any topic',
      action: 'What are the latest trends in AI productivity tools?',
      icon: Sparkles,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setInputValue('');
      clearTranscript();
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      showNotification({
        type: 'error',
        title: 'Message Failed',
        message: 'Failed to send your message. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const toggleVoiceInput = () => {
    toggleListening();
  };

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.action);
  };

  const handleQuickActionClick = (action: Suggestion) => {
    handleSendMessage(action.action);
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-3xl p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm leading-relaxed flex-1">{message.content}</p>
                    {message.type === 'assistant' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => speak(message.content)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Read aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {chatLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {chatError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Error: {chatError}
                </p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue || transcript}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type your message or ask me anything..."}
                className={`w-full p-4 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  isListening ? 'ring-2 ring-red-500' : ''
                }`}
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {voiceError && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1 text-red-500"
                    title={voiceError}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </motion.div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage(inputValue)}
              disabled={(!inputValue.trim() && !transcript.trim()) || chatLoading}
              className="p-4 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar - Suggestions/Tasks/Calendar/Emails */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          <div className="flex space-x-1 mb-6">
            {['suggestions', 'tasks', 'calendar', 'emails'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors duration-200 ${
                  activeTab === tab
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    AI Suggestions
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>

                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.slice(0, 4).map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSuggestionAccept(suggestion)}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                            title="Accept suggestion"
                          >
                            <CheckSquare className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSuggestionDismiss(suggestion)}
                            className="p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Dismiss suggestion"
                          >
                            ×
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No AI suggestions available
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Quick Actions
                      </h4>
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickActionClick(action)}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded flex items-center justify-center">
                              <action.icon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {action.title}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Recent Tasks
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tasks.length} active
                  </span>
                </div>

                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((task: any) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {task.description.length > 50 
                                  ? `${task.description.substring(0, 50)}...`
                                  : task.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'high' || task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                              }`}>
                                {task.priority}
                              </span>
                              {task.due_date && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={async () => {
                              try {
                                await updateTask(task.id, { status: 'completed' });
                                showNotification({
                                  type: 'success',
                                  title: 'Task Completed',
                                  message: `Marked "${task.title}" as completed`,
                                  duration: 3000,
                                });
                              } catch (error) {
                                showNotification({
                                  type: 'error',
                                  title: 'Error',
                                  message: 'Failed to update task status',
                                  duration: 3000,
                                });
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            title="Mark as completed"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    {tasks.length > 5 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        +{tasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet</p>
                    <p className="text-xs">Ask me to create one!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upcoming Events
                </h3>

                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : upcomingEvents && upcomingEvents.events && upcomingEvents.events.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.events.slice(0, 4).map((event: any, index: number) => (
                      <motion.div
                        key={event.id || index}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {event.title}
                        </h4>
                        {event.start_time && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(event.start_time).toLocaleString()}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            📍 {event.location}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events scheduled</p>
                    <p className="text-xs">Connect your Google Calendar</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'emails' && (
              <motion.div
                key="emails"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Recent Emails
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      try {
                        await syncEmails();
                        showNotification({
                          type: 'success',
                          title: 'Emails Synced',
                          message: 'Successfully synced with Gmail',
                          duration: 3000,
                        });
                      } catch (error) {
                        showNotification({
                          type: 'error',
                          title: 'Sync Failed',
                          message: 'Failed to sync emails. Please check your connection.',
                          duration: 5000,
                        });
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Sync emails"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>

                {emailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : emails.length > 0 ? (
                  <div className="space-y-2">
                    {emails.slice(0, 4).map((email: any) => (
                      <motion.div
                        key={email.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {email.subject}
                              </h4>
                              {!email.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              From: {email.sender_name || email.sender}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {email.snippet && email.snippet.length > 60 
                                ? `${email.snippet.substring(0, 60)}...`
                                : email.snippet}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {email.date ? new Date(email.date).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                          {email.is_important && (
                            <div className="text-yellow-500">
                              <Sparkles className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No emails loaded</p>
                    <p className="text-xs">Connect your Gmail account</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;