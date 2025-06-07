// src/components/students/StudentTable.js
import React, { useState, useRef, useEffect } from "react";
import StudentTableHeader from "../students/StudentTableHeader";
import StudentTableRow from "../students/StudentTableRow";
import Dropdown from "../Shared/Dropdown";
import "../../styles/table-styles.css"; // Import the new table styles

const StudentTable = ({
  students,
  filters,
  sortConfig,
  selectedStudents,
  stagedPhotos,
  uploadingStudentId,
  deletingId,
  loadingDelete,
  totalFilteredCount,
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

  const handleCloseFilterPopup = () => {
    setPopupField("");
    setPopupPosition(null);
  };

  const handleApplyFilter = () => {
    onFilterChange({ 
      target: { 
        name: popupField, 
        value: tempFilter 
      } 
    });
    handleCloseFilterPopup();
  };

  const handleCancelFilter = () => {
    onFilterChange({ target: { name: popupField, value: "" } });
    handleCloseFilterPopup();
  };

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
    <div className="table-container">
      <table className="themed-table">
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
          columnStyles={{
            standard: "standard-cell",
            division: "division-cell"
          }}
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
              <td colSpan="7" className="no-records">
                No records found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {popupPosition && (
        <div
          ref={popupRef}
          className="filter-popup"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
          }}
        >
          <h4>Filter by {popupField === "fullName" ? "Full Name" : 
              popupField === "studentIdentifier" ? "Identifier" : 
              popupField === "address" ? "Address" : 
              popupField === "standard" ? "Standard" : 
              popupField === "division" ? "Division" : 
              popupField}
          </h4>
          <div className="filter-popup-content">
            <div className="filter-input-container">
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
                    className="filter-input"
                  />
                </div>
              )}
            </div>
            <div className="filter-actions">
              <button 
                onClick={handleApplyFilter} 
                className="btn btn-primary btn-sm"
              >
                Apply
              </button>
              <button 
                onClick={handleCancelFilter}
                className="btn btn-secondary btn-sm"
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