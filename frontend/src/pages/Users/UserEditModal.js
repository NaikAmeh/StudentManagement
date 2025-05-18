// src/components/users/UserEditModal.js (New File)
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUserDetails,
    updateUserWithAssignments,
    selectCurrentUserDetails,
    selectUserLoadingDetails,
    selectUserErrorDetails,
    selectUserLoadingSubmit, // Use this for the update operation
    selectUserErrorSubmit,   // Use this for the update operation
    clearUserDetails,
    clearUserUpdateError 
} from '../../store/slices/userSlice';
import { fetchSchools as fetchAllSystemSchools, selectAvailableSchools as selectAllSystemSchools, selectSchoolLoading as selectAllSchoolsLoading } from '../../store/slices/schoolSlice'; // Fetch ALL schools for assignment

// ... (Modal and Form styles) ...
const schoolListStyle = { maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px', borderRadius:'3px' };

const schoolListItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 10px',
    borderBottom: '1px solid #ddd',
    marginBottom: '5px',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
};

const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
};

const radioInputStyle = {
    marginRight: '5px',
    cursor: 'pointer',
};

const dangerButtonStyle = {
    backgroundColor: '#dc3545', // Red color for danger
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const schoolInfoStyle = {
    flex: 1,
    fontSize: '14px',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

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
    //const allSchools = useSelector(selectAvailableSchools); // All system schools
    const loadingDetails = useSelector(selectUserLoadingDetails);
    const loadingUpdate = useSelector(selectUserLoadingSubmit);
    const errorUpdate = useSelector(selectUserErrorSubmit);
    
    const allSystemSchools = useSelector(selectAllSystemSchools); // For linking new schools
    const loadingAllSchools = useSelector(selectAllSchoolsLoading);


    // Form State
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [currentFormAssignedSchools, setCurrentFormAssignedSchools] = useState([]); // Array of SchoolDto
    const [currentFormDefaultSchoolId, setCurrentFormDefaultSchoolId] = useState(''); // String for radio/select

    // --- State for "Link New School" UI ---
    const [showLinkSchoolDropdown, setShowLinkSchoolDropdown] = useState(false);
    const [schoolToLink, setSchoolToLink] = useState(''); // ID of school to link

    // Fetch user details and all schools when modal opens or userId changes
    useEffect(() => {
        if (userId) {
            //dispatch(clearUserSubmitError()); // Clear any previous update errors
            dispatch(fetchUserDetails(userId));
            // if (!allSchools || allSchools.length === 0) { // Fetch all schools if not already loaded
            //     dispatch(fetchAllSchools());
            // }
        }
        dispatch(fetchAllSystemSchools()); // Fetch all schools for the "Link New" dropdown
        return () => dispatch(clearUserDetails()); // Cleanup
        dispatch(clearUserUpdateError());
    }, [userId, dispatch]); // Add allSchools to deps to fetch if it was empty

     // Populate form when userDetails load
     useEffect(() => {
        if (userDetails && userDetails.userId === userId) {
            setRole(userDetails.role || '');
            setIsActive(userDetails.isActive ?? true);
            setCurrentFormDefaultSchoolId(userDetails.defaultSchoolId?.toString() || '');
            setCurrentFormAssignedSchools(userDetails.assignedSchools || []);
        } else {
            setCurrentFormAssignedSchools([]);
            setCurrentFormDefaultSchoolId('');
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

    // const handleDefaultSchoolChange = (e) => {
    //     setDefaultSchoolId(e.target.value);
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     dispatch(clearUserSubmitError());

    //     // Validation: Default school must be in assigned schools
    //     if (defaultSchoolId && !assignedSchoolIds.includes(parseInt(defaultSchoolId, 10))) {
    //         alert("Validation Error: The selected Default School is not in the Assigned Schools list. Please assign it first or clear the default.");
    //         // Or dispatch an error to Redux:
    //         // dispatch(updateUserAssignments.rejected({message: "Default school must be assigned."}));
    //         return;
    //     }

        
    //     const updateDto = {
    //         role,
    //         isActive,
    //         assignedSchoolIds,
    //         defaultSchoolId: defaultSchoolId ? parseInt(defaultSchoolId, 10) : null,
    //     };

    //     dispatch(updateUser({ userId, updateDto }))
    //         .unwrap()
    //         .then(() => {
    //             alert('User updated successfully!');
    //             onClose(true); // Close and refresh list
    //         })
    //         .catch((err) => console.error("Update user failed:", err));
    // };

    // Main Save Handler
    const handleSaveChanges = useCallback(async (e) => {
        e.preventDefault();
        dispatch(clearUserUpdateError());
        const newDefaultSchoolIdAsInt = currentFormDefaultSchoolId ? parseInt(currentFormDefaultSchoolId, 10) : null;

        if (newDefaultSchoolIdAsInt && !currentFormAssignedSchools.some(s => s.schoolId === newDefaultSchoolIdAsInt)) {
            alert("Default school must be among the assigned schools.");
            return;
        }

        const updateDto = {
            role,
            isActive,
            defaultSchoolId: newDefaultSchoolIdAsInt,
            assignedSchoolIds: currentFormAssignedSchools.map(s => s.schoolId),
        };

        dispatch(updateUserWithAssignments({ userId, updateDto }))
            .unwrap()
            .then(() => {
                alert("User updated successfully!");
                onClose();
            })
            .catch((err) => console.error("User update failed:", err));
    }, [dispatch, userId, role, isActive, currentFormDefaultSchoolId, currentFormAssignedSchools, onClose]);

    // Handler to remove a school from the *local form's list*
    const handleRemoveSchoolFromForm = useCallback((schoolIdToRemove) => {
        setCurrentFormAssignedSchools(prev => prev.filter(s => s.schoolId !== schoolIdToRemove));
        // If removed school was the default, clear default
        if (currentFormDefaultSchoolId === schoolIdToRemove.toString()) {
            setCurrentFormDefaultSchoolId('');
        }
    }, [currentFormDefaultSchoolId]);

    // Handler to add a school to the *local form's list*
    const handleAddSchoolToForm = useCallback(() => {
        if (!schoolToLink) {
            alert("Please select a school to link.");
            return;
        }
        const schoolIdToAdd = parseInt(schoolToLink, 10);
        if (currentFormAssignedSchools.some(s => s.schoolId === schoolIdToAdd)) {
            alert("School already assigned.");
            return;
        }
        const schoolObject = allSystemSchools.find(s => s.schoolId === schoolIdToAdd);
        if (schoolObject) {
            setCurrentFormAssignedSchools(prev => [...prev, schoolObject]);
            setSchoolToLink(''); // Reset dropdown
            setShowLinkSchoolDropdown(false); // Hide dropdown
        } else {
            alert("Selected school not found in system list.");
        }
    }, [schoolToLink, currentFormAssignedSchools, allSystemSchools]);

    // Handler for default school radio button change
    const handleDefaultSchoolChange = useCallback((schoolIdString) => {
        setCurrentFormDefaultSchoolId(schoolIdString);
    }, []);


    if (loadingDetails && !userDetails) return <div style={modalOverlayStyle}><div style={modalContentStyle}><p>Loading details...</p></div></div>;
    if (!userDetails && !loadingDetails) return <div style={modalOverlayStyle}><div style={modalContentStyle}><p>User not found.</p><button onClick={onClose}>Close</button></div></div>;

    const availableSchoolsToLink = allSystemSchools.filter(
        sysSchool => !currentFormAssignedSchools.some(assignedSchool => assignedSchool.schoolId === sysSchool.schoolId)
    );

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                {/* ... Modal Header with username/email and close button ... */}
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom:'10px', marginBottom: '15px'}}>
                    <h3>Edit User: {userDetails?.username}</h3>
                    <button onClick={onClose} style={{...secondaryButtonStyle, padding: '5px 10px', background: 'transparent', border: 'none', fontSize:'1.2em'}}>×</button>
                </div>


                <form onSubmit={handleSaveChanges}>
                    {/* Role, IsActive inputs (as before) */}
                    <div style={formGroupStyle}><label style={labelStyle}>Role:</label><select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} disabled={loadingUpdate}><option value="StandardUser">Standard User</option><option value="Admin">Admin</option></select></div>
                    <div style={formGroupStyle}><label style={labelStyle}><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={loadingUpdate} style={{ marginRight: '5px' }} />Active</label></div>


                    {/* Assigned Schools List with Radio for Default & Remove */}
                    <div style={schoolListStyle}>
                        <h4>Assigned Schools & Default Setting</h4>
                        {currentFormAssignedSchools.length > 0 ? (
                            <div style={schoolListStyle}>
                                {currentFormAssignedSchools.map(school => (
                                    <div key={school.schoolId} style={schoolListItemStyle}>
                                        <label style={radioLabelStyle} htmlFor={`default-school-${school.schoolId}`}>
                                            <input
                                                style={radioInputStyle}
                                                type="radio"
                                                id={`default-school-${school.schoolId}`}
                                                name="defaultSchoolRadio"
                                                value={school.schoolId.toString()}
                                                checked={currentFormDefaultSchoolId === school.schoolId.toString()}
                                                onChange={() => handleDefaultSchoolChange(school.schoolId.toString())}
                                                disabled={loadingUpdate}
                                            />
                                            <span style={schoolInfoStyle}>{school.name}</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSchoolFromForm(school.schoolId)}
                                            disabled={loadingUpdate || currentFormDefaultSchoolId === school.schoolId.toString()}
                                            style={dangerButtonStyle}
                                            title={currentFormDefaultSchoolId === school.schoolId.toString() ? "Cannot remove default" : "Remove"}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No schools currently assigned in this edit session.</p>
                        )}
                        {currentFormDefaultSchoolId && currentFormAssignedSchools.length > 0 && (
                             <button type="button" onClick={() => handleDefaultSchoolChange('')} style={{...secondaryButtonStyle, marginTop: '10px'}} disabled={loadingUpdate}>
                                 Clear Default School
                             </button>
                         )}
                    </div>

                    {/* Link New School Section */}
                    <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        {!showLinkSchoolDropdown && (
                            <button type="button" onClick={() => setShowLinkSchoolDropdown(true)} style={secondaryButtonStyle} disabled={loadingUpdate || loadingAllSchools}>
                                Link to New School...
                            </button>
                        )}
                        {showLinkSchoolDropdown && (
                            <div>
                                <label style={labelStyle}>Select School to Link:</label>
                                <select style={inputStyle} value={schoolToLink} onChange={(e) => setSchoolToLink(e.target.value)} disabled={loadingUpdate || loadingAllSchools}>
                                    <option value="">-- Choose a school --</option>
                                    {loadingAllSchools && <option disabled>Loading schools...</option>}
                                    {availableSchoolsToLink.map(s => (
                                        <option key={s.schoolId} value={s.schoolId.toString()}>{s.name}</option>
                                    ))}
                                </select>
                                {availableSchoolsToLink.length === 0 && !loadingAllSchools && <small>All available schools already assigned or no other schools exist.</small>}
                                <div style={{marginTop: '10px'}}>
                                    <button type="button" onClick={handleAddSchoolToForm} style={primaryButtonStyle} disabled={loadingUpdate || !schoolToLink}>Add to List</button>
                                    <button type="button" onClick={() => { setShowLinkSchoolDropdown(false); setSchoolToLink('');}} style={secondaryButtonStyle}>Cancel Link</button>
                                </div>
                            </div>
                        )}
                    </div>


                    {errorUpdate && <p style={errorTextStyle}>Save Error: {errorUpdate?.message || errorUpdate}</p>}

                    <div style={{ marginTop: '25px', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <button type="button" onClick={onClose} disabled={loadingUpdate} style={{...secondaryButtonStyle, marginRight: '10px'}}>Close</button>
                        <button type="submit" disabled={loadingUpdate} style={primaryButtonStyle}>
                            {loadingUpdate ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserEditModal;