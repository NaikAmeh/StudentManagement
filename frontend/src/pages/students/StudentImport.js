// src/components/students/StudentImport.js
import React, { useState, useCallback, useRef } from 'react';
import api from '../../services/api'; // Assuming api service is correctly configured

// Import child components used for UI
import ImportSection from '../Shared/ImportSection'; // Re-using the UI part
import ImportResultsDisplay from '../Shared/ImportResultDisplay';
import ErrorMessage from '../Shared/ErrorMessage';

/**
 * Component to handle student import via Excel file upload.
 * Encapsulates file selection, upload process, and result display.
 */
const StudentImport = ({
  selectedSchoolId, // School ID is required to know where to import
  onImportStart,    // Callback when import process begins (optional)
  onImportComplete, // Callback when import process finishes (passes success status and results)
  disabled = false, // Prop to disable the component from the parent
}) => {
  // --- Local State for Import Process ---
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState([]); // Stores results from backend
  const [importError, setImportError] = useState("");   // Stores general import errors
  const importFileInputRef = useRef(null);

  // --- Handlers ---
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    console.log("StudentImport: File selected:", file ? file.name : "None");
    setImportFile(file || null);
    setImportError(""); // Clear previous errors on new file selection
    setImportResults([]); // Clear previous results
  }, []);

  const handleImportExcel = useCallback(async () => {
    // Basic checks handled by parent disabling or internal logic
    if (!selectedSchoolId || !importFile || isImporting) {
      console.warn("StudentImport: Import prerequisites not met.");
      if(!selectedSchoolId) setImportError("School not selected.");
      if(!importFile) setImportError("No file selected.");
      return;
    }

    console.log(`StudentImport: Starting import of ${importFile.name} for school ${selectedSchoolId}`);
    setIsImporting(true);
    setImportError("");
    setImportResults([]); // Clear previous results

    // Notify parent that import is starting (optional)
    if (onImportStart) {
      onImportStart();
    }

    const formData = new FormData();
    formData.append("file", importFile); // "file" must match backend expectation

    let success = false;
        let resultsData = [];
        let errorMessage = null;

    try {
      const response = await api.post(
        `/api/schools/${selectedSchoolId}/students/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("StudentImport: API Response:", response.data);

      if (Array.isArray(response.data)) {
        resultsData = response.data;
        setImportResults(resultsData);
        const hasSuccess = resultsData.some(r => r.success && r.rowNumber > 0);
        const fileError = resultsData.find(r => r.rowNumber === 0 && !r.success);
        success = hasSuccess || !fileError; // Considered success if any row imported or if no fatal file error
        if(fileError) {
            errorMessage = `File Error: ${fileError.errors.join(', ')}`;
            setImportError(errorMessage); // Show file error immediately
        }
      } else {
        errorMessage = "Received unexpected data format from server.";
        console.error("StudentImport: Unexpected response format:", response.data);
        setImportError(errorMessage);
        resultsData = [];
        setImportResults([]);
      }

    } catch (err) {
      success = false; // API call failed
      console.error("StudentImport: Failed to import Excel:", err);
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
        resultsData = err.response.data?.results && Array.isArray(err.response.data.results) ? err.response.data.results : [];
      } else if (err.request) {
        errorMessage = "Network error or server did not respond.";
      } else {
        errorMessage = `Error setting up import request: ${err.message}`;
      }
      setImportError(errorMessage); // Display the general error
      setImportResults(resultsData); // Display partial results if available
    } finally {
      setIsImporting(false); // Stop loading state
      setImportFile(null); // Clear file state
      if (importFileInputRef.current) {
        importFileInputRef.current.value = ""; // Reset input visually
      }

      // Notify parent about completion status and results
      if (onImportComplete) {
        onImportComplete({
          success: success, // Overall success (API call ok, maybe some rows failed)
          results: resultsData, // Detailed row results
          error: errorMessage, // General error message if any
        });
      }
      console.log("StudentImport: Import process finished.");
    }
  }, [selectedSchoolId, importFile, isImporting, onImportStart, onImportComplete]);

  const handleCloseResults = useCallback(() => {
    setImportResults([]);
    setImportError("");
  }, []);

  return (
    <div>
      {/* --- Import UI Section --- */}
      <ImportSection
        onFileChange={handleFileChange}
        onImportExcel={handleImportExcel}
        isImporting={isImporting}
        importFile={importFile}
        fileInputRef={importFileInputRef}
        // Disable if parent says so OR if it's currently importing
        disabled={disabled || isImporting || !selectedSchoolId}
      />

      {/* --- Display General Import Error --- */}
      {/* ErrorMessage handles the conditional rendering based on message */}
      <ErrorMessage message={importError ? `Import Error: ${importError}` : null} />

      {/* --- Display Detailed Import Results --- */}
      {/* ImportResultsDisplay handles conditional rendering if results array is empty */}
      <ImportResultsDisplay 
        results={importResults} 
        onClose={handleCloseResults}
      />
    </div>
  );
};

export default StudentImport;