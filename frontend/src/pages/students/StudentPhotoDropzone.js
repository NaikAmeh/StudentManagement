// src/components/students/StudentPhotoDropzone.js
import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone";

// --- Styles (Keep relevant styles here) ---
const dropzoneBaseStyle = {
  width: "70px",
  height: "70px",
  border: "2px dashed #adb5bd",
  borderRadius: "5px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  cursor: "pointer",
  padding: "5px",
  transition: "border .24s ease-in-out",
  margin: "auto", // Centered
};
const dropzoneAcceptStyle = {
  borderColor: "#198754",
  backgroundColor: "#e9f7ef",
}; // Greenish
const dropzoneRejectStyle = {
  borderColor: "#dc3545",
  backgroundColor: "#f8d7da",
}; // Reddish
const dropzoneUploadingStyle = {
  borderColor: "#6c757d",
  backgroundColor: "#e9ecef",
  cursor: "progress",
};
const stagedPreviewStyle = {
  width: "50px",
  height: "50px",
  objectFit: "cover",
  borderRadius: "50%",
  border: "2px solid #0d6efd",
}; // Blue border for staged
const photoPreviewStyle = {
  width: "50px",
  height: "50px",
  objectFit: "cover",
  borderRadius: "50%",
  verticalAlign: "middle",
  border: "1px solid #ccc",
};

const StudentPhotoDropzone = ({
  studentId, // Pass studentId explicitly
  photoPath, // Pass photoPath directly
  stagedPhoto,
  onDrop,
  isUploading, // Simplified prop name
}) => {
  const { getRootProps, getInputProps, isDragAccept, isDragReject, isFocused } =
    useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles, studentId), // Use passed studentId
      accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
      multiple: false,
      disabled: isUploading,
    });

  // Combine base style with dynamic styles
  const style = useMemo(
    () => ({
      ...dropzoneBaseStyle,
      ...(isFocused ? { borderColor: "#0d6efd" } : {}),
      ...(isDragAccept ? dropzoneAcceptStyle : {}),
      ...(isDragReject ? dropzoneRejectStyle : {}),
      ...(isUploading ? dropzoneUploadingStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject, isUploading]
  );

  const currentPhotoSrc = photoPath; // Use passed photoPath

  return (
    <div {...getRootProps({ style, className: "dropzone" })}>
      <input {...getInputProps()} />
      {isUploading ? (
        <p style={{ fontSize: "0.8em", margin: 0 }}>Wait...</p>
      ) : stagedPhoto ? (
        <img
          src={stagedPhoto.preview}
          alt="Preview"
          style={stagedPreviewStyle}
        />
      ) : currentPhotoSrc ? (
        <img
          src={`/${currentPhotoSrc}`} // Assuming path is relative to public/root
          alt={`Student ${studentId}`} // Generic alt text
          style={photoPreviewStyle}
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            e.target.src = ""; // Or a placeholder image
            e.target.style.display = "none"; /* Hide broken */
          }}
        />
      ) : (
        <p style={{ fontSize: "0.7em", margin: 0, color: "#6c757d" }}>
          Drop / Click
        </p>
      )}
    </div>
  );
};

export default StudentPhotoDropzone;