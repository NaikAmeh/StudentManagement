// src/components/users/AdminResetPasswordModal.js (New File)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminResetPassword, selectUserLoadingReset, selectUserErrorReset, clearUserSubmitError } from '../../store/slices/userSlice';

// ... (Modal and Form styles) ...

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
};

const secondaryButtonStyle = {
    backgroundColor: '#6c757d', // Gray color for secondary actions
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const dangerButtonStyle = {
    backgroundColor: '#dc3545', // Red color for danger actions
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

function AdminResetPasswordModal({ userId, username, onClose }) { // Pass username for display
    const dispatch = useDispatch();
    const loading = useSelector(selectUserLoadingReset);
    const error = useSelector(selectUserErrorReset);

    useEffect(() => {
        dispatch(clearUserSubmitError()); // Clear any previous reset errors
        return () => dispatch(clearUserSubmitError()); // Cleanup on unmount
    }, [dispatch]);

    const handleConfirmReset = async () => {
        dispatch(clearUserSubmitError());
        dispatch(adminResetPassword({ userId }))
            .unwrap()
            .then(() => {
                alert(`Password for ${username} has been reset. The user will be required to change it upon their next login.`);
                onClose();
            })
            .catch((err) => console.error("Reset password failed:", err));
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, minWidth: '400px'}}>
                <h3>Reset Password for {username || `User ID: ${userId}`}</h3>
                <p>Are you sure you want to reset the password for this user?</p>
                <p>A new temporary password will be generated, and the user will be forced to change it on their next login.</p>

                {error && <p style={{color: 'red'}}>Error: {error?.message || error}</p>}

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button type="button" onClick={onClose} disabled={loading} style={{...secondaryButtonStyle, marginRight: '10px'}}>Cancel</button>
                    <button onClick={handleConfirmReset} disabled={loading} style={dangerButtonStyle}>
                        {loading ? 'Resetting...' : 'Confirm Reset'}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default AdminResetPasswordModal;