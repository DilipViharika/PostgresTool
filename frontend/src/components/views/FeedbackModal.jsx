// FeedbackModal.jsx
import React, { useEffect } from 'react';
// Custom hooks for handling dropdown listeners
import useDropdownListener from '../hooks/useDropdownListener';

const FeedbackModal = ({ isOpen, onClose, apiUrl }) => {
  const { handleDropdownChange } = useDropdownListener();

  // Effect to handle API URL configuration based on the environment
  useEffect(() => {
    const url = process.env.NODE_ENV === 'production' ? apiUrl : 'http://localhost:5000';
    console.log(`API URL set to: ${url}`);

    return () => {
      console.log('Cleaning up FeedbackModal.');
    };
  }, [apiUrl]);

  const handleFeedbackSubmit = async (feedback) => {
    try {
      // Input validation logic for the feedback
      if (!feedback || feedback.trim() === '') {
        throw new Error('Feedback cannot be empty!');
      }
      // Debounce submission logic here
      await submitFeedback(feedback);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div>
      {isOpen && (
        <div>
          <h2>Submit Your Feedback</h2>
          <form onSubmit={handleFeedbackSubmit}>
            <textarea
              onChange={handleDropdownChange}
              aria-label="Feedback text area"
              required
            />
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Close</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackModal;