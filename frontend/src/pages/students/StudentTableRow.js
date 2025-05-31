import React from "react";
import { Link } from "react-router-dom";
import StudentPhotoDropzone from "../students/StudentPhotoDropzone"; // Import the dropzone
const API_IMAGE_URL = import.meta.env.VITE_API_BASEIMAGE_URL;

// --- Styles ---
const thTdStyle = {
  border: "1px solid #dee2e6",
  padding: "8px 10px",
  textAlign: "left",
  verticalAlign: "middle",
  wordBreak: "break-word",
};
const photoCellStyle = { ...thTdStyle, width: "90px", textAlign: "center" };
const actionsCellStyle = { ...thTdStyle, width: "180px", textAlign: "center" };
const dangerButtonStyle = {
  backgroundColor: "#dc3545", color: "white", borderColor: "#dc3545",
  padding: "2px 5px", marginLeft: "5px", cursor: "pointer", borderRadius: "3px", border: "1px solid transparent", fontSize: "0.9em"
};
const infoButtonStyle = {
  backgroundColor: "#0dcaf0", color: "black", borderColor: "#0dcaf0",
  padding: "2px 5px", marginLeft: "5px", cursor: "pointer", borderRadius: "3px", border: "1px solid transparent", fontSize: "0.9em"
};
const editLinkStyle = { marginRight: "5px", textDecoration: 'none' }; // Optional: style edit link

const StudentTableRow = ({
  student,
  isSelected,
  stagedPhoto,
  isUploadingPhoto,
  isDeleting,
  onSelectStudent,
  onDropPhoto,
  onDownloadSinglePdf,
  onDeleteStudent,
}) => {
  const { studentId, fullName, studentIdentifier, isActive, photoName, standardName, divisionName } = student;
console.log("StudentTableRow", studentId, fullName, studentIdentifier, isActive, photoName, standardName);
debugger;
  // Construct the photo URL using localhost
  const photoUrl = photoName
    ? `${API_IMAGE_URL}${photoName}?t=${new Date().getTime()}`
    : null;

  const handleSelect = (e) => {
    onSelectStudent(studentId, e.target.checked);
  };

  const handleDelete = () => {
    onDeleteStudent(studentId, fullName);
  };

  const handleDownloadPdf = () => {
    onDownloadSinglePdf(studentId);
  };

  return (
    <tr>
      <td style={{ ...thTdStyle, textAlign: "center", width: "50px" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          disabled={isDeleting}
        />
      </td>
      <td style={photoCellStyle}>
         {/* {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${fullName}'s photo`}
            style={{ maxWidth: "80px", maxHeight: "80px", borderRadius: "5px" }}
            onError={(e) => {
              e.target.style.display = "none"; // Hide the image if it fails to load
              console.error("Failed to load photo:", photoName);
            }}
          />
        ) : (
          <span>No Photo</span>
        )}  */}
         <StudentPhotoDropzone
            studentId={studentId}
            photoName={student.photoName}
            stagedPhoto={stagedPhoto}
            isUploadingPhoto={isUploadingPhoto}
            onDropPhoto={onDropPhoto}
          />
      </td>
      <td style={thTdStyle}>{fullName}</td>
      <td style={thTdStyle}>{studentIdentifier || "N/A"}</td>
      <td style={thTdStyle}>{standardName || "N/A"}</td>
      <td style={thTdStyle}>{divisionName || "N/A"}</td>
      <td style={thTdStyle}>{isActive ? "Active" : "Inactive"}</td>
      <td style={actionsCellStyle}>
        <Link
          to={`/students/${studentId}/edit`}
          style={editLinkStyle}
        >
          Edit
        </Link>
        <button
          onClick={handleDownloadPdf}
          disabled={isDeleting}
          style={infoButtonStyle}
        >
          ID
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={dangerButtonStyle}
        >
          {isDeleting ? "..." : "Del"}
        </button>
      </td>
    </tr>
  );
};

export default StudentTableRow;