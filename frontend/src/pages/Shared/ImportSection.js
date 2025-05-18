// src/components/students/ImportSection.js
import React from 'react';

// --- Styles ---
const importSectionStyle = {
  border: "1px solid #dee2e6",
  padding: "10px 15px",
  borderRadius: "5px",
  backgroundColor: "#f8f9fa",
  marginTop: '15px', // Add some space
};
const buttonStyle = {
  padding: "6px 12px", cursor: "pointer", borderRadius: "3px",
  border: "1px solid transparent", fontSize: "0.9em", marginLeft: '10px'
};
const importButtonStyle = {...buttonStyle, backgroundColor: "#198754", color: "white", borderColor: "#198754" };
const disabledButtonStyle = { ...importButtonStyle, cursor: "not-allowed", opacity: 0.65 };

const ImportSection = ({
    onFileChange,
    onImportExcel,
    isImporting,
    importFile,
    fileInputRef,
}) => {

  const buttonCurrentStyle = isImporting || !importFile ? disabledButtonStyle : importButtonStyle;

  return (
    <div style={importSectionStyle}>
      <label htmlFor="importFileInput" style={{ marginRight: '10px' }}>Import Students (Excel):</label>
      <input
        type="file"
        id="importFileInput"
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onFileChange}
        ref={fileInputRef}
        disabled={isImporting}
        style={{ fontSize: '0.9em' }}
      />
      <button
        onClick={onImportExcel}
        disabled={isImporting || !importFile}
        style={buttonCurrentStyle}
      >
        {isImporting ? "Importing..." : "Upload & Import"}
      </button>
    </div>
  );
};

export default ImportSection;