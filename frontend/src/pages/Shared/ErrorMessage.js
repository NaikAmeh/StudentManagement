// src/components/common/ErrorMessage.js
import React from 'react';

const errorStyle = {
  padding: '15px',
  margin: '10px 0',
  border: '1px solid #dc3545',
  borderRadius: '4px',
  color: '#dc3545',
  backgroundColor: '#f8d7da',
  textAlign: 'center',
};

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div style={errorStyle}>{message}</div>;
};

export default ErrorMessage;