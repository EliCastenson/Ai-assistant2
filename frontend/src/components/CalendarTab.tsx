import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Trash2 } from 'lucide-react';
import { calendarApi, CalendarEvent, CalendarEventCreate } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export function CalendarTab() {
  const [newEvent, setNewEvent] = useState<CalendarEventCreate>({
    title: '',
    start_time: '',
    end_time: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await calendarApi.getEvents();
      return response.data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setNewEvent({ title: '', start_time: '', end_time: '' });
      setShowAddForm(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title.trim() && newEvent.start_time && newEvent.end_time) {
      createEventMutation.mutate(newEvent);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading calendar events. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-lg p-4 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              placeholder="Event title..."
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Description (optional)..."
              value={newEvent.description || ''}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Location (optional)..."
              value={newEvent.location || ''}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createEventMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              layout
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  {event.description && (
                    <p className="text-muted-foreground mt-1">{event.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(parseISO(event.start_time), 'MMM d, yyyy h:mm a')} - 
                        {format(parseISO(event.end_time), 'h:mm a')}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.attendees && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Attendees</span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => deleteEventMutation.mutate(event.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events scheduled. Create your first event!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}