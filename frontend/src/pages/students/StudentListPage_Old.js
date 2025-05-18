// src/pages/students/StudentListPage.js
import React, { useEffect, useState } from 'react'; // Added useState for import handling example
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedSchoolId, selectSchoolLoading } from '../../store/slices/schoolSlice'; // School selectors
// --- Import student selectors and actions (CREATE THESE) ---
import {
    fetchStudentsBySchool, // Async Thunk
    selectStudentList,
    selectStudentLoading,
    selectStudentError,
    clearStudents // Action to clear list when school changes
} from '../../store/slices/studentSlice';
import api from '../../services/api'; // Keep for direct export/import/pdf calls for now

// --- Placeholder data and functions until studentSlice is ready ---
const usePlaceholderStudents = (schoolId) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (schoolId) {
            setLoading(true); setError(null); setStudents([]);
             console.warn(`Placeholder: Would fetch students for school ${schoolId}. Redux slice needed.`);
             // Simulating fetch delay
             setTimeout(() => {
                 // setStudents([{studentId: 1, firstName: 'Jane', lastName: 'Doe', studentIdentifier: 'S123', isActive: true, photoThumbnailPath: null, schoolId: schoolId}]); // Example data
                 setLoading(false);
             }, 500);
        } else {
            setStudents([]); setLoading(false); setError(null);
        }
    }, [schoolId]);
    return { students, loading, error };
};
// --- End Placeholder ---


// ... styles (from previous example) ...
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thTdStyle = { border: '1px solid #ccc', padding: '8px', textAlign: 'left' };
const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2' };
const buttonContainerStyle = { marginBottom: '20px', display: 'flex', gap: '10px' };

function StudentListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedSchoolId = useSelector(selectSelectedSchoolId);
  const loadingSchools = useSelector(selectSchoolLoading);

  // --- Replace Placeholder with Redux state once slice is created ---
  const { students, loading, error } = usePlaceholderStudents(selectedSchoolId);
  // const students = useSelector(selectStudentList);
  // const loading = useSelector(selectStudentLoading);
  // const error = useSelector(selectStudentError);
  // --- End Replacement Section ---

  // --- State for Import UI ---
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [importError, setImportError] = useState('');
  // ---

  // Effect to fetch students when selected school changes
  useEffect(() => {
    if (selectedSchoolId) {
        console.log(`StudentListPage: selectedSchoolId changed to ${selectedSchoolId}. Triggering fetch.`);
        // --- Dispatch fetch action when slice is ready ---
        // dispatch(fetchStudentsBySchool(selectedSchoolId));
    } else {
        // Optionally clear students if school is deselected
        // dispatch(clearStudents()); // Add clearStudents action to studentSlice
    }
  }, [selectedSchoolId, dispatch]); // Dependency on selectedSchoolId

  // --- Event Handlers ---
   const handleAddStudent = () => {
       if (selectedSchoolId) {
            // Pass schoolId in state if needed by Add page, or rely on Add page getting it from Redux
            navigate(`/students/new`, { state: { schoolId: selectedSchoolId } });
       } else {
            alert("Please select a school first.");
       }
   };

   const handleExportExcel = async () => { /* ... implementation from previous step ... */ };
   const handleDownloadBulkPdf = async () => { /* ... implementation from previous step ... */ };
   const handleDownloadSinglePdf = async (studentId) => {
        console.log(`Downloading single PDF for student ${studentId}`);
        alert(`Single PDF download UI/Logic needed for student ${studentId}.`);
        // TODO: Implement API call GET /api/students/{id}/idcard and download logic
   };

   // --- Import Handlers ---
    const handleFileChange = (event) => {
        setImportFile(event.target.files[0]);
        setImportError(''); // Clear previous errors
        setImportResults([]);
    };

    const handleImportExcel = async () => {
        if (!selectedSchoolId) {
            alert("Please select a school first.");
            return;
        }
        if (!importFile) {
            alert("Please select an Excel file to import.");
            return;
        }

        setIsImporting(true);
        setImportError('');
        setImportResults([]);
        const formData = new FormData();
        formData.append('file', importFile); // 'file' must match the parameter name in the controller action

        try {
            const response = await api.post(`/api/schools/${selectedSchoolId}/students/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Axios might set this automatically with FormData
                },
            });
            setImportResults(response.data || []); // Expecting List<StudentImportResultDto>
             alert('Import process completed. Check results below.');
             // Optionally refresh the student list after successful import
             // dispatch(fetchStudentsBySchool(selectedSchoolId));
        } catch (err) {
            console.error("Failed to import Excel:", err);
            setImportError(err.response?.data?.message || err.message || 'Failed to import data.');
            setImportResults([]);
        } finally {
            setIsImporting(false);
            setImportFile(null); // Clear the selected file
            // Clear the file input visually (find input by id/ref and reset value)
             const fileInput = document.getElementById('importFileInput');
             if (fileInput) fileInput.value = '';
        }
    };


  // --- Render Logic ---
  const renderContent = () => { /* ... implementation from previous step ... */ };
//   const renderImportResults = () => { /* ... implementation below ... */ };

  return (
    <div>
      <h2>Student List {selectedSchoolId ? ` - School ID: ${selectedSchoolId}` : ''}</h2> {/* Update to show name later */}

      {/* Action Buttons */}
      {selectedSchoolId && (
          <div style={buttonContainerStyle}>
              <button onClick={handleAddStudent} disabled={loading}>Add Student</button>
              <button onClick={handleExportExcel} disabled={loading || students.length === 0}>Export Excel</button>
              <button onClick={handleDownloadBulkPdf} disabled={loading || students.length === 0}>Download Bulk IDs (PDF)</button>
              {/* Import Section */}
              <div style={{ border: '1px solid #eee', padding: '5px', marginLeft: '10px' }}>
                  <input type="file" id="importFileInput" accept=".xlsx" onChange={handleFileChange} disabled={isImporting}/>
                  <button onClick={handleImportExcel} disabled={isImporting || !importFile}>
                      {isImporting ? 'Importing...' : 'Upload & Import'}
                  </button>
              </div>
          </div>
      )}
      {importError && <p style={{ color: 'red' }}>Import Error: {importError}</p>}
      {renderImportResults()} {/* Render import results */}

      {renderContent()} {/* Render table or status messages */}
    </div>
  );

    // Helper function to render import results table
    function renderImportResults() {
        if (importResults.length === 0) return null;

        const errorsExist = importResults.some(r => !r.success);

        return (
            <div style={{ margin: '20px 0', border: '1px solid orange', padding: '10px' }}>
                <h4>Import Results:</h4>
                 {errorsExist ? <p style={{color: 'orange'}}>Some rows had errors. Only valid rows were saved.</p> : <p style={{color: 'green'}}>All processed rows imported successfully.</p>}
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Row</th>
                            <th style={thStyle}>Success</th>
                            <th style={thStyle}>Errors</th>
                            <th style={thStyle}>Data (First Name)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {importResults.map((result) => (
                            <tr key={result.rowNumber} style={{ backgroundColor: result.success ? 'inherit' : '#ffeeee' }}>
                                <td style={thTdStyle}>{result.rowNumber}</td>
                                <td style={thTdStyle}>{result.success ? 'Yes' : 'No'}</td>
                                <td style={thTdStyle}>{result.errors?.join(', ') || ''}</td>
                                <td style={thTdStyle}>{result.importedData?.firstName || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default StudentListPage;