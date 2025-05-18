// src/pages/HomePage.js
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';

function HomePage() {
  const user = useSelector(selectCurrentUser);

  return (
    <div>
      <h2>Home / Dashboard</h2>
      <p>Welcome to the Student ID Management System{user ? `, ${user.username}`: ''}!</p>
      <p>Select a school from the header to manage students.</p>
      {/* Add dashboard widgets or summaries here later */}
      
    </div>
  );
}

export default HomePage;