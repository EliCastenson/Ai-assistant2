import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Calendar, Mail, MessageSquare } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { TasksTab } from '@/components/TasksTab';
import { CalendarTab } from '@/components/CalendarTab';
import { EmailTab } from '@/components/EmailTab';
import { ChatTab } from '@/components/ChatTab';

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'emails', label: 'Emails', icon: Mail },
];

export function ChatPage() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Tabs.List className="flex space-x-1 rounded-xl bg-muted p-1 mb-6">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=active]:text-primary-foreground"
            >
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 bg-primary rounded-lg"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs.Content value="chat" className="focus:outline-none">
              <ChatTab />
            </Tabs.Content>

            <Tabs.Content value="tasks" className="focus:outline-none">
              <TasksTab />
            </Tabs.Content>

            <Tabs.Content value="calendar" className="focus:outline-none">
              <CalendarTab />
            </Tabs.Content>

            <Tabs.Content value="emails" className="focus:outline-none">
              <EmailTab />
            </Tabs.Content>
          </motion.div>
        </AnimatePresence>
      </Tabs.Root>
    </motion.div>
  );
}