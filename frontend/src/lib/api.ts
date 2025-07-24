import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  attendees: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string;
}

export interface EmailMessage {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  is_read: boolean;
  is_important: boolean;
  received_at: string;
  created_at: string;
}

export interface EmailMessageCreate {
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  is_important?: boolean;
  received_at: string;
}

// API functions
export const taskApi = {
  getTasks: () => api.get<Task[]>('/tasks'),
  createTask: (task: TaskCreate) => api.post<Task>('/tasks', task),
  updateTask: (id: number, task: TaskCreate) => api.put<Task>(`/tasks/${id}`, task),
  toggleTask: (id: number) => api.patch<Task>(`/tasks/${id}/toggle`),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export const calendarApi = {
  getEvents: (startDate?: string, endDate?: string) => 
    api.get<CalendarEvent[]>('/calendar', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  createEvent: (event: CalendarEventCreate) => api.post<CalendarEvent>('/calendar', event),
  updateEvent: (id: number, event: CalendarEventCreate) => api.put<CalendarEvent>(`/calendar/${id}`, event),
  deleteEvent: (id: number) => api.delete(`/calendar/${id}`),
};

export const emailApi = {
  getEmails: (isRead?: boolean, isImportant?: boolean) => 
    api.get<EmailMessage[]>('/email', { 
      params: { is_read: isRead, is_important: isImportant } 
    }),
  createEmail: (email: EmailMessageCreate) => api.post<EmailMessage>('/email', email),
  markAsRead: (id: number) => api.patch<EmailMessage>(`/email/${id}/read`),
  toggleImportant: (id: number) => api.patch<EmailMessage>(`/email/${id}/important`),
  deleteEmail: (id: number) => api.delete(`/email/${id}`),
};

export default api;