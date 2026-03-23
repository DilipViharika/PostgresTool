// FeedbackModal.jsx
import React, { useState } from 'react';
import { API_BASE } from '../../utils/api';

// Token key must match what AuthContext uses (STORAGE_KEYS.TOKEN = 'vigil_token')
const AUTH_TOKEN_KEY = 'vigil_token';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Function to submit feedback via POST request
  const submitFeedback = async (feedback) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      throw new Error('Not authenticated — please refresh and log in again.');
    }

    const response = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ feedback }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error || errorData?.message || `HTTP ${response.status}`;
      throw new Error(`Failed to submit feedback: ${errorMsg}`);
    }

    return response.json();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);

      if (!feedbackText || feedbackText.trim() === '') {
        throw new Error('Feedback cannot be empty!');
      }

      await submitFeedback(feedbackText.trim());

      setSuccess(true);
      setFeedbackText('');

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setFeedbackText(e.target.value);
  };

  return (
    <div>
      {isOpen && (
        <div>
          <h2>Submit Your Feedback</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '10px' }}>Feedback submitted successfully!</div>}
          <form onSubmit={handleFeedbackSubmit}>
            <textarea
              value={feedbackText}
              onChange={handleTextChange}
              aria-label="Feedback text area"
              placeholder="Please enter your feedback..."
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Close
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackModal;