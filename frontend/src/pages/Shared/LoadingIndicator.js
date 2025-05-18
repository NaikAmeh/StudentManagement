// src/components/common/LoadingIndicator.js
import React from 'react';

const loadingStyle = {
  padding: '20px',
  textAlign: 'center',
  fontSize: '1.1em',
  color: '#6c757d',
};

const LoadingIndicator = ({ message = "Loading..." }) => {
  return <div style={loadingStyle}>{message}</div>;
};

export default LoadingIndicator;