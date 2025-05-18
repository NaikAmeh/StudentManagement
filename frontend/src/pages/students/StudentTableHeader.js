// src/components/students/StudentTableHeader.js
import React from "react";

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

const StudentTableHeader = ({
  filters,
  sortConfig,
  onFilterChange,
  onSort,
  onSelectAll,
  isAllSelected,
  numSelected, // Needed to determine indeterminate state potentially
  totalFilteredCount, // Needed for select all logic
}) => {

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "↕️"; // Or use triangles ▲▼
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const getSortIndicatorColor = (key) => {
     return sortConfig.key === key ? "#0d6efd" : "#6c757d";
  }

  const handleSelectAllChange = (e) => {
      onSelectAll(e.target.checked);
  }

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
          Last Name
          <span
            onClick={() => onSort("lastName")}
            style={{...sortIndicatorStyle, color: getSortIndicatorColor('lastName')}}
            title="Sort by Last Name"
          >
            {getSortIndicator("lastName")}
          </span>
          <input
            type="text"
            name="lastName"
            value={filters.lastName}
            onChange={onFilterChange}
            style={filterInputStyle}
            placeholder="Filter"
          />
        </th>
        <th style={thStyle}>
          First Name
           <span
            onClick={() => onSort("firstName")}
            style={{...sortIndicatorStyle, color: getSortIndicatorColor('firstName')}}
            title="Sort by First Name"
          >
             {getSortIndicator("firstName")}
          </span>
          <input
            type="text"
            name="firstName"
            value={filters.firstName}
            onChange={onFilterChange}
            style={filterInputStyle}
            placeholder="Filter"
          />
        </th>
        <th style={thStyle}>
          Identifier
           <span
            onClick={() => onSort("studentIdentifier")}
            style={{...sortIndicatorStyle, color: getSortIndicatorColor('studentIdentifier')}}
            title="Sort by Identifier"
          >
             {getSortIndicator("studentIdentifier")}
          </span>
          <input
            type="text"
            name="studentIdentifier"
            value={filters.studentIdentifier}
            onChange={onFilterChange}
            style={filterInputStyle}
            placeholder="Filter"
          />
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