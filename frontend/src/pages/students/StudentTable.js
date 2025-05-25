// src/components/students/StudentTable.js
import React, { useState, useRef, useEffect } from "react";
import StudentTableHeader from "../students/StudentTableHeader";
import StudentTableRow from "../students/StudentTableRow";
import Dropdown from "../Shared/Dropdown";


// --- Styles ---
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  tableLayout: "fixed", // Keep fixed for consistent column widths
};
const noRecordsStyle = {
  textAlign: "center",
  padding: "20px",
  fontSize: "1.1em",
  color: "#6c757d",
};
const tableContainerStyle = {
    overflowX: "auto", // Ensure horizontal scrolling if needed
    marginTop: '15px',
};

const StudentTable = ({
  students, // The paginated list
  filters,
  sortConfig,
  selectedStudents,
  stagedPhotos,
  uploadingStudentId,
  deletingId,
  loadingDelete,
  totalFilteredCount, // Total count before pagination
  onFilterChange,
  onSort,
  onSelectStudent,
  onSelectAll,
  onDropPhoto,
  onDownloadSinglePdf,
  onDeleteStudent,
  standardOptions,
  divisionOptions
}) => {

  const isAllSelected = selectedStudents.length > 0 && selectedStudents.length === totalFilteredCount;
debugger;
  const [popupField, setPopupField] = useState(""); // Field being filtered
  const [tempFilter, setTempFilter] = useState(""); // Temporary filter value
  const [popupPosition, setPopupPosition] = useState(null); // Popup position
  const popupRef = useRef(null); // Ref for the popup


  // Handle opening the filter popup
  const handleOpenFilterPopup = (field, event) => {
    setPopupField(field); // Set the field being filtered
    setTempFilter(filters[field] || ""); // Reset the temporary filter value
    const rect = event.target.getBoundingClientRect(); // Get the position of the header
    setPopupPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX }); // Position the popup
  };

  // Handle closing the filter popup
  const handleCloseFilterPopup = () => {
    setPopupField(""); // Clear the field being filtered
    setPopupPosition(null); // Hide the popup
  };

  // Handle applying the filter
  const handleApplyFilter = () => {
    if (popupField === "standard" || popupField === "division") {
      onFilterChange({ target: { name: popupField, value: tempFilter } });
    } else {
      onFilterChange({ target: { name: popupField, value: tempFilter } });
    }
    handleCloseFilterPopup(); // Close the popup
  };

  // Handle canceling the filter
  const handleCancelFilter = () => {
    onFilterChange({ target: { name: popupField, value: "" } });
    handleCloseFilterPopup(); // Close the popup without applying the filter
  };

  // Close the popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleCloseFilterPopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
console.log("Studentssss:", students);
  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <StudentTableHeader
          filters={filters}
          sortConfig={sortConfig}
          onFilterChange={onFilterChange}
          onSort={onSort}
          onSelectAll={onSelectAll}
          isAllSelected={isAllSelected}
          numSelected={selectedStudents.length}
          totalFilteredCount={totalFilteredCount}
          onOpenFilterPopup={handleOpenFilterPopup} 
        />
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <StudentTableRow
                key={student.studentId}
                student={student}
                isSelected={selectedStudents.includes(student.studentId)}
                stagedPhoto={stagedPhotos[student.studentId]}
                isUploadingPhoto={uploadingStudentId === student.studentId}
                isDeleting={loadingDelete && deletingId === student.studentId}
                onSelectStudent={onSelectStudent}
                onDropPhoto={onDropPhoto}
                onDownloadSinglePdf={onDownloadSinglePdf}
                onDeleteStudent={onDeleteStudent}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" style={noRecordsStyle}>
                No records found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
       {/* Render the popup outside the table */}
       {popupPosition && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: popupPosition.top,
            left: popupPosition.left,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "10px",
            zIndex: 1000,
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h4>Filter by {popupField}</h4>
          {popupField === "standard" && (
          <Dropdown
            label="Select Standard"
            options={standardOptions.map((option) => ({
              id: option.standardId, // Map studentId to id
              name: option.name,    // Keep the name field as is
            }))}
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
          />
        )}
        {popupField === "division" && (
          <Dropdown
            label="Select Division"
            options={divisionOptions.map((option) => ({
              id: option.divisionId, // Map studentId to id
              name: option.name,    // Keep the name field as is
            }))}
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
          />
        )}
        {popupField !== "standard" && popupField !== "division" && (
          <input
            type="text"
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            placeholder={`Enter ${popupField}`}
          />
        )}
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleApplyFilter} style={{ marginRight: "10px" }}>
              Confirm
            </button>
            <button onClick={handleCancelFilter}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;