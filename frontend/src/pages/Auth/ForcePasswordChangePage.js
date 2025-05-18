// src/pages/auth/ForcePasswordChangePage.js (New File)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { forcePasswordChange, selectAuthLoading, selectAuthError, clearAuthError } from '../../store/slices/authSlice'; // Assume thunk & selectors in authSlice

// ... (Form Styles) ...
const pageContainerStyle = { maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };

function ForcePasswordChangePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading); // Use general auth loading/error or create specific ones
    const error = useSelector(selectAuthError);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState(''); // Local form validation error

    useEffect(() => {
        dispatch(clearAuthError()); // Clear previous auth errors on mount
        return () => dispatch(clearAuthError()); // And on unmount
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        dispatch(clearAuthError());

        if (newPassword.length < 8) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        // Backend will have user ID from JWT claims
        dispatch(forcePasswordChange({ NewPassword: newPassword, ConfirmNewPassword: confirmPassword })) // Match DTO
            .unwrap()
            .then(() => {
                alert("Password changed successfully! Please log in again with your new password.");
                 // We dispatch logout to clear old token and force re-login
                 // dispatch(logout()); // Assuming logout action exists in authSlice
                navigate('/login'); // Or backend can invalidate token forcing relogin
            })
            .catch((err) => {
                // Error is already set in Redux state (selectAuthError)
                console.error("Force password change failed:", err);
            });
    };

    return (
        <div style={pageContainerStyle}>
            <h2>Change Your Password</h2>
            <p>Your password has been reset by an administrator. Please set a new password to continue.</p>
            <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                    <label htmlFor="newPassword" style={labelStyle}>New Password:</label>
                    <input style={inputStyle} type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="confirmPassword" style={labelStyle}>Confirm New Password:</label>
                    <input style={inputStyle} type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                </div>

                {formError && <p style={{ color: 'red' }}>{formError}</p>}
                {error && <p style={{ color: 'red' }}>Error: {error?.message || error}</p>}

                <div style={{ marginTop: '20px' }}>
                    <button type="submit" disabled={loading} style={primaryButtonStyle}>
                        {loading ? 'Setting Password...' : 'Set New Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
export default ForcePasswordChangePage;