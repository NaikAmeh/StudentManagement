// src/components/students/ActionButtons.js
import React from 'react';

// --- Styles ---
const buttonContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
  borderBottom: '1px solid #dee2e6', // Add separator
  paddingBottom: '15px', // Add space below buttons
};
const buttonStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "3px",
  border: "1px solid transparent",
  fontSize: "0.9em",
};
const primaryButtonStyle = { ...buttonStyle, backgroundColor: "#0d6efd", color: "white", borderColor: "#0d6efd" };
const secondaryButtonStyle = { ...buttonStyle, backgroundColor: "#6c757d", color: "white", borderColor: "#6c757d" };
const successButtonStyle = { ...buttonStyle, backgroundColor: "#198754", color: "white", borderColor: "#198754" };
const disabledButtonStyle = { ...buttonStyle, cursor: "not-allowed", opacity: 0.65 };

const ActionButtons = ({
    onAddStudent,
    onExportExcel,
    onDownloadBulkPdf,//onDownloadBulkPdf,
    onDownloadAllIdsPdf,
    onDownloadSelectedPdf,
    onSaveAllPhotos,
    stagedPhotosCount,
    selectedStudentsCount,
    canExport, // based on filtered students > 0
    canDownloadBulk, // based on total students > 0
    isLoading, // Aggregate loading state
}) => {

  const addButtonStyle = isLoading ? disabledButtonStyle : primaryButtonStyle;
  const exportButtonStyle = isLoading || !canExport ? disabledButtonStyle : secondaryButtonStyle;
  const bulkPdfButtonStyle = isLoading || !canDownloadBulk ? disabledButtonStyle : secondaryButtonStyle;
  const selectedPdfButtonStyle = isLoading || selectedStudentsCount === 0 ? disabledButtonStyle : secondaryButtonStyle;
  const savePhotosButtonStyle = isLoading || stagedPhotosCount === 0 ? disabledButtonStyle : successButtonStyle;


  return (
    <div style={buttonContainerStyle}>
      <button
        onClick={onAddStudent}
        style={addButtonStyle}
        disabled={isLoading}
      >
        Add Student
      </button>
      <button
        onClick={onExportExcel}
        style={exportButtonStyle}
        disabled={isLoading || !canExport}
        title={!canExport ? "No filtered students to export" : "Export filtered list to Excel"}
      >
        Export Filtered
      </button>
      <button
        onClick={onDownloadAllIdsPdf}//onDownloadBulkPdf
        style={bulkPdfButtonStyle}
        disabled={isLoading || !canDownloadBulk}
        title={!canDownloadBulk ? "No students in list to generate IDs for" : "Download ID cards for all students in list"}

      >
        Download All IDs
      </button>
      <button
        onClick={onDownloadSelectedPdf}
        style={selectedPdfButtonStyle}
        disabled={isLoading || selectedStudentsCount === 0}
        title={selectedStudentsCount === 0 ? "No students selected" : `Download ID cards for ${selectedStudentsCount} selected student(s)`}
      >
        Download ({selectedStudentsCount}) Selected IDs
      </button>

      {/* Save All Photos Button - Placed to the right */}
      <button
        onClick={onSaveAllPhotos}
        disabled={isLoading || stagedPhotosCount === 0}
        style={{ ...savePhotosButtonStyle, marginLeft: "auto" }} // Align right
        title={stagedPhotosCount === 0 ? "No new photos staged for upload" : `Upload ${stagedPhotosCount} staged photo(s)`}
      >
        Save ({stagedPhotosCount}) Staged Photos
      </button>
    </div>
  );
};

export default ActionButtons;