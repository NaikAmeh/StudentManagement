// // src/components/SchoolSelector.js
// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//     fetchSchools,
//     setSelectedSchool,
//     selectAvailableSchools,
//     selectSelectedSchoolId,
//     selectSchoolLoading,
//     selectSchoolError,
//     selectIsAuthenticated // Import auth selector
// } from '../store/slices/schoolSlice'; // Import school actions/selectors
// import { selectIsAuthenticated as selectAuthIsAuthenticated } from '../store/slices/authSlice'; // Import auth selector specifically

// function SchoolSelector() {
//     const dispatch = useDispatch();
//     const availableSchools = useSelector(selectAvailableSchools);
//     const selectedSchoolId = useSelector(selectSelectedSchoolId);
//     const loadingSchools = useSelector(selectSchoolLoading);
//     const error = useSelector(selectSchoolError); // Get error state
//     const isAuthenticated = useSelector(selectAuthIsAuthenticated); // Get auth state

//     // Fetch schools when component mounts and user is authenticated
//     useEffect(() => {
//         if (isAuthenticated) {
//             dispatch(fetchSchools());
//         }
//         // We could also reset state if isAuthenticated becomes false
//         // but the slice logic might handle that based on token absence already
//     }, [dispatch, isAuthenticated]);

//     const handleChange = (event) => {
//         const schoolId = parseInt(event.target.value, 10);
//         if (!isNaN(schoolId)) {
//             dispatch(setSelectedSchool(schoolId)); // Dispatch action to update selected school
//         }
//     };

//     // Decide what to render based on state
//     if (!isAuthenticated) {
//         return null; // Don't show selector if not logged in
//     }
//     if (loadingSchools) {
//         return <span style={{ marginLeft: '20px' }}>Loading schools...</span>;
//     }
//      if (error) {
//         return <span style={{ marginLeft: '20px', color: 'orange' }}>Error loading schools!</span>;
//      }
//     if (!availableSchools || availableSchools.length === 0) {
//         return <span style={{ marginLeft: '20px' }}>No schools assigned.</span>;
//     }

//     return (
//         <div style={{ display: 'inline-block', marginLeft: '20px' }}>
//             <label htmlFor="schoolSelect" style={{ marginRight: '5px' }}>School:</label>
//             <select
//                 id="schoolSelect"
//                 value={selectedSchoolId || ''} // Use selectedSchoolId from state
//                 onChange={handleChange}
//                 disabled={loadingSchools || availableSchools.length === 0}
//             >
//                  {!selectedSchoolId && <option value="" disabled>Select...</option>}
//                 {availableSchools.map(school => (
//                     <option key={school.schoolId} value={school.schoolId}>
//                         {school.name}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// }

// export default SchoolSelector;

// src/components/SchoolSelector.js
import React, { useEffect } from 'react';
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

function SchoolSelector() {
    const dispatch = useDispatch();
    const availableSchools = useSelector(selectAvailableSchools);
    const selectedSchoolId = useSelector(selectSelectedSchoolId);
    const loadingSchools = useSelector(selectSchoolLoading);
    const error = useSelector(selectSchoolError);
    const isAuthenticated = useSelector(selectIsAuthenticated); // Get auth state

    // Fetch schools when component mounts and user is authenticated
    useEffect(() => {
        // Only fetch if authenticated and schools haven't been loaded/attempted
        // You might want more sophisticated logic to avoid re-fetching if already loaded
        if (isAuthenticated) {
            // Check if availableSchools is empty maybe? or rely on loading state
            //dispatch(fetchSchools());
        }
    }, [dispatch, isAuthenticated]);

    const handleChange = (event) => {
        const schoolId = parseInt(event.target.value, 10);
        if (!isNaN(schoolId)) {
            dispatch(setSelectedSchool(schoolId)); // Dispatch action
        }
    };

    // Conditional rendering based on state
    if (!isAuthenticated) return null; // Don't show if not logged in
    if (loadingSchools) return <span style={{ marginLeft: '20px' }}>Loading schools...</span>;
    if (error) return <span style={{ marginLeft: '20px', color: 'orange' }}>Error loading schools!</span>;
    if (!availableSchools || availableSchools.length === 0) return <span style={{ marginLeft: '20px' }}>No schools assigned.</span>;

    return (
        <div style={{ display: 'inline-block', marginLeft: '20px' }}>
            <label htmlFor="schoolSelect" style={{ marginRight: '5px' }}>School:</label>
            <select
                id="schoolSelect"
                value={selectedSchoolId || ''}
                onChange={handleChange}
                disabled={loadingSchools || availableSchools.length === 0}
            >
                 {!selectedSchoolId && <option value="" disabled>Select...</option>}
                {availableSchools.map(school => (
                    <option key={school.schoolId} value={school.schoolId}>
                        {school.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SchoolSelector;