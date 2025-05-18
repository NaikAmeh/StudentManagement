import React from "react";

const ImportResults = ({ importResults }) => {
  if (!importResults || importResults.length === 0) return null;

  const errorsExist = importResults.some((r) => !r.success);

  return (
    <div className="import-results">
      <h4>Import Results:</h4>
      {errorsExist ? (
        <p style={{ color: "orange" }}>Some rows had errors.</p>
      ) : (
        <p style={{ color: "green" }}>All rows imported successfully.</p>
      )}
      <table>
        <thead>
          <tr>
            <th>Row</th>
            <th>Success</th>
            <th>Errors</th>
          </tr>
        </thead>
        <tbody>
          {importResults.map((result) => (
            <tr key={result.rowNumber}>
              <td>{result.rowNumber}</td>
              <td>{result.success ? "Yes" : "No"}</td>
              <td>{result.errors?.join(", ") || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportResults;