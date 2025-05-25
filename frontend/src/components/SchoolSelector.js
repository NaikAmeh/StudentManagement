import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchSchools,
    setSelectedSchool,
    selectAvailableSchools,
    selectSelectedSchoolId,
    selectSchoolLoading,
    selectSchoolError
} from '../store/slices/schoolSlice'; // Import school actions/selectors
import { selectIsAuthenticated } from '../store/slices/authSlice'; // Import auth selector

function SchoolSelector({ resetOnPopupOpen, onSchoolSelect }) {
    const dispatch = useDispatch();
    const availableSchools = useSelector(selectAvailableSchools);
    const selectedSchoolId = useSelector(selectSelectedSchoolId);
    const loadingSchools = useSelector(selectSchoolLoading);
    const error = useSelector(selectSchoolError);
    const isAuthenticated = useSelector(selectIsAuthenticated); // Get auth state

    const [dropdownValue, setDropdownValue] = useState(""); // Local state for dropdown value

    // Fetch schools when component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchSchools()); // Fetch schools if authenticated
        }
    }, [dispatch, isAuthenticated]);

    // Reset dropdown value to default ("-- Select --") when the popup is shown
    useEffect(() => {
        if (resetOnPopupOpen) {
            setDropdownValue(""); // Reset to default value when popup opens
        } else if (selectedSchoolId) {
            setDropdownValue(selectedSchoolId); // Set to the selected school ID
        }
    }, [resetOnPopupOpen, selectedSchoolId]);

    const handleChange = (event) => {
        const schoolId = parseInt(event.target.value, 10);
        if (!isNaN(schoolId)) {
            setDropdownValue(schoolId); // Update local state
            //dispatch(setSelectedSchool(schoolId)); // Dispatch action
            if (onSchoolSelect) {
                onSchoolSelect(schoolId); // Notify parent about the selected school
            }
        }
    };

    // Conditional rendering based on state
    if (!isAuthenticated) return null; // Don't show if not logged in
    if (loadingSchools) return <span style={{ marginLeft: '20px' }}>Loading schools...</span>;
    if (error) return <span style={{ marginLeft: '20px', color: 'orange' }}>Error loading schools!</span>;
    if (!availableSchools || availableSchools.length === 0) return <span style={{ marginLeft: '20px' }}>No schools assigned.</span>;

    return (
        <div style={{ display: 'inline-block', marginLeft: '20px' }}>
            <h3>Select a School</h3>
            <select
                id="schoolSelect"
                value={dropdownValue}
                onChange={handleChange}
                disabled={loadingSchools || availableSchools.length === 0}
                className="school-dropdown"
            >
                <option value="">-- Select --</option>
                {availableSchools.map((school) => (
                    <option key={school.schoolId} value={school.schoolId}>
                        {school.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SchoolSelector;