import { useState, useEffect, useCallback } from 'react';
import { tasksApi, calendarApi, emailApi, suggestionsApi, chatApi } from '../utils/api';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for tasks
export function useTasks(filters?: { status?: string; priority?: string; category?: string }) {
  const { data, loading, error, refetch } = useApiCall(
    () => tasksApi.getTasks(filters),
    [filters]
  );

  const createTask = async (taskData: any) => {
    try {
      await tasksApi.createTask(taskData);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: number, taskData: any) => {
    try {
      await tasksApi.updateTask(id, taskData);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksApi.deleteTask(id);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  return {
    tasks: data || [],
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
  };
}

// Hook for calendar events
export function useCalendarEvents(params?: { start_date?: string; end_date?: string }) {
  const { data, loading, error, refetch } = useApiCall(
    () => calendarApi.getEvents(params),
    [params]
  );

  const createEvent = async (eventData: any) => {
    try {
      await calendarApi.createEvent(eventData);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  const syncCalendar = async () => {
    try {
      await calendarApi.syncCalendar();
      refetch(); // Refresh after sync
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      throw error;
    }
  };

  return {
    events: data || [],
    loading,
    error,
    refetch,
    createEvent,
    syncCalendar,
  };
}

// Hook for upcoming events
export function useUpcomingEvents(limit = 5) {
  return useApiCall(() => calendarApi.getUpcoming(limit), [limit]);
}

// Hook for emails
export function useEmails(limit = 10) {
  const { data, loading, error, refetch } = useApiCall(
    () => emailApi.getRecent(limit),
    [limit]
  );

  const syncEmails = async () => {
    try {
      await emailApi.syncGmail();
      refetch(); // Refresh after sync
    } catch (error) {
      console.error('Failed to sync emails:', error);
      throw error;
    }
  };

  return {
    emails: data || [],
    loading,
    error,
    refetch,
    syncEmails,
  };
}

// Hook for email summary
export function useEmailSummary() {
  return useApiCall(() => emailApi.getSummary(), []);
}

// Hook for suggestions
export function useSuggestions(type?: string, limit = 10) {
  const { data, loading, error, refetch } = useApiCall(
    () => suggestionsApi.get(type, limit),
    [type, limit]
  );

  const acceptSuggestion = async (id: string) => {
    try {
      await suggestionsApi.accept(id);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      throw error;
    }
  };

  const dismissSuggestion = async (id: string) => {
    try {
      await suggestionsApi.dismiss(id);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
      throw error;
    }
  };

  const generateSuggestions = async () => {
    try {
      await suggestionsApi.generate();
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      throw error;
    }
  };

  return {
    suggestions: data?.suggestions || [],
    total: data?.total || 0,
    loading,
    error,
    refetch,
    acceptSuggestion,
    dismissSuggestion,
    generateSuggestions,
  };
}

// Hook for chat
export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatApi.getHistory(sessionId);
      setMessages(response.data.messages);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Send message
  const sendMessage = async (content: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message immediately
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const response = await chatApi.sendMessage(content, sessionId);
      
      // Add assistant response
      setMessages(prev => [...prev, response.data]);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (sessionId) {
      try {
        await chatApi.clearHistory(sessionId);
        setMessages([]);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    refetch: loadHistory,
  };
}