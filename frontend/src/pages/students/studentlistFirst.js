// src/pages/students/StudentListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // For navigation links
import { useSchool } from '../../contexts/SchoolContext'; // To get selected school
import api from '../../services/api'; // Your configured Axios instance

// Placeholder simple table styles (replace with proper CSS/UI library later)
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const thTdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
};

const thStyle = {
  ...thTdStyle,
  backgroundColor: '#f2f2f2',
};

const buttonContainerStyle = {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
};

function StudentListPage() {
  const [students, setStudents] = useState([]); // Store list of StudentSummaryDto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedSchool, loadingSchools } = useSchool(); // Get selected school and its loading state
  const navigate = useNavigate(); // For programmatic navigation

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchStudents = useCallback(async (schoolId) => {
    if (!schoolId) {
        setStudents([]); // Clear students if no school is selected
        return;
    };

    setLoading(true);
    setError(null);
    console.log(`Fetching students for School ID: ${schoolId}`);
    try {
      // Use the school-scoped endpoint
      const response = await api.get(`/api/schools/${schoolId}/students`);
      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
        console.log("Students fetched:", response.data)
      } else {
        setStudents([]); // Set empty if response is not as expected
        console.warn("Received non-array or missing data for students list.")
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load students.');
      setStudents([]); // Clear students on error
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed for the function definition itself

  // Effect to fetch students when the selected school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchStudents(selectedSchool.schoolId);
    } else {
      // If no school is selected (e.g., user has access to none, or still loading)
      setStudents([]);
    }
  }, [selectedSchool, fetchStudents]); // Re-run when selectedSchool or fetchStudents changes

  // --- Event Handlers (Placeholders) ---
  const handleAddStudent = () => {
    // Navigate to the Add Student page (create this route/page later)
    // Need school context here too
    if(selectedSchool) {
        console.log("Navigate to Add Student page for school:", selectedSchool.schoolId);
        // navigate(`/schools/${selectedSchool.schoolId}/students/new`); // Example route
        navigate(`/students/new`); // Simpler route for now, pass schoolId via state or context
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

    const handleImportExcel = () => {
         if (!selectedSchool) {
            alert("Please select a school first.");
            return;
        }
        console.log("Trigger Import Excel for school:", selectedSchool.schoolId);
        alert("Import Excel functionality not yet implemented in UI.");
        // TODO: Implement file input handling and call POST /api/schools/{schoolId}/students/import
    };

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


    // --- Render Logic ---
    const renderContent = () => {
        if (loadingSchools) {
            return <p>Loading school information...</p>;
        }
        if (!selectedSchool) {
            return <p>Please select a school from the header to view students.</p>;
        }
        if (loading) {
            return <p>Loading students for {selectedSchool.name}...</p>;
        }
        if (error) {
            return <p style={{ color: 'red' }}>Error: {error}</p>;
        }
        if (students.length === 0) {
            return <p>No students found for {selectedSchool.name}.</p>;
        }

        // Display student table
        return (
            <table style={tableStyle}>
            <thead>
                <tr>
                {/* Adjust columns based on StudentSummaryDto */}
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
                    {/* Basic placeholder for photo - replace with actual <img> */}
                    {/* Need to construct full URL based on PhotoThumbnailPath and potentially base URL */}
                    {student.photoThumbnailPath ? (
                         // Assuming PhotoThumbnailPath is relative to the web root (e.g., uploads/...)
                         <img src={`/${student.photoThumbnailPath}`} alt={`${student.firstName} ${student.lastName}`} width="50" height="50" style={{objectFit: 'cover'}} />
                         // Or if it's a full URL: <img src={student.photoThumbnailPath} ... />
                    ) : (
                        <div style={{width: 50, height: 50, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em'}}>No Pic</div>
                    )}
                    </td>
                    <td style={thTdStyle}>{student.lastName}</td>
                    <td style={thTdStyle}>{student.firstName}</td>
                    <td style={thTdStyle}>{student.studentIdentifier || 'N/A'}</td>
                    <td style={thTdStyle}>{student.isActive ? 'Active' : 'Inactive'}</td>
                    <td style={thTdStyle}>
                    {/* Links/Buttons for actions */}
                    <Link to={`/students/${student.studentId}`}>View/Edit</Link>
                     {/* Placeholder for individual PDF download */}
                     {/* <button onClick={() => handleDownloadSinglePdf(student.studentId)}>ID Card</button> */}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        );
    };


  return (
    <div>
      <h2>Student List {selectedSchool ? ` - ${selectedSchool.name}` : ''}</h2>

      {/* Action Buttons */}
      {selectedSchool && ( // Only show buttons if a school is selected
          <div style={buttonContainerStyle}>
              <button onClick={handleAddStudent} disabled={loading}>Add Student</button>
              <button onClick={handleExportExcel} disabled={loading || students.length === 0}>Export to Excel</button>
              <button onClick={handleImportExcel} disabled={loading}>Import from Excel</button>
              <button onClick={handleDownloadBulkPdf} disabled={loading || students.length === 0}>Download Bulk ID Cards (PDF)</button>
          </div>
      )}


      {/* Render table or status messages */}
      {renderContent()}
    </div>
  );
}

export default StudentListPage;