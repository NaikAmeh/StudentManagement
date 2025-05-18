// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, selectAuthLoading, selectAuthError, clearAuthError, selectIsAuthenticated } from '../store/slices/authSlice';
import '../styles/LoginPage.css'; // Import CSS styles (if any)

// Basic styles (replace later)
// const loginContainerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' };
// const formGroupStyle = { marginBottom: '15px' };
// const labelStyle = { display: 'block', marginBottom: '5px' };
// const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
// const errorStyle = { color: 'red', marginTop: '10px' };
// const buttonStyle = { padding: '10px 15px', cursor: 'pointer' };

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch(); 
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Redirect if already logged in
  useEffect(() => {
      if (isAuthenticated) {
          navigate('/', { replace: true });
      }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts or credentials change
  useEffect(() => {
      dispatch(clearAuthError());
  }, [dispatch, usernameOrEmail, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ usernameOrEmail, password }))
        .unwrap()
        .then(() => {
             const from = location.state?.from?.pathname || '/';
             navigate(from, { replace: true });
        })
        .catch((rejectedValue) => {
             console.log("Login promise rejected in component:", rejectedValue);
             // Error state is already set by the slice reducer
        });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usernameOrEmail">Username or Email:</label>
          <input
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {/* Display error from Redux state */}
        {error && <p className="error-message">{typeof error === 'string' ? error : 'Login Failed'}</p>}
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;