import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Star, StarOff, Trash2, Plus } from 'lucide-react';
import { emailApi, EmailMessage, EmailMessageCreate } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export function EmailTab() {
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState<EmailMessageCreate>({
    subject: '',
    sender: '',
    recipient: '',
    body: '',
    received_at: new Date().toISOString(),
  });
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading, error } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const response = await emailApi.getEmails();
      return response.data;
    },
  });

  const createEmailMutation = useMutation({
    mutationFn: emailApi.createEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setNewEmail({
        subject: '',
        sender: '',
        recipient: '',
        body: '',
        received_at: new Date().toISOString(),
      });
      setShowAddForm(false);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: emailApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const toggleImportantMutation = useMutation({
    mutationFn: emailApi.toggleImportant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: emailApi.deleteEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setSelectedEmail(null);
    },
  });

  const handleEmailClick = (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markAsReadMutation.mutate(email.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.subject.trim() && newEmail.sender.trim() && newEmail.body.trim()) {
      createEmailMutation.mutate(newEmail);
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
        <p className="text-destructive">Error loading emails. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Emails</h2>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Email</span>
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
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="From..."
                value={newEmail.sender}
                onChange={(e) => setNewEmail({ ...newEmail, sender: e.target.value })}
                className="px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="To..."
                value={newEmail.recipient}
                onChange={(e) => setNewEmail({ ...newEmail, recipient: e.target.value })}
                className="px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="text"
              placeholder="Subject..."
              value={newEmail.subject}
              onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Email body..."
              value={newEmail.body}
              onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createEmailMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {createEmailMutation.isPending ? 'Adding...' : 'Add Email'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-4">Inbox ({emails.length})</h3>
          <AnimatePresence>
            {emails.map((email, index) => (
              <motion.div
                key={email.id}
                className={`bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedEmail?.id === email.id ? 'ring-2 ring-primary' : ''
                } ${!email.is_read ? 'bg-accent/20' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleEmailClick(email)}
                layout
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    {email.is_read ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm ${!email.is_read ? 'font-semibold' : 'font-medium'}`}>
                        {email.sender}
                      </p>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImportantMutation.mutate(email.id);
                          }}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {email.is_important ? (
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </motion.button>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(email.received_at), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <h4 className={`text-sm mb-1 ${!email.is_read ? 'font-semibold' : ''}`}>
                      {email.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {email.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {emails.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No emails yet. Add your first email!</p>
            </motion.div>
          )}
        </div>

        {/* Email Detail */}
        <div>
          {selectedEmail ? (
            <motion.div
              className="bg-card border border-border rounded-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>From: {selectedEmail.sender}</span>
                    <span>To: {selectedEmail.recipient}</span>
                    <span>{format(parseISO(selectedEmail.received_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => deleteEmailMutation.mutate(selectedEmail.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an email to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}