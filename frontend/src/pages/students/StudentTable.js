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
  const [popupField, setPopupField] = useState("");
  const [tempFilter, setTempFilter] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);
  const popupRef = useRef(null);

  const handleOpenFilterPopup = (field, event) => {
    setPopupField(field);
    setTempFilter(filters[field] || "");
    const rect = event.target.getBoundingClientRect();
    setPopupPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
  };

// Handle closing the filter popup
  const handleCloseFilterPopup = () => {
    setPopupField(""); // Clear the field being filtered
    setPopupPosition(null); // Hide the popup
  };

// Handle applying the filter
  const handleApplyFilter = () => {
    onFilterChange({ 
      target: { 
        name: popupField, 
        value: tempFilter 
      } 
    });
    handleCloseFilterPopup();
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
            position: "fixed",
            top: popupPosition.top,
            left: popupPosition.left,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "15px",
            zIndex: 9999,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            minWidth: "320px"
          }}
        >
          <h4 style={{ margin: "0 0 15px 0" }}>Filter by {popupField}</h4>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              {popupField === "standard" && (
                <Dropdown
                  label="Select Standard"
                  options={standardOptions.map((option) => ({
                    id: option.standardId,
                    name: option.name,
                  }))}
                  value={tempFilter}
                  onChange={(e) => setTempFilter(e.target.value)}
                />
              )}
              {popupField === "division" && (
                <Dropdown
                  label="Select Division"
                  options={divisionOptions.map((option) => ({
                    id: option.divisionId,
                    name: option.name,
                  }))}
                  value={tempFilter}
                  onChange={(e) => setTempFilter(e.target.value)}
                />
              )}
              {popupField !== "standard" && popupField !== "division" && (
                <div>
                  <input
                    type="text"
                    value={tempFilter}
                    onChange={(e) => setTempFilter(e.target.value)}
                    placeholder={`Enter ${popupField}`}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ced4da"
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button 
                onClick={handleApplyFilter} 
                style={{ 
                  padding: "8px 12px",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                Apply
              </button>
              <button 
                onClick={handleCancelFilter}
                style={{ 
                  padding: "8px 12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;