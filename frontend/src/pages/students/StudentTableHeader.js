// src/components/students/StudentTableHeader.js
import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"; // Import sort icons
import "../../styles/table-styles.css";

const StudentTableHeader = ({
  filters,
  sortConfig,
  onSort,
  onSelectAll,
  isAllSelected,
  numSelected,
  totalFilteredCount,
  onOpenFilterPopup
}) => {

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="sort-icon" />; // Default unsorted state
    }
    return sortConfig.direction === "asc" 
      ? <FaSortUp className="sort-icon active" /> 
      : <FaSortDown className="sort-icon active" />;
  };

  const getSortIndicatorClass = (key) => {
    return sortConfig.key === key ? "sort-indicator active" : "sort-indicator";
  };

  const handleSelectAllChange = (e) => {
    onSelectAll(e.target.checked);
  };

  return (
    <thead>
      <tr>
        <th className="checkbox-cell">
          <input
            type="checkbox"
            onChange={handleSelectAllChange}
            checked={isAllSelected && totalFilteredCount > 0}
            disabled={totalFilteredCount === 0}
          />
        </th>
        <th className="photo-cell">Photo</th>
        <th>
          <div className="header-content">
            <span
              className="sortable-header"
              onClick={(e) => onOpenFilterPopup("fullName", e)}>
              Full Name
            </span>
            <span
              onClick={() => onSort("fullName")}
              className={getSortIndicatorClass("fullName")}
            >
              {getSortIndicator("fullName")}
            </span>
          </div>
        </th>
        <th>
          <div className="header-content">
            <span
              className="sortable-header"
              onClick={(e) => onOpenFilterPopup("studentIdentifier", e)}>
              Identifier
            </span>
            <span
              onClick={() => onSort("studentIdentifier")}
              className={getSortIndicatorClass("studentIdentifier")}
            >
              {getSortIndicator("studentIdentifier")}
            </span>
          </div>
        </th>
        <th>
          <span
            className="sortable-header"
            onClick={(e) => onOpenFilterPopup("standard", e)}
          >
            Standard
          </span>
        </th>
        <th>
          <span
            className="sortable-header"
            onClick={(e) => onOpenFilterPopup("division", e)}
          >
            Division
          </span>
        </th>
        <th>
          <div className="header-content">
            <span
              className="sortable-header"
              onClick={(e) => onOpenFilterPopup("address", e)}
            >
              Address
            </span>
            <span
              onClick={() => onSort("address")}
              className={getSortIndicatorClass("address")}
            >
              {getSortIndicator("address")}
            </span>
          </div>
        </th>
        <th>
          Status
        </th>
        <th className="actions-cell">Actions</th>
      </tr>
    </thead>
  );
};

export default StudentTableHeader;