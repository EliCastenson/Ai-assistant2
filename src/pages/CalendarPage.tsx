import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, RefreshCw, Loader2, Clock, MapPin, Users } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useApi';

const CalendarPage: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const { events, loading, error, refetch, syncCalendar } = useCalendarEvents();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncCalendar();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatEventTime = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (endTime) {
      const end = new Date(endTime);
      const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

  const getEventDate = (startTime: string) => {
    const start = new Date(startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (start.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (start.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-gray-50 dark:bg-gray-900 p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage your schedule
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{syncing ? 'Syncing...' : 'Sync'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </motion.button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto text-red-400 dark:text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Error loading events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refetch}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                Try Again
              </motion.button>
            </div>
          ) : events.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event: any, index: number) => (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {event.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                          {getEventDate(event.start_time)}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatEventTime(event.start_time, event.end_time)}</span>
                        </span>
                        
                        {event.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </span>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees.length} attendees</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Connect your Google Calendar
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Link your Google account to view and manage your calendar events.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSync}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                Connect Google Calendar
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;