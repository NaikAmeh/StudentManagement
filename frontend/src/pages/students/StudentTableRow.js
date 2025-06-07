import React from "react";
import { Link } from "react-router-dom";
import { RiDeleteBinLine } from "react-icons/ri";
import StudentPhotoDropzone from "../students/StudentPhotoDropzone";
import "../../styles/table-styles.css";
import "../../styles/buttons.css";

const API_IMAGE_URL = import.meta.env.VITE_API_BASEIMAGE_URL;

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
      <td className="checkbox-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          disabled={isDeleting}
        />
      </td>
      <td className="photo-cell">
         <StudentPhotoDropzone
            studentId={studentId}
            photoName={student.photoName}
            stagedPhoto={stagedPhoto}
            isUploadingPhoto={isUploadingPhoto}
            onDropPhoto={onDropPhoto}
          />
      </td>
      <td>{fullName}</td>
      <td className="reg-no-cell">{studentIdentifier || "N/A"}</td>
      <td className="standard-cell">{standardName || "N/A"}</td>
      <td className="division-cell">{divisionName || "N/A"}</td>
      <td>
        <div title={student.address || ""}>
          {student.address ? (
            student.address.length > 20 
              ? `${student.address.substring(0, 20)}...` 
              : student.address
          ) : "N/A"}
        </div>
      </td>
      {/* <td>
        <span style={{ 
          backgroundColor: isActive ? 'var(--success)' : 'var(--danger)',
          color: 'var(--text-light)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.8em'
        }}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </td> */}
      <td className="actions-cell">
        <div className="action-buttons">
          <Link
            to={`/students/${studentId}/edit`}
            className="btn btn-primary btn-sm"
          >
            Edit
          </Link>
          <button
            onClick={handleDownloadPdf}
            disabled={isDeleting}
            className="btn btn-info btn-sm"
          >
            ID
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-danger btn-sm"
            title="Delete student"
          >
            {isDeleting ? "..." : <RiDeleteBinLine size={16} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentTableRow;