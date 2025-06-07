import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone"; // Import useDropzone
const API_IMAGE_URL = import.meta.env.VITE_API_BASEIMAGE_URL;

const dropzoneBaseStyle = {
  width: "64px",
  height: "64px",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "#d1d1d1", // Simple light gray border color
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  cursor: "pointer",
  padding: "0px",
  transition: "border .24s ease-in-out",
  margin: "auto",
  overflow: "hidden",
  outline: "none",
};

const dropzoneAcceptStyle = {
  borderColor: "#198754",
  backgroundColor: "#e9f7ef",
};

const dropzoneRejectStyle = {
  borderColor: "#dc3545",
  backgroundColor: "#f8d7da",
};

const dropzoneUploadingStyle = {
  borderColor: "#6c757d",
  backgroundColor: "#e9ecef",
  cursor: "progress",
};

const stagedPreviewStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "6px", // Added curved corners to match container
};

const photoPreviewStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "6px", // Added curved corners to match container
  verticalAlign: "middle",
};

const StudentPhotoDropzone = ({
  studentId,
  photoName,
  stagedPhoto,
  onDropPhoto,
  isUploading,
}) => {
  const { getRootProps, getInputProps, isDragAccept, isDragReject, isFocused } =
    useDropzone({
      onDrop: (acceptedFiles) => onDropPhoto(acceptedFiles, studentId),
      accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
      multiple: false,
      disabled: isUploading,
    });

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

  // Construct the photo URL using photoName
  const currentPhotoSrc = photoName
    ? `${API_IMAGE_URL}${photoName}` // Replace with your backend URL
    : null;

  return (
    <div {...getRootProps({ style, className: "dropzone" })}>
      <input {...getInputProps()} />
      {isUploading ? (
        <p style={{ fontSize: "0.8em", margin: 0 }}>Uploading...</p>
      ) : stagedPhoto ? (
        <img
          src={stagedPhoto.preview}
          alt="Preview"
          style={stagedPreviewStyle}
        />
      ) : currentPhotoSrc ? (
        <img
          src={currentPhotoSrc}
          alt={`Student ${studentId}`}
          style={photoPreviewStyle}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = ""; // Or a placeholder image
            e.target.style.display = "none"; // Hide broken image
          }}
        />
      ) : (
        <p style={{ fontSize: "0.7em", margin: 0, color: "#6c757d" }}>
          Drop / Click to Add Photo
        </p>
      )}
    </div>
  );
};

export default StudentPhotoDropzone;