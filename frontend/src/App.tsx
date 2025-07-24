import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { ChatPage } from '@/pages/ChatPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Header with theme toggle */}
        <motion.header 
          className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              AI Assistant
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;