import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export function ChatTab() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold">Chat</h2>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Welcome to AI Assistant</h3>
          <p className="text-muted-foreground mb-6">
            Your intelligent personal assistant is ready to help you manage tasks, 
            schedule events, and organize your emails.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <motion.div
              className="bg-primary/10 border border-primary/20 rounded-lg p-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-semibold text-primary mb-2">Tasks</h4>
              <p className="text-sm text-muted-foreground">
                Create, organize, and track your daily tasks with priority levels.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-secondary/10 border border-secondary/20 rounded-lg p-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-semibold text-secondary-foreground mb-2">Calendar</h4>
              <p className="text-sm text-muted-foreground">
                Schedule events, meetings, and appointments with ease.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-accent/10 border border-accent/20 rounded-lg p-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="font-semibold text-accent-foreground mb-2">Emails</h4>
              <p className="text-sm text-muted-foreground">
                Manage your inbox, mark important messages, and stay organized.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}