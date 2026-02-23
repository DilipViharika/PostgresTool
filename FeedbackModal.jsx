// FeedbackModal.jsx
import React, { useEffect, useState } from 'react';
// Custom hooks for handling dropdown listeners
import useDropdownListener from '../hooks/useDropdownListener';

const FeedbackModal = ({ isOpen, onClose, apiUrl }) => {
  const { handleDropdownChange } = useDropdownListener();
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Effect to handle API URL configuration based on the environment
  useEffect(() => {
    const url = process.env.NODE_ENV === 'production' ? apiUrl : 'http://localhost:5000';
    console.log(`API URL set to: ${url}`);

    return () => {
      console.log('Cleaning up FeedbackModal.');
    };
  }, [apiUrl]);

  // Function to submit feedback via POST request
  const submitFeedback = async (feedback) => {
    const url = process.env.NODE_ENV === 'production' ? apiUrl : 'http://localhost:5000';
    
    try {
      const response = await fetch(`${url}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(`Error submitting feedback: ${err.message}`);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    try {
      setLoading(true);
      
      // Input validation logic for the feedback
      if (!feedbackText || feedbackText.trim() === '') {
        throw new Error('Feedback cannot be empty!');
      }
      
      // Submit feedback
      await submitFeedback(feedbackText);
      
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
    handleDropdownChange(e);
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