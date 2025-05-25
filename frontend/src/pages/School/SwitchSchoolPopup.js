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

    if (!isOpen) return null; // Don't render the popup if it's not open

    const handleSchoolSelect = (schoolId) => {
        setSelectedSchoolId(schoolId); // Update the selected school ID
    };

    const handleConfirm = () => {
      debugger;
        const selectedSchool = availableSchools.find(
            (school) => school.schoolId === parseInt(selectedSchoolId, 10)
        );
        if (selectedSchool) {
          dispatch(setSelectedSchool(selectedSchool.schoolId)); // Set the selected school in Redux
          onClose(); // Close the popup
          navigate('/'); // Navigate to the home page
        }
    };

    return ReactDOM.createPortal(
        <div className="popup-overlay">
            <div className="popup">
                <SchoolSelector
                    resetOnPopupOpen={isOpen}
                    onSchoolSelect={handleSchoolSelect} // Pass the callback to SchoolSelector
                />
                <div className="popup-actions">
                    <button
                        className="confirm-button"
                        onClick={handleConfirm}
                        disabled={!selectedSchoolId}
                    >
                        Confirm
                    </button>
                    <button className="close-popup-button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body // Render the popup at the root of the DOM
    );
}

export default SwitchSchoolPopup;