import React from "react";
import { Link } from "react-router-dom";
import StudentPhotoDropzone from "./StudentPhotoDropzone"; // Assuming this is already a separate component

const StudentGrid = ({
  students,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onSort,
  filters,
  onFilterChange,
  sortConfig,
  onDownloadSinglePdf,
  onDeleteStudent,
  stagedPhotos,
  onDrop,
  uploadingStudentId,
}) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="th" style={{ width: "50px", textAlign: "center" }}>
              <input
                type="checkbox"
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={
                  selectedStudents.length > 0 &&
                  selectedStudents.length === students.length
                }
              />
            </th>
            <th className="photo-cell">Photo</th>
            <th className="th">
              Student Name
              <span
                onClick={() => onSort("lastName")}
                style={{
                  cursor: "pointer",
                  marginLeft: "5px",
                  color: sortConfig.key === "lastName" ? "#0d6efd" : "#6c757d",
                }}
              >
                {sortConfig.key === "lastName"
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : "▲"}
              </span>
              <input
                type="text"
                name="lastName"
                value={filters.lastName}
                onChange={onFilterChange}
                className="filter-input"
                placeholder="Filter by Last Name"
              />
            </th>
            <th className="th">Address</th>
            <th className="th">Roll Number</th>
            <th className="th">Status</th>
            <th className="actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.studentId}>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.studentId)}
                    onChange={(e) =>
                      onSelectStudent(student.studentId, e.target.checked)
                    }
                  />
                </td>
                <td className="photo-cell">
                  <StudentPhotoDropzone
                    student={student}
                    stagedPhoto={stagedPhotos[student.studentId]}
                    onDrop={onDrop}
                    isUploadingThis={uploadingStudentId === student.studentId}
                  />
                </td>
                <td className="th-td">{student.lastName}</td>
                <td className="th-td">{student.firstName}</td>
                <td className="th-td">
                  {student.studentIdentifier || "N/A"}
                </td>
                <td className="th-td">
                  {student.isActive ? "Active" : "Inactive"}
                </td>
                <td className="actions-cell">
                  <Link
                    to={`/students/${student.studentId}/edit`}
                    style={{ marginRight: "5px" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDownloadSinglePdf(student.studentId)}
                    className="button-info"
                  >
                    ID
                  </button>
                  <button
                    onClick={() =>
                      onDeleteStudent(
                        student.studentId,
                        `${student.firstName} ${student.lastName}`
                      )
                    }
                    className="button-danger"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentGrid;