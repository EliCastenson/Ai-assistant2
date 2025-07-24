import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Clock, AlertCircle, Trash2, CheckSquare } from 'lucide-react';
import { taskApi, Task, TaskCreate } from '@/lib/api';
import { format } from 'date-fns';

export function TasksTab() {
  const [newTask, setNewTask] = useState<TaskCreate>({ title: '', priority: 'medium' });
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await taskApi.getTasks();
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask({ title: '', priority: 'medium' });
      setShowAddForm(false);
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: taskApi.toggleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-950';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
        <p className="text-destructive">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
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
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center space-x-4">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className={`bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md ${
                task.completed ? 'opacity-60' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              layout
            >
              <div className="flex items-start space-x-3">
                <motion.button
                  onClick={() => toggleTaskMutation.mutate(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 transition-colors ${
                    task.completed
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border hover:border-primary'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {task.completed && <Check className="w-3 h-3" />}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      <span className="capitalize">{task.priority}</span>
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={() => deleteTaskMutation.mutate(task.id)}
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

        {tasks.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}