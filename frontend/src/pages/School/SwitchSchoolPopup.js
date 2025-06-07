import { React, useState } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import '../../styles/SwitchSchoolPopup.css'; // Add styles for the popup
import SchoolSelector from '../../components/SchoolSelector'; // Ensure this uses Redux too
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSchool } from '../../store/slices/schoolSlice'; // Import the setSelectedSchool action
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function SwitchSchoolPopup({ isOpen, availableSchools, onClose, onSelectSchool }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  if (!isOpen) return null;

  const handleSchoolSelect = (schoolId) => {
    setSelectedSchoolId(schoolId);
  };

  const handleConfirm = () => {
    const selectedSchool = availableSchools.find(
      (school) => school.schoolId === parseInt(selectedSchoolId, 10)
    );
    
    if (selectedSchool) {
      // First dispatch the action
      dispatch(setSelectedSchool(selectedSchool.schoolId));
      // Then close the popup
      onClose();
      // Finally navigate
      setTimeout(() => {
        navigate('/');
      }, 0);
    }
  };

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup">
        <SchoolSelector
          resetOnPopupOpen={isOpen}
          schools={availableSchools}
          selectedSchoolId={selectedSchoolId}
          onSchoolSelect={handleSchoolSelect}
        />
        <div className="popup-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm} disabled={!selectedSchoolId}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body // Render the popup at the root of the DOM
  );
}

export default SwitchSchoolPopup;