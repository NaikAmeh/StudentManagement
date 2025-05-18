// src/components/users/UserEditModal.js (New File)
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUserDetails,
    updateUser,
    selectCurrentUserDetails,
    selectUserLoadingDetails,
    selectUserErrorDetails,
    selectUserLoadingSubmit, // Use this for the update operation
    selectUserErrorSubmit,   // Use this for the update operation
    clearUserDetails,
    clearUserSubmitError
} from '../../store/slices/userSlice';
import { fetchSchools as fetchAllSchools, selectAvailableSchools, selectSchoolLoading as selectAllSchoolsLoading } from '../../store/slices/schoolSlice'; // Fetch ALL schools for assignment

// ... (Modal and Form styles) ...
const schoolListStyle = { maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px', borderRadius:'3px' };

const modalOverlayStyle = {
    position: 'fixed', // Ensures the overlay covers the entire viewport
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    display: 'flex', // Centers the modal content
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensures the overlay is above other elements
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    minWidth: '500px',
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

const errorStyle = {
    color: 'red',
    fontSize: '14px',
};

function UserEditModal({ userId, onClose }) {
    const dispatch = useDispatch();
    const userDetails = useSelector(selectCurrentUserDetails);
    const allSchools = useSelector(selectAvailableSchools); // All system schools
    const loadingDetails = useSelector(selectUserLoadingDetails);
    const loadingUpdate = useSelector(selectUserLoadingSubmit);
    const errorUpdate = useSelector(selectUserErrorSubmit);
    const loadingAllSchools = useSelector(selectAllSchoolsLoading);


    // Form State
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [assignedSchoolIds, setAssignedSchoolIds] = useState([]); // Array of numbers
    const [defaultSchoolId, setDefaultSchoolId] = useState(''); // String for select value

    // Fetch user details and all schools when modal opens or userId changes
    useEffect(() => {
        if (userId) {
            dispatch(clearUserSubmitError()); // Clear any previous update errors
            dispatch(fetchUserDetails(userId));
            if (!allSchools || allSchools.length === 0) { // Fetch all schools if not already loaded
                dispatch(fetchAllSchools());
            }
        }
        return () => dispatch(clearUserDetails()); // Cleanup
        dispatch(clearUserSubmitError());
    }, [userId, dispatch, allSchools]); // Add allSchools to deps to fetch if it was empty

    // Populate form when userDetails are loaded/changed
    useEffect(() => {
        if (userDetails && userDetails.userId === userId) {
            setRole(userDetails.role || 'StandardUser');
            setIsActive(userDetails.isActive ?? true);
            setAssignedSchoolIds(userDetails.assignedSchools?.map(s => s.schoolId) || []);
            setDefaultSchoolId(userDetails.defaultSchoolId?.toString() || '');
        }
    }, [userDetails, userId]);

    const handleSchoolSelectionChange = (schoolId) => {
        const schoolIdNum = parseInt(schoolId, 10);
        setAssignedSchoolIds(prevIds =>
            prevIds.includes(schoolIdNum)
                ? prevIds.filter(id => id !== schoolIdNum) // Unselect
                : [...prevIds, schoolIdNum] // Select
        );
        // If unselecting the current default school, clear defaultSchoolId
        if (defaultSchoolId === schoolId && assignedSchoolIds.includes(schoolIdNum)) {
            setDefaultSchoolId('');
        }
    };

    const handleDefaultSchoolChange = (e) => {
        setDefaultSchoolId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearUserSubmitError());

        // Validation: Default school must be in assigned schools
        if (defaultSchoolId && !assignedSchoolIds.includes(parseInt(defaultSchoolId, 10))) {
            alert("Validation Error: The selected Default School is not in the Assigned Schools list. Please assign it first or clear the default.");
            // Or dispatch an error to Redux:
            // dispatch(updateUserAssignments.rejected({message: "Default school must be assigned."}));
            return;
        }

        const updateDto = {
            role,
            isActive,
            assignedSchoolIds,
            defaultSchoolId: defaultSchoolId ? parseInt(defaultSchoolId, 10) : null,
        };

        dispatch(updateUser({ userId, updateDto }))
            .unwrap()
            .then(() => {
                alert('User updated successfully!');
                onClose(true); // Close and refresh list
            })
            .catch((err) => console.error("Update user failed:", err));
    };

    if (!userDetails && !loadingDetails) return <div style={modalOverlayStyle}><div style={{...modalContentStyle, textAlign:'center', color:'red'}}>User details not found.</div></div>; // Or error message

    return (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, minWidth: '500px'}}>
                <h3>Edit User: {userDetails?.username}</h3>
                <form onSubmit={handleSubmit}>
                    {/* Username (Read-only) */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Username:</label>
                        <input style={inputStyle} type="text" value={userDetails?.username || ''} disabled />
                    </div>
                    {/* Email (Read-only) */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Email:</label>
                        <input style={inputStyle} type="text" value={userDetails?.email || ''} disabled />
                    </div>

                    {/* Role */}
                    <div style={formGroupStyle}>
                        <label htmlFor="roleEdit" style={labelStyle}>Role:</label>
                        <select style={selectStyle} id="roleEdit" value={role} onChange={(e) => setRole(e.target.value)} disabled={loadingUpdate}>
                            <option value="StandardUser">Standard User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {/* Is Active */}
                    <div style={formGroupStyle}>
                        <label htmlFor="isActiveEdit" style={{display:'flex', alignItems:'center'}}>
                            <input type="checkbox" id="isActiveEdit" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={loadingUpdate} style={{marginRight:'5px'}}/>
                            Active
                        </label>
                    </div>

                    {/* Assigned Schools (Multi-select Checkboxes) */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Assigned Schools:</label>
                        {loadingAllSchools && <p>Loading schools...</p>}
                        {!loadingAllSchools && allSchools && allSchools.length > 0 ? (
                            <div style={schoolListStyle}>
                                {allSchools.map(school => (
                                    <div key={school.schoolId}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value={school.schoolId}
                                                checked={assignedSchoolIds.includes(school.schoolId)}
                                                onChange={() => handleSchoolSelectionChange(school.schoolId.toString())} // Pass schoolId as string to match select behavior if needed
                                                disabled={loadingUpdate}
                                            />
                                            {school.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No schools available in the system to assign.</p>
                        )}
                    </div>

                    {/* Default School (Dropdown, filtered by assigned) */}
                    <div style={formGroupStyle}>
                        <label htmlFor="defaultSchoolEdit" style={labelStyle}>Default School:</label>
                        <select
                            style={selectStyle}
                            id="defaultSchoolEdit"
                            value={defaultSchoolId}
                            onChange={handleDefaultSchoolChange}
                            disabled={loadingUpdate || assignedSchoolIds.length === 0}
                        >
                            <option value="">-- None --</option>
                            {/* Only list schools that are currently assigned to the user */}
                            {allSchools?.filter(s => assignedSchoolIds.includes(s.schoolId))
                                      .map(school => (
                                <option key={school.schoolId} value={school.schoolId.toString()}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        {assignedSchoolIds.length === 0 && defaultSchoolId && <p style={errorStyle}>Assign schools before setting a default.</p>}
                    </div>


                    {errorUpdate && <p style={errorStyle}>Error: {errorUpdate?.message || errorUpdate}</p>}

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="button" onClick={() => onClose(false)} disabled={loadingUpdate} style={{...secondaryButtonStyle, marginRight: '10px'}}>Cancel</button>
                        <button type="submit" disabled={loadingUpdate || loadingDetails} style={primaryButtonStyle}>
                            {loadingUpdate ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UserEditModal;