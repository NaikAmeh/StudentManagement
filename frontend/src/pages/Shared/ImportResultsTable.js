import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/ImportResultsTable.css'; // Adjust the path as necessary

const ImportResultsTable = ({ importResults }) => {
  if (!importResults || importResults.length === 0) return null;

  const errorsExist = importResults.some((r) => !r.success);
  const globalError = importResults.find(
    (r) => r.rowNumber === 0 && !r.success
  );

  return (
    <div className="import-results-container">
      <h4>Import Results:</h4>
      {globalError && (
        <p className="error-message">
          File Error: {globalError.errors?.join(", ")}
        </p>
      )}
      {errorsExist && !globalError ? (
        <p className="warning-message">
          Some rows had errors. Only valid rows were saved.
        </p>
      ) : (
        ""
      )}
      {!errorsExist && !globalError ? (
        <p className="success-message">
          All processed rows imported successfully.
        </p>
      ) : (
        ""
      )}

      <table className="import-results-table">
        <thead>
          <tr>
            <th>Row #</th>
            <th>Success</th>
            <th>Errors</th>
            <th>Student Name</th>
            <th>Registration Id</th>
          </tr>
        </thead>
        <tbody>
          {importResults
            .filter((r) => r.rowNumber > 0)
            .map((result) => (
              <tr
                key={result.rowNumber}
                className={result.success ? '' : 'error-row'}
              >
                <td>{result.rowNumber}</td>
                <td>{result.success ? "Yes" : "No"}</td>
                <td>
                  <span className="error-text">
                    {result.errors?.join(", ") || ""}
                  </span>
                </td>
                <td>{result.importedData?.fullName || ""}</td>
                <td>{result.importedData?.studentIdentifier || ""}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

ImportResultsTable.propTypes = {
  importResults: PropTypes.arrayOf(
    PropTypes.shape({
      rowNumber: PropTypes.number.isRequired,
      success: PropTypes.bool.isRequired,
      errors: PropTypes.arrayOf(PropTypes.string),
      importedData: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        studentIdentifier: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default ImportResultsTable;