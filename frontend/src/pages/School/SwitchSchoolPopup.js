import {React, useState} from 'react';

import ReactDOM from 'react-dom'; // Import ReactDOM
import '../../styles/SwitchSchoolPopup.css'; // Add styles for the popup

function SwitchSchoolPopup({ isOpen, availableSchools, onClose, onSelectSchool }) {
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
  
    if (!isOpen) return null; // Don't render the popup if it's not open
  
    const handleSelectChange = (e) => {
      setSelectedSchoolId(e.target.value);
    };
  
    const handleConfirm = () => {
      const selectedSchool = availableSchools.find(
        (school) => school.id === parseInt(selectedSchoolId, 10)
      );
      if (selectedSchool) {
        onSelectSchool(selectedSchool);
      }
    };
  
    return ReactDOM.createPortal(
      <div className="popup-overlay">
        <div className="popup">
          <h3>Select a School</h3>
          <select
            value={selectedSchoolId}
            onChange={handleSelectChange}
            className="school-dropdown"
          >
            <option value="" disabled>
              -- Select a School --
            </option>
            {availableSchools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
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