// src/components/students/ImportResultsDisplay.js
import React from 'react';

// --- Styles ---
const importResultsContainerStyle = {
  margin: "20px 0",
  border: "1px solid #ffc107",
  padding: "15px",
  borderRadius: "5px",
  backgroundColor: "#fff3cd",
  position: "relative",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  tableLayout: "fixed",
  fontSize: "0.9em",
};
const thTdStyle = {
  border: "1px solid #dee2e6",
  padding: "6px 8px",
  textAlign: "left",
  verticalAlign: "middle",
  wordBreak: "break-word",
};
const thStyle = { ...thTdStyle, backgroundColor: "#f8f9fa" };
const errorRowStyle = { backgroundColor: "#f8d7da" };
const errorTextStyle = { color: "#dc3545" };
const successTextStyle = { color: "#198754", fontWeight: 'bold' };
const warningTextStyle = { color: "#ff9800", fontWeight: 'bold' };
const fileErrorStyle = { color: "#dc3545", fontWeight: "bold", marginBottom: '10px' };
const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "5px 10px",
  border: "none",
  background: "#dc3545",
  color: "white",
  borderRadius: "3px",
  cursor: "pointer",
};

const ImportResultsDisplay = ({ results, onClose }) => {
  if (!results || results.length === 0) return null;

  const errorsExist = results.some((r) => !r.success);
  const successesExist = results.some(r => r.success && r.rowNumber > 0);
  const globalError = results.find((r) => r.rowNumber === 0 && !r.success);

  return (
    <div style={importResultsContainerStyle}>
      <button onClick={onClose} style={closeButtonStyle}>×</button>
      <h4>Import Results:</h4>
      {globalError && (
        <p style={fileErrorStyle}>
          File Error: {globalError.errors?.join(", ")}
        </p>
      )}
      {!globalError && errorsExist && successesExist && (
        <p style={warningTextStyle}>
          Some rows had errors. Only valid rows were saved.
        </p>
      )}
       {!globalError && !errorsExist && successesExist && (
        <p style={successTextStyle}>
          All processed rows imported successfully.
        </p>
      )}
       {!globalError && errorsExist && !successesExist && (
         <p style={errorTextStyle}>
             No rows were imported due to errors.
         </p>
       )}


      <div style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Scrollable results */}
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...thStyle, width: '60px'}}>Row #</th>
              <th style={{...thStyle, width: '80px'}}>Status</th>
              <th style={thStyle}>Errors</th>
              <th style={thStyle}>Student Name</th>
              <th style={thStyle}>Registration ID</th>
            </tr>
          </thead>
          <tbody>
            {results
              .filter((r) => r.rowNumber > 0) // Exclude global error row from table body
              .map((result) => (
                <tr
                  key={result.rowNumber}
                  style={!result.success ? errorRowStyle : {}}
                >
                  <td style={thTdStyle}>{result.rowNumber}</td>
                  <td style={thTdStyle}>{result.success ? "Success" : "Failed"}</td>
                  <td style={thTdStyle}>
                    <span style={errorTextStyle}>
                      {result.errors?.join("; ") || ""}
                    </span>
                  </td>
                  <td style={thTdStyle}>
                    {result.importedData?.fullName || ""}
                  </td>
                  <td style={thTdStyle}>
                    {result.importedData?.studentIdentifier || ""}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportResultsDisplay;