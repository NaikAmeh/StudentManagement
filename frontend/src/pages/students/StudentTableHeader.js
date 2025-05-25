// src/components/students/StudentTableHeader.js
import React, { useState, useRef, useEffect } from "react";


// --- Styles ---
const thTdStyle = {
  border: "1px solid #dee2e6",
  padding: "8px 10px",
  textAlign: "left",
  verticalAlign: "middle",
  wordBreak: "break-word",
};
const thStyle = {
  ...thTdStyle,
  backgroundColor: "#f8f9fa",
  position: "sticky",
  top: 0,
  zIndex: 1,
  border: "1px solid #dee2e6", // Explicitly define the border
};
const filterInputStyle = {
  width: "95%",
  padding: "4px",
  boxSizing: "border-box",
  marginTop: "4px",
  fontSize: "0.9em",
  border: "1px solid #ced4da",
  borderRadius: "3px",
};
const photoCellStyle = { ...thStyle, width: "90px", textAlign: "center" };
const actionsCellStyle = { ...thStyle, width: "180px", textAlign: "center" };
const sortIndicatorStyle = {
  cursor: "pointer",
  marginLeft: "5px",
  // color will be set dynamically
};


const pointerStyle = {
  cursor: "pointer", // Add pointer style for clickable headers
};

const StudentTableHeader = ({
  filters,
  sortConfig,
  onFilterChange,
  onSort,
  onSelectAll,
  isAllSelected,
  numSelected, // Needed to determine indeterminate state potentially
  totalFilteredCount, // Needed for select all logic
  onOpenFilterPopup
}) => {

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "↕️"; // Or use triangles ▲▼
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const getSortIndicatorColor = (key) => {
     return sortConfig.key === key ? "#0d6efd" : "#6c757d";
  };

  const handleSelectAllChange = (e) => {
      onSelectAll(e.target.checked);
  };

  return (
    <thead>
      <tr>
        <th style={{ ...thStyle, width: "50px", textAlign: "center" }}>
          <input
            type="checkbox"
            onChange={handleSelectAllChange}
            checked={isAllSelected && totalFilteredCount > 0} // Ensure checked only if items exist
            // Consider adding: ref={el => el && (el.indeterminate = numSelected > 0 && !isAllSelected)}
            disabled={totalFilteredCount === 0} // Disable if no students
          />
        </th>
        <th style={photoCellStyle}>Photo</th>
        <th style={thStyle}>
        <span
         style={pointerStyle}
         onClick={(e) => onOpenFilterPopup("fullName", e)}>
          Full Name
          </span>
          <span
            onClick={() => onSort("fullName")}
            style={{ cursor: "pointer", marginLeft: "5px", color: getSortIndicatorColor("fullName") }}
          >
            {getSortIndicator("fullName")}
          </span>
        </th>
        <th style={thStyle}>
        <span
         style={pointerStyle}
         onClick={(e) => onOpenFilterPopup("studentIdentifier", e)}>
          Identifier
          </span>
          <span
            onClick={() => onSort("studentIdentifier")}
            style={{ cursor: "pointer", marginLeft: "5px", color: getSortIndicatorColor("studentIdentifier") }}
          >
            {getSortIndicator("studentIdentifier")}
          </span>
        </th>
        <th style={thStyle}>
          <span
            style={pointerStyle}
            onClick={(e) => onOpenFilterPopup("standard", e)}
          >
            Standard
          </span>
        </th>
        <th style={thStyle}>
          <span
            style={pointerStyle}
            onClick={(e) => onOpenFilterPopup("division", e)}
          >
            Division
          </span>
        </th>
        <th style={thStyle}>
            Status
            {/* Optional: Add sorting by status if needed */}
             {/* <span
                onClick={() => onSort("isActive")}
                style={{...sortIndicatorStyle, color: getSortIndicatorColor('isActive')}}
             >
                 {getSortIndicator("isActive")}
             </span> */}
        </th>
        <th style={actionsCellStyle}>Actions</th>
      </tr>
    </thead>
  );
};

export default StudentTableHeader;