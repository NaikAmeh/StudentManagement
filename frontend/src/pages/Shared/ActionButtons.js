// src/components/students/ActionButtons.js
import React from 'react';
import '../../styles/buttons.css';

// --- Styles ---
const buttonContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
  borderBottom: '1px solid var(--border)',
  paddingBottom: '15px',
};

const ActionButtons = ({
    onAddStudent,
    onExportExcel,
    onDownloadBulkPdf,
    onDownloadAllIdsPdf,
    onDownloadSelectedPdf,
    onSaveAllPhotos,
    stagedPhotosCount,
    selectedStudentsCount,
    canExport, // based on filtered students > 0
    canDownloadBulk, // based on total students > 0
    isLoading, // Aggregate loading state
}) => {
  return (
    <div style={buttonContainerStyle}>
      <button
        onClick={onAddStudent}
        className={`btn btn-primary`}
        disabled={isLoading}
      >
        Add Student
      </button>
      <button
        onClick={onExportExcel}
        className={`btn btn-secondary`}
        disabled={isLoading || !canExport}
        title={!canExport ? "No filtered students to export" : "Export filtered list to Excel"}
      >
        Export Filtered
      </button>
      <button
        onClick={onDownloadAllIdsPdf}
        className={`btn btn-secondary`}
        disabled={isLoading || !canDownloadBulk}
        title={!canDownloadBulk ? "No students in list to generate IDs for" : "Download ID cards for all students in list"}
      >
        Download All IDs
      </button>
      <button
        onClick={onDownloadSelectedPdf}
        className={`btn btn-secondary`}
        disabled={isLoading || selectedStudentsCount === 0}
        title={selectedStudentsCount === 0 ? "No students selected" : `Download ID cards for ${selectedStudentsCount} selected student(s)`}
      >
        Download ({selectedStudentsCount}) Selected IDs
      </button>

      {/* Save All Photos Button - Placed to the right */}
      <button
        onClick={onSaveAllPhotos}
        disabled={isLoading || stagedPhotosCount === 0}
        className={`btn btn-success`}
        style={{ marginLeft: "auto" }} // Align right
        title={stagedPhotosCount === 0 ? "No new photos staged for upload" : `Upload ${stagedPhotosCount} staged photo(s)`}
      >
        Save ({stagedPhotosCount}) Staged Photos
      </button>
    </div>
  );
};

export default ActionButtons;