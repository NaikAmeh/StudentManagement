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
  //const { students, loading, error } = usePlaceholderStudents(selectedSchoolId);
  // const students = useSelector(selectStudentList);
  // const loading = useSelector(selectStudentLoading);
  // const error = useSelector(selectStudentError);
  // --- End Replacement Section ---

   // --- Use Redux state for students ---
   const students = useSelector(selectStudentList);
   const loadingStudents = useSelector(selectStudentLoading);
   const studentError = useSelector(selectStudentError);
   // --- End Redux state usage ---

  // --- State for Import UI ---
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [importError, setImportError] = useState('');
  // ---

  // Effect to fetch students when selected school changes
  useEffect(() => {
    if (selectedSchoolId) {
        console.log(`StudentListPage: selectedSchoolId changed to ${selectedSchoolId}. Dispatching fetchStudentsBySchool.`);
        // Dispatch the async thunk to fetch students
        dispatch(fetchStudentsBySchool(selectedSchoolId));
    } else {
        // Clear students if no school is selected
        dispatch(clearStudents());
    }
    // Clear import results when school changes
    setImportResults([]);
    setImportError('');
  }, [selectedSchoolId, dispatch]);

  // --- Event Handlers ---
   const handleAddStudent = () => {
       if (selectedSchoolId) {
            // Pass schoolId in state if needed by Add page, or rely on Add page getting it from Redux
            navigate(`/students/new`, { state: { schoolId: selectedSchoolId } });
       } else {
            alert("Please select a school first.");
       }
   };

   const handleExportExcel = async () => {
    if (!selectedSchool) {
        alert("Please select a school first.");
        return;
    }
    console.log("Exporting Excel for school:", selectedSchool.schoolId);
    setLoading(true); // Indicate loading
    try {
        const response = await api.get(`/api/schools/${selectedSchool.schoolId}/students/export`, {
            responseType: 'blob', // Important for file download
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Extract filename from content-disposition header if available, otherwise generate one
         let filename = `students_school_${selectedSchool.schoolId}.xlsx`; // Default
         const contentDisposition = response.headers['content-disposition'];
         if (contentDisposition) {
             const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
             if (filenameMatch && filenameMatch.length === 2) {
                 filename = filenameMatch[1];
             }
         }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error("Failed to export Excel:", err);
        setError(err.response?.data?.message || err.message || 'Failed to export data.');
    } finally {
         setLoading(false);
    }
};

// const handleImportExcel = () => {
//     if (!selectedSchool) {
//        alert("Please select a school first.");
//        return;
//    }
//    console.log("Trigger Import Excel for school:", selectedSchool.schoolId);
//    alert("Import Excel functionality not yet implemented in UI.");
//    // TODO: Implement file input handling and call POST /api/schools/{schoolId}/students/import
// };
const handleDownloadBulkPdf = async () => {
    if (!selectedSchool) {
        alert("Please select a school first.");
        return;
    }
    console.log("Downloading Bulk PDF for school:", selectedSchool.schoolId);
     setLoading(true);
     try {
          const response = await api.get(`/api/schools/${selectedSchool.schoolId}/students/idcards/bulk`, {
              responseType: 'blob',
          });

         // Similar blob handling as Excel export
         const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
         const link = document.createElement('a');
         link.href = url;

         let filename = `idcards_bulk_school_${selectedSchool.schoolId}.pdf`;
         const contentDisposition = response.headers['content-disposition'];
         if (contentDisposition) {
             const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
             if (filenameMatch && filenameMatch.length === 2) {
                 filename = filenameMatch[1];
             }
         }

         link.setAttribute('download', filename);
         document.body.appendChild(link);
         link.click();
         link.parentNode.removeChild(link);
         window.URL.revokeObjectURL(url);

     } catch (err) {
         console.error("Failed to download bulk PDF:", err);
         setError(err.response?.data?.message || err.message || 'Failed to download bulk ID cards.');
     } finally {
         setLoading(false);
     }
};
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
  const renderContent = () => {
    if (loadingSchools) { // Still waiting for school info?
        return <p>Loading school information...</p>;
    }
    if (!selectedSchoolId) {
        return <p>Please select a school from the header to view students.</p>;
    }
    if (loadingStudents) { // Use student loading state
        return <p>Loading students...</p>;
    }
    if (studentError) { // Use student error state
        return <p style={{ color: 'red' }}>Error loading students: {studentError}</p>;
    }
    if (!students || students.length === 0) { // Check Redux students array
        return <p>No students found for the selected school.</p>;
    }

    // Display student table (using Redux 'students' state)
    return (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thStyle}>Photo</th>
                    <th style={thStyle}>Last Name</th>
                    <th style={thStyle}>First Name</th>
                    <th style={thStyle}>Student ID</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {students.map(student => (
                <tr key={student.studentId}>
                     <td style={thTdStyle}>
                        {/* Photo rendering logic */}
                        {student.photoThumbnailPath ? (
                            <img src={`/${student.photoThumbnailPath}`} alt={`${student.firstName} ${student.lastName}`} width="50" height="50" style={{objectFit: 'cover'}} loading="lazy"/>
                        ) : (
                            <div style={{width: 50, height: 50, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em'}}>No Pic</div>
                        )}
                     </td>
                     <td style={thTdStyle}>{student.lastName}</td>
                    <td style={thTdStyle}>{student.firstName}</td>
                    <td style={thTdStyle}>{student.studentIdentifier || 'N/A'}</td>
                    <td style={thTdStyle}>{student.isActive ? 'Active' : 'Inactive'}</td>
                    <td style={thTdStyle}>
                        {/* TODO: Update link paths if needed */}
                        <Link to={`/students/${student.studentId}/edit`}>View/Edit</Link>
                        {' | '}
                         <button onClick={() => handleDownloadSinglePdf(student.studentId)} style={{padding: '2px 5px', marginLeft: '5px'}}>ID Card</button>
                         {/* Add Delete button later */}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    );
  };
//   const renderImportResults = () => { /* ... implementation below ... */ };

return (
    <div>
      {/* Update title to use selectedSchool object from Redux if needed */}
      <h2>Student List {selectedSchoolId ? ` - School ID: ${selectedSchoolId}` : ''}</h2>

      {/* Action Buttons */}
      {selectedSchoolId && (
          <div style={buttonContainerStyle}>
              {/* Buttons using loadingStudents state */}
              <button onClick={handleAddStudent} disabled={loadingStudents || isImporting}>Add Student</button>
              <button onClick={handleExportExcel} disabled={loadingStudents || isImporting || !students || students.length === 0}>Export Excel</button>
              <button onClick={handleDownloadBulkPdf} disabled={loadingStudents || isImporting || !students || students.length === 0}>Download Bulk IDs (PDF)</button>
              {/* Import Section */}
              <div style={{ border: '1px solid #eee', padding: '5px', marginLeft: 'auto' }}> {/* Moved Import to right */}
                  <input type="file" id="importFileInput" accept=".xlsx" onChange={handleFileChange} disabled={isImporting}/>
                  <button onClick={handleImportExcel} disabled={isImporting || !importFile}>
                      {isImporting ? 'Importing...' : 'Upload & Import'}
                  </button>
              </div>
          </div>
      )}
      {importError && <p style={{ color: 'red' }}>Import Error: {importError}</p>}
      {renderImportResults()}

      {renderContent()}
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