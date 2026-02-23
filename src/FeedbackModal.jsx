import React from 'react';
import { AUTH_TOKEN_KEY } from './App'; // Import the AUTH_TOKEN_KEY from App.jsx

const FeedbackModal = () => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY); // Retrieve the token from localStorage

  const handleSubmit = () => {
    // Assuming you have a method to handle form submission
    // Include the token in your request headers
    fetch('your-api-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // Include the Bearer token
      },
      body: JSON.stringify({ /* your request body */ })
    })
    .then(response => response.json())
    .then(data => { /* handle success */ })
    .catch(error => { /* handle error */ });
  };

  return (
    <div>
      {/* Your modal JSX here */}
      <button onClick={handleSubmit}>Submit Feedback</button>
    </div>
  );
};

export default FeedbackModal;