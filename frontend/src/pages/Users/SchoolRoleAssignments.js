// src/components/users/SchoolRoleAssignments.js
import React, { useState, useMemo, useEffect } from 'react';
import SchoolRoleAssignmentItem from './SchoolRoleAssignmentItem';

// Basic styles
const containerStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '5px',
    marginTop: '20px',
    backgroundColor: '#fdfdfd'
};
const listStyle = {
    maxHeight: '250px',
    overflowY: 'auto',
    marginBottom: '15px',
    paddingRight: '5px', // Space for scrollbar
};
const addSectionStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
};
const selectStyle = {
    padding: '8px 10px',
    minWidth: '150px',
    flexGrow: 1, // Allow selects to grow
    border: '1px solid #ccc',
    borderRadius: '3px',
};
const addButtonStyle = {
    padding: '8px 15px',
    color: 'white',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
};
const disabledAddButtonStyle = {
    ...addButtonStyle,
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
};
const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '10px',
    display: 'block',
    color: '#333',
};

const SchoolRoleAssignments = ({
  currentAssignments = [], // Array of { schoolId, schoolName, roleId, roleName }
  availableSchools = [],   // Array of { schoolId, name }
  availableRoles = [],     // Array of { roleId, roleName }
  onAssignmentsChange,     // Callback with the updated list of assignments: [{ schoolId, roleId }, ...]
  disabled = false,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Memoize the set of currently assigned school IDs for quick lookup
  const assignedSchoolIds = useMemo(() =>
    new Set(currentAssignments.map(a => a.schoolId))
  , [currentAssignments]);

  // Filter schools that are not already assigned
  const unassignedSchools = useMemo(() =>
    availableSchools.filter(s => !assignedSchoolIds.has(s.schoolId))
  , [availableSchools, assignedSchoolIds]);

  // Reset selections when available schools/roles change (e.g., on initial load)
    useEffect(() => {
        setSelectedSchoolId('');
        setSelectedRoleId('');
    }, [availableSchools, availableRoles]);

  const handleAddAssignment = () => {
    if (!selectedSchoolId || !selectedRoleId) {
      alert("Please select both a school and a role.");
      return;
    }

    const school = availableSchools.find(s => s.schoolId === parseInt(selectedSchoolId, 10));
    const role = availableRoles.find(r => r.roleId === parseInt(selectedRoleId, 10));

    if (!school || !role) {
        console.error("Selected school or role not found in available lists.");
        return;
    }

    // Prepare the new list for the parent
    const newAssignmentsList = [
      ...currentAssignments.map(a => ({ schoolId: a.schoolId, roleId: a.roleId })), // Map to required format
      { schoolId: parseInt(selectedSchoolId, 10), roleId: parseInt(selectedRoleId, 10) }
    ];
    onAssignmentsChange(newAssignmentsList);

    // Reset dropdowns
    setSelectedSchoolId('');
    setSelectedRoleId('');
  };

  const handleRemoveAssignment = (schoolIdToRemove) => {
    // Prepare the new list for the parent
    const newAssignmentsList = currentAssignments
      .filter(a => a.schoolId !== schoolIdToRemove)
      .map(a => ({ schoolId: a.schoolId, roleId: a.roleId })); // Map to required format
    onAssignmentsChange(newAssignmentsList);
  };

  const canAdd = selectedSchoolId && selectedRoleId && !disabled;

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>School & Role Assignments</label>

      {/* List of Current Assignments */}
      <div style={listStyle}>
        {currentAssignments.length === 0 && <p>No schools assigned yet.</p>}
        {currentAssignments.map((assignment) => (
          <SchoolRoleAssignmentItem
            key={assignment.schoolId} // Assuming one role per school for a user
            assignment={assignment}
            onRemove={handleRemoveAssignment}
          />
        ))}
      </div>

      {/* Add New Assignment Section */}
       <label style={{...labelStyle, fontSize: '0.9em', marginTop: '15px'}}>Add New Assignment:</label>
      <div style={addSectionStyle}>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          disabled={disabled || unassignedSchools.length === 0}
          style={selectStyle}
        >
          <option value="">-- Select School --</option>
          {unassignedSchools.map(school => (
            <option key={school.schoolId} value={school.schoolId}>
              {school.name}
            </option>
          ))}
           {unassignedSchools.length === 0 && currentAssignments.length > 0 && <option disabled>All available schools assigned</option>}
           {unassignedSchools.length === 0 && currentAssignments.length === 0 && <option disabled>No schools available</option>}
        </select>

        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          disabled={disabled || availableRoles.length === 0}
          style={selectStyle}
        >
          <option value="">-- Select Role --</option>
          {availableRoles.map(role => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
           {availableRoles.length === 0 && <option disabled>No roles available</option>}
        </select>

        <button
          onClick={handleAddAssignment}
          disabled={!canAdd}
          style={canAdd ? addButtonStyle : disabledAddButtonStyle}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SchoolRoleAssignments;