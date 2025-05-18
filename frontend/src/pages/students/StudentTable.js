// src/components/students/StudentTable.js
import React from "react";
import StudentTableHeader from "../students/StudentTableHeader";
import StudentTableRow from "../students/StudentTableRow";

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
}) => {

  const isAllSelected = selectedStudents.length > 0 && selectedStudents.length === totalFilteredCount;

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
              <td colSpan="7" style={noRecordsStyle}> {/* Increased colspan */}
                No records found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;