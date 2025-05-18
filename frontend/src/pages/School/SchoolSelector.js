import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSchools, selectAvailableSchools, setSelectedSchool } from '../store/slices/schoolSlice';
import { selectDefaultSchoolId, selectIsAuthenticated } from '../store/slices/authSlice';
import SwitchSchoolPopup from '../pages/School/SwitchSchoolPopup';

function SchoolSelector({ onSchoolChange }) {
  const dispatch = useDispatch();
  const defaultSchoolId = useSelector(selectDefaultSchoolId); // Get DefaultSchoolId from Redux
  const availableSchools = useSelector(selectAvailableSchools); // Get available schools from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated); // Check if the user is authenticated

  const [isSwitchSchoolPopupOpen, setIsSwitchSchoolPopupOpen] = useState(false);

  // Fetch available schools if DefaultSchoolId is null
  useEffect(() => {
    if (defaultSchoolId === null && isAuthenticated) {
      dispatch(fetchSchools());
    }
  }, [defaultSchoolId, isAuthenticated, dispatch]);

  // Show popup if no school is selected and schools are available
  useEffect(() => {
    if (defaultSchoolId === null && availableSchools.length > 0) {
      setIsSwitchSchoolPopupOpen(true);
    }
  }, [defaultSchoolId, availableSchools]);

  // Handle school selection
  const handleSwitchSchool = (schoolId) => {
    const selected = availableSchools.find((school) => school.schoolId === schoolId);
    if (selected) {
      dispatch(setSelectedSchool(schoolId)); // Set the selected school in Redux
      setIsSwitchSchoolPopupOpen(false); // Close the popup
      if (onSchoolChange) {
        onSchoolChange(selected); // Notify parent component
      }
    }
  };

  return (
    <>
      {isSwitchSchoolPopupOpen && (
        <SwitchSchoolPopup
          isOpen={isSwitchSchoolPopupOpen}
          availableSchools={availableSchools}
          onClose={() => setIsSwitchSchoolPopupOpen(false)}
          onSelectSchool={handleSwitchSchool}
        />
      )}
    </>
  );
}

export default SchoolSelector;