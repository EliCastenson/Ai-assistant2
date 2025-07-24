import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  RefreshCw, 
  Search, 
  Star, 
  Archive, 
  Reply, 
  Forward, 
  Trash2,
  ExternalLink,
  Clock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';
import { useEmails, useEmailSummary } from '../hooks/useApi';

interface EmailReply {
  subject: string;
  content: string;
}

const EmailPage: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const { 
    data: emails, 
    loading: emailsLoading, 
    error: emailsError, 
    refetch: refetchEmails 
  } = useEmails();

  const { 
    data: emailSummary, 
    loading: summaryLoading, 
    error: summaryError 
  } = useEmailSummary();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await refetchEmails();
      // Add a small delay for better UX
      setTimeout(() => setSyncing(false), 1000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncing(false);
    }
  };

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
  };

  const handleReply = (email: any) => {
    setSelectedEmail(email);
    setReplyContent('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;
    
    setSendingReply(true);
    try {
      // TODO: Implement actual email sending
      console.log('Sending reply:', { email: selectedEmail, content: replyContent });
      setShowReplyModal(false);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-gray-50 dark:bg-gray-900 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your emails with AI assistance
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </motion.button>
            <motion.button
              onClick={handleSync}
              disabled={syncing}
              whileHover={{ scale: syncing ? 1 : 1.05 }}
              whileTap={{ scale: syncing ? 1 : 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{syncing ? 'Syncing...' : 'Sync Gmail'}</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Email Summary
              </h2>
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : summaryError ? (
                <div className="flex items-center space-x-2 text-red-500 py-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to load summary</span>
                </div>
              ) : emailSummary ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Unread</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {emailSummary.unread_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Important</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {emailSummary.important_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Today</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {emailSummary.today_count}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No summary available
                </p>
              )}
            </div>
          </div>

          {/* Email List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Emails
                </h2>
              </div>
              
              {emailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : emailsError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Failed to load emails
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Please connect your Gmail account or try syncing again.
                    </p>
                    <motion.button
                      onClick={handleSync}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                      Retry
                    </motion.button>
                  </div>
                </div>
              ) : emails && emails.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {emails.map((email: any, index: number) => (
                    <motion.div
                      key={email.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleEmailClick(email)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {email.sender || 'Unknown Sender'}
                            </span>
                            {email.is_important && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {!email.is_read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {email.subject || 'No Subject'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {truncateText(email.snippet || 'No preview available', 120)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(email.date || new Date().toISOString())}</span>
                            </div>
                            {email.attachments && email.attachments.length > 0 && (
                              <span>📎 {email.attachments.length}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReply(email);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                          >
                            <Reply className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors duration-200"
                          >
                            <Archive className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Mail className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No emails found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connect your Gmail account to see your emails here.
                    </p>
                    <motion.button
                      onClick={handleSync}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                      Connect Gmail
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {showReplyModal && selectedEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowReplyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Reply to: {selectedEmail.subject}
                    </h2>
                    <button
                      onClick={() => setShowReplyModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    To: {selectedEmail.sender}
                  </p>
                </div>
                
                <div className="p-6">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>AI suggestions available</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        onClick={() => setShowReplyModal(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim() || sendingReply}
                        whileHover={{ scale: sendingReply ? 1 : 1.05 }}
                        whileTap={{ scale: sendingReply ? 1 : 0.95 }}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {sendingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EmailPage;