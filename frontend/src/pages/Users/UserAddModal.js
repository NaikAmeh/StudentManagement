import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, selectUserLoadingSubmit, selectUserErrorSubmit, clearUserSubmitError } from '../../store/slices/userSlice';

// Basic Modal Styles
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
    minWidth: '450px',
};

const formGroupStyle = {
    marginBottom: '15px',
};

const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

const selectStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

const primaryButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const secondaryButtonStyle = {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

function UserAddModal({ onClose }) {
    const dispatch = useDispatch();
    const loading = useSelector(selectUserLoadingSubmit); // Correct selector
    const error = useSelector(selectUserErrorSubmit);     // Correct selector

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('StandardUser'); // Default role

    useEffect(() => {
        // Clear previous errors when modal opens
        dispatch(clearUserSubmitError()); // Correct action
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearUserSubmitError()); // Correct action
        const createUserDto = { username, email, roleId: role }; // Pass roleId instead of role name
        dispatch(addUser(createUserDto))
            .unwrap()
            .then(() => {
                alert('User added successfully!');
                onClose(true);
            })
            .catch((err) => {
                console.error('Error adding user:', err);
            });
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3>Add New User</h3>
                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label htmlFor="username" style={labelStyle}>Username:</label>
                        <input
                            style={inputStyle}
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="email" style={labelStyle}>Email:</label>
                        <input
                            style={inputStyle}
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label htmlFor="role" style={labelStyle}>Role:</label>
                        <select
                            style={selectStyle}
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                        >
                            <option value="StandardUser">Standard User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {error && <p style={{ color: 'red' }}>Error: {error?.message || error}</p>}

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            disabled={loading}
                            style={{ ...secondaryButtonStyle, marginRight: '10px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={primaryButtonStyle}
                        >
                            {loading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserAddModal;