// src/components/users/SchoolRoleAssignmentItem.js
import React from 'react';

// Basic styles (inline for brevity, prefer CSS classes)
const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 10px',
  border: '1px solid #e0e0e0',
  marginBottom: '5px',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
};

const textStyle = {
    flexGrow: 1,
    marginRight: '10px',
};

const schoolNameStyle = {
    fontWeight: 'bold',
};

const roleNameStyle = {
    fontStyle: 'italic',
    color: '#555',
    marginLeft: '5px',
};

const removeButtonStyle = {
  padding: '3px 8px',
  fontSize: '0.8em',
  color: 'white',
  backgroundColor: '#dc3545',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
};

const SchoolRoleAssignmentItem = ({ assignment, onRemove }) => {
  // assignment expected: { schoolId, schoolName, roleId, roleName }
  const handleRemove = () => {
    onRemove(assignment.schoolId); // Remove based on schoolId
  };

  return (
    <div style={itemStyle}>
      <span style={textStyle}>
        <span style={schoolNameStyle}>{assignment.schoolName || `School ID: ${assignment.schoolId}`}</span>
        <span style={roleNameStyle}>({assignment.roleName || `Role ID: ${assignment.roleId}`})</span>
      </span>
      <button onClick={handleRemove} style={removeButtonStyle} title={`Remove assignment for ${assignment.schoolName}`}>
        Remove
      </button>
    </div>
  );
};

export default SchoolRoleAssignmentItem;