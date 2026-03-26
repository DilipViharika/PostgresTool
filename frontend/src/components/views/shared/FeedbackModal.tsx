import React, { useState } from 'react';
import { API_BASE } from '../../../utils/api';

const AUTH_TOKEN_KEY = 'vigil_token';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const submitFeedback = async (feedback: string): Promise<void> => {
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
      const errorData = await response.json().catch(() => ({})) as Record<string, string>;
      const errorMsg = errorData?.error || errorData?.message || `HTTP ${response.status}`;
      throw new Error(`Failed to submit feedback: ${errorMsg}`);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setFeedbackText(e.target.value);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Submit Your Feedback</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Feedback submitted successfully!</div>}
        <form onSubmit={handleFeedbackSubmit}>
          <textarea
            value={feedbackText}
            onChange={handleTextChange}
            aria-label="Feedback text area"
            placeholder="Please enter your feedback..."
            required
            disabled={loading}
            style={styles.textarea}
          />
          <div style={styles.buttonContainer}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} style={styles.cancelButton}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modal: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  } as React.CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e5e7eb',
    marginBottom: '16px',
  } as React.CSSProperties,
  error: {
    color: '#f87171',
    marginBottom: '10px',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'rgba(248, 113, 113, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(248, 113, 113, 0.2)',
  } as React.CSSProperties,
  success: {
    color: '#34d399',
    marginBottom: '10px',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'rgba(52, 211, 153, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(52, 211, 153, 0.2)',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    marginBottom: '16px',
    background: '#0f1117',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: '8px',
    color: '#e5e7eb',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  submitButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(42, 255, 212, 0.1))',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '6px',
    color: '#00d4ff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  cancelButton: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#9ca3af',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
};

export default FeedbackModal;
