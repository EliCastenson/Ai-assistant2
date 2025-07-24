import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../utils/api';

const GoogleCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(error === 'access_denied' ? 'Access was denied' : 'Authentication failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        setMessage('Exchanging authorization code...');
        
        // Exchange the code for tokens
        const response = await authApi.googleCallback(code, state || undefined);
        
        if (response.data.access_token) {
          // Store tokens in localStorage
          localStorage.setItem('authToken', response.data.access_token);
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          setStatus('success');
          setMessage('Authentication successful! You can close this window.');

          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              token: response.data.access_token,
              user: response.data.user
            }, window.location.origin);
          }

          // Close the popup after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: error instanceof Error ? error.message : 'Authentication failed'
          }, window.location.origin);
        }

        // Close the popup after a delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 mx-auto text-primary-500" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
            </motion.div>
          )}
        </div>

        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {status === 'error' && (
          <motion.button
            onClick={() => window.close()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Close Window
          </motion.button>
        )}

        {status === 'loading' && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we complete the authentication process...
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-green-600 dark:text-green-400">
            This window will close automatically.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleCallbackPage;