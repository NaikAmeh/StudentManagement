// src/pages/students/StudentListPage.js
import jsPDF from "jspdf";
// import html2canvas from "html2canvas"; // Not used directly in the provided snippet for PDF creation
import React, {
  useEffect,
  useState,
  useCallback,//details
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Redux Selectors and Actions
import {
  selectSelectedSchoolId,
  selectSchoolLoading,
  selectSelectedSchool,
  fetchStandards, 
  fetchDivisions,
  selectAvailableStandards,
  selectAvailableDivisions
} from "../../store/slices/schoolSlice";
import {
  fetchStudentsBySchool,
  deleteStudent,
  uploadStudentPhoto,
  selectStudentList,
  selectStudentLoadingList,
  selectStudentErrorList,
  clearStudents,
  selectStudentLoadingDelete,
  selectStudentLoadingPhotoUpload,
  clearPhotoUploadError,
  selectStudentErrorPhotoUpload,
} from "../../store/slices/studentSlice";

// API Service
import api from "../../services/api"; // Keep for direct export/import/pdf calls
import { generateSelectedStudentsPdf } from '../../utils/pdfGenerator'; // Import the new utility

// Child Components
import LoadingIndicator from "../Shared/LoadingIndicator";
import ErrorMessage from "../Shared/ErrorMessage";
import ActionButtons from "../Shared/ActionButtons";
import ImportSection from "../Shared/ImportSection"; // Import if using
import ImportResultsDisplay from "../Shared/ImportResultDisplay";
import StudentImport from '../students/StudentImport'; // *** Import the new component ***
import StudentTable from "../students/StudentTable"; // Assuming this is a separate component for the table
import PaginationControls from "../Shared/PaginationControls";


// --- Styles ---
const listContainerStyle = { padding: "20px", maxWidth: '1200px', margin: '0 auto' };

// --- Main Student List Page Component ---
function StudentListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Redux State ---
  const selectedSchoolId = useSelector(selectSelectedSchoolId);
  const selectedSchool = useSelector(selectSelectedSchool);
  const loadingSchools = useSelector(selectSchoolLoading);
  const students = useSelector(selectStudentList);
  const loadingStudents = useSelector(selectStudentLoadingList);
  const studentFetchError = useSelector(selectStudentErrorList);
  const loadingDelete = useSelector(selectStudentLoadingDelete);
  const loadingPhotoUpload = useSelector(selectStudentLoadingPhotoUpload);
  const photoUploadError = useSelector(selectStudentErrorPhotoUpload);

  // --- Local State ---
  const [filters, setFilters] = useState({ fullName: "", studentIdentifier: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [stagedPhotos, setStagedPhotos] = useState({});
  const [uploadingStudentId, setUploadingStudentId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  //const [standardOptions, setStandardOptions] = useState([]);
  //const [divisionOptions, setDivisionOptions] = useState([]);


  // *** State to track if import component is busy ***
  const [isImportOperationUnderway, setIsImportOperationUnderway] = useState(false);

  // REMOVED Import specific state variables
  // REMOVED Import specific ref
  const standardOptions = useSelector(selectAvailableStandards) || [];
  const divisionOptions = useSelector(selectAvailableDivisions) || [];
debugger;
  const recordsPerPage = 2;

  // --- Data Fetching and Cleanup ---
  useEffect(() => {
    if (selectedSchoolId) {
      dispatch(fetchStudentsBySchool(selectedSchoolId));
      dispatch(fetchStandards());
      dispatch(fetchDivisions());
    } else {
      dispatch(clearStudents());
    }
    // Reset local state
    setFilters({ fullName: "", studentIdentifier: "" });
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
    setStagedPhotos({});
    setSelectedStudents([]);
    setIsGeneratingPdf(false);
    setIsImportOperationUnderway(false); // Reset import tracking state

  }, [selectedSchoolId, dispatch]);

  // Cleanup Blob URLs
  useEffect(() => {
    const previews = Object.values(stagedPhotos).map(p => p.preview);
    return () => {
      previews.forEach(preview => { if (preview) URL.revokeObjectURL(preview); });
    };
  }, [stagedPhotos]);

  // --- Memoized Data Processing ---
  const sortedAndFilteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    const filtered = students.filter((student) => {
      // Name filter
      const nameMatch = !filters.fullName || 
        student.fullName?.toLowerCase().includes(filters.fullName.toLowerCase());
      
      // Student ID filter
      const idMatch = !filters.studentIdentifier || 
        student.studentIdentifier?.toLowerCase().includes(filters.studentIdentifier.toLowerCase());
      
      // Standard filter - compare as numbers
      const standardMatch = !filters.standard || 
        student.standardId?.toString() === filters.standard?.toString();
      
      // Division filter - compare as numbers
      const divisionMatch = !filters.division || 
        student.divisionId?.toString() === filters.division?.toString();
      
      return nameMatch && idMatch && standardMatch && divisionMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [students, filters, sortConfig]);

  const totalFilteredCount = sortedAndFilteredStudents.length;
  const totalPages = Math.ceil(totalFilteredCount / recordsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return sortedAndFilteredStudents.slice(startIndex, startIndex + recordsPerPage);
  }, [sortedAndFilteredStudents, currentPage, recordsPerPage]);

  // --- Callback Handlers (Non-Import) ---
  const handleFilterChange = useCallback((e) => {
    debugger;
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
    setSelectedStudents([]);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
     setCurrentPage(1);
     setSelectedStudents([]);
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleSelectStudent = useCallback((studentId, isChecked) => {
    setSelectedStudents((prev) =>
      isChecked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
    );
  }, []);

  const handleSelectAll = useCallback((isChecked) => {//select all should be all students on the current page
    if (isChecked) {
      setSelectedStudents(sortedAndFilteredStudents.map((student) => student.studentId));
    } else {
      setSelectedStudents([]);
    }
  }, [sortedAndFilteredStudents]);

  const handleDropPhoto = useCallback((acceptedFiles, studentId) => {
      dispatch(clearPhotoUploadError());
      const file = acceptedFiles[0];
      if (!file) return;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
          alert(`Invalid file for student ${studentId}: Must be an image (JPEG, PNG, GIF, WEBP) under 5MB.`);
          return;
      }
      setStagedPhotos((prev) => {
          const oldPreview = prev[studentId]?.preview;
          if (oldPreview) URL.revokeObjectURL(oldPreview);
          return { ...prev, [studentId]: { file: file, preview: URL.createObjectURL(file) } };
      });
  }, [dispatch]);
  
  // useEffect(() => {
  //   if (selectedSchoolId) {
  //     dispatch(fetchStudentsBySchool(selectedSchoolId)); // Fetch the latest data
  //   } else {
  //     dispatch(clearStudents());
  //   }
  // }, [selectedSchoolId, dispatch]);

  const handleSaveAllPhotos = useCallback(async () => {
    const photosToUpload = Object.entries(stagedPhotos);
    if (photosToUpload.length === 0) { alert("No new photos selected."); return; }
    const uploadCount = photosToUpload.length;
    alert(`Uploading ${uploadCount} photos...`);
    const results = await Promise.allSettled(
        photosToUpload.map(([studentIdStr, photoData]) => {
            const studentId = parseInt(studentIdStr, 10);
            setUploadingStudentId(studentId);
            return dispatch(uploadStudentPhoto({ studentId, file: photoData.file }))
                .unwrap()
                .then((result) => ({ studentId, status: 'fulfilled', data: result }))
                .catch((error) => ({ studentId, status: 'rejected', error: error?.message || error || "Unknown upload error" }))
                .finally(() => setUploadingStudentId((curr) => curr === studentId ? null : curr));
        })
    );
    const successfulUploads = results.filter(r => r.status === 'fulfilled' && r.value.status === 'fulfilled');
    const failedUploads = results.filter(r => r.status === 'rejected' || r.value.status === 'rejected');
    let resultMessage = `Upload complete. ${successfulUploads.length} succeeded.`;
    if (failedUploads.length > 0) {
        resultMessage += ` ${failedUploads.length} failed.`;
        console.error("Failed uploads:", failedUploads.map(f => ({ id: f.value?.studentId, reason: f.reason || f.value?.error })));
        const successfulIds = new Set(successfulUploads.map(s => s.value.studentId));
        setStagedPhotos(prev => {
            const nextStaged = {...prev};
            successfulIds.forEach(id => { if (nextStaged[id]?.preview) URL.revokeObjectURL(nextStaged[id].preview); delete nextStaged[id]; });
            return nextStaged;
        });
        resultMessage += " Failed photos remain staged.";
    } 
    
    // Refetch the updated student list if there are successful uploads
  if (successfulUploads.length > 0) {
    await dispatch(fetchStudentsBySchool(selectedSchoolId)); // Refetch the updated student list
    setStagedPhotos({}); // Clear staged photos after successful upload
  }

    alert(resultMessage);
  }, [dispatch, stagedPhotos, selectedSchoolId]);

  const handleAddStudent = useCallback(() => {
    if (selectedSchoolId) navigate(`/students/new`, { state: { schoolId: selectedSchoolId } });
    else alert("Please select a school first.");
  }, [navigate, selectedSchoolId]);

  const downloadBlob = (blob, defaultFilename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", defaultFilename);
    document.body.appendChild(link);
    link.click(); link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = useCallback(async () => {
    if (!selectedSchoolId) return alert("Please select a school.");
    if (totalFilteredCount === 0) return alert("No filtered students to export.");
    console.log("Exporting Excel for school:", selectedSchoolId);
    try {
      const response = await api.get(`/api/schools/${selectedSchoolId}/students/export`, { responseType: "blob" });
      downloadBlob(response.data, `students_school_${selectedSchoolId}.xlsx`);
    } catch (err) { console.error("Excel Export Failed:", err); alert("Failed to export Excel."); }
  }, [selectedSchoolId, totalFilteredCount]);

  const handleDownloadBulkPdf = useCallback(async () => {
    if (!selectedSchoolId) return alert("Please select a school.");
    if (!students || students.length === 0) return alert("No students found.");
    console.log("Downloading Bulk PDF for school:", selectedSchoolId);
    try {
      const response = await api.get(`/api/schools/${selectedSchoolId}/students/idcards/bulk`, { responseType: "blob" });
       if (response.status === 204 || response.data.size === 0) { alert("No student data."); return; }
      downloadBlob(response.data, `idcards_bulk_school_${selectedSchoolId}.pdf`);
    } catch (err) { console.error("Bulk PDF Failed:", err); alert("Failed to download bulk PDF."); }
  }, [selectedSchoolId, students]);

  const handleDownloadSinglePdf = useCallback(async (studentId) => {
    console.log(`Downloading single PDF for student ${studentId}`);
    try {
      const response = await api.get(`/api/students/${studentId}/idcard`, { responseType: "blob" });
       if (response.status === 204 || response.data.size === 0) { alert(`No data for student ${studentId}.`); return; }
      downloadBlob(response.data, `idcard_student_${studentId}.pdf`);
    } catch (err) { console.error(`Single PDF Failed for ${studentId}:`, err); alert(`Failed ID download.`); }
  }, []);

  const handleDownloadSelectedPdf = useCallback(async () => {
    if (selectedStudents.length === 0) { alert("No students selected."); return; }
    const selectedStudentDetails = students.filter((student) => selectedStudents.includes(student.studentId));
    if (selectedStudentDetails.length === 0) { alert("Selected student details not found."); return; }
    setIsGeneratingPdf(true);
    alert(`Generating ID cards for ${selectedStudentDetails.length} selected students...`);
    try {
      await generateSelectedStudentsPdf(selectedStudentDetails, selectedSchool);
    } catch (error) { console.error("Error during PDF generation process:", error); alert(`PDF generation error: ${error.message}.`);
    } finally { setIsGeneratingPdf(false); }
  }, [selectedStudents, students, selectedSchool]);

  const handleDownloadAllIdsPdf = useCallback(async () => {
    console.log("Downloading ID cards for all students in the list...");
    if (!students || students.length === 0) {
      alert("No students found to generate ID cards.");
      return;
    }
  
    setIsGeneratingPdf(true); // Indicate that the PDF generation is in progress
    alert(`Generating ID cards for all ${students.length} students...`);
  
    try {
      // Use the same utility function to generate the PDF for all students
      await generateSelectedStudentsPdf(students, selectedSchool);
      alert("ID cards for all students have been successfully generated.");
    } catch (error) {
      console.error("Error during PDF generation for all students:", error);
      alert(`Failed to generate ID cards: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false); // Reset the loading state
    }
  }, [students, selectedSchool]);

  const handleDeleteStudent = useCallback((studentId, studentName) => {
      if (window.confirm(`Delete ${studentName} (ID: ${studentId})?`)) {
        setDeletingId(studentId);
        dispatch(deleteStudent(studentId))
          .unwrap()
          .then(() => { alert(`Student ${studentName} deleted.`); setSelectedStudents(prev => prev.filter(id => id !== studentId)); })
          .catch((err) => alert(`Failed to delete: ${err?.message || "Unknown error"}`))
          .finally(() => setDeletingId(null));
      }
    }, [dispatch]);

  // --- *** Callbacks for StudentImport Component *** ---
  const handleImportStarted = useCallback(() => {
    console.log("StudentListPage: Import started notification received.");
    setIsImportOperationUnderway(true); // Set state to track import progress
  }, []);

  const handleImportCompleted = useCallback(({ success, results, error }) => {
    console.log("StudentListPage: Import completed notification received.", { success, error });
    setIsImportOperationUnderway(false); // Clear import progress state

    // Determine if any rows were actually successfully imported from detailed results
    const successCount = results?.filter(r => r.success && r.rowNumber > 0).length ?? 0;

    // Refresh the main student list if the import operation was successful overall
    // AND at least one student row was successfully processed and added.
    if (success && successCount > 0) {
      console.log(`StudentListPage: Import successful with ${successCount} records, refreshing student list.`);
      // Optional: Provide summary feedback to the user at the page level
      alert(`Import process finished. ${successCount} student(s) were imported successfully. Check the results section below for row-by-row details.`);
      dispatch(fetchStudentsBySchool(selectedSchoolId)); // Dispatch action to get updated list
      setSelectedStudents([]); // Clear any table selections as the list content has changed
    } else if (!success && error) {
        // Handle general failure (e.g., network error, file format error reported by backend)
        console.log("StudentListPage: Import failed with general error:", error);
        // The StudentImport component shows the specific error, but you could add page-level feedback if needed.
        // alert(`Import failed: ${error}`);
    } else {
        // Handle cases where the API call was successful, but no *new* students were added (e.g., all rows had errors or were duplicates)
        console.log("StudentListPage: Import finished, but no new students are added.");
        // The StudentImport component shows the row-by-row results.
        // You might provide a generic message here too.
        alert("Import process finished. Please check the results section below for details on each row.");
    }

  }, [dispatch, selectedSchoolId]); // Dependencies needed for the callback logic

  // --- Aggregate Loading State ---
  // Use the new tracking state for import operation
  const isOverallLoading = loadingStudents || loadingDelete || isImportOperationUnderway || loadingPhotoUpload || loadingSchools || isGeneratingPdf;

  // useEffect(() => {
  //   // Fetch Standard options
  //   const fetchStandards = async () => {
  //     try {
  //       const response = await api.get("/api/standards");
  //       setStandardOptions(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch standards:", error);
  //     }
  //   };

  //   // Fetch Division options
  //   const fetchDivisions = async () => {
  //     try {
  //       const response = await api.get("/api/divisions");
  //       setDivisionOptions(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch divisions:", error);
  //     }
  //   };

  //   fetchStandards();
  //   fetchDivisions();
  // }, []);

  // --- Render Logic ---
  return (
    <div style={listContainerStyle}>
      <h2>Student List {selectedSchool ? `- ${selectedSchool.name}` : ""}</h2>

      {/* Display general fetch error for the student list */}
      <ErrorMessage message={studentFetchError} />

      {/* Render Action Buttons */}
      {selectedSchoolId && (
        <ActionButtons
          onAddStudent={handleAddStudent}
          onExportExcel={handleExportExcel}
          onDownloadBulkPdf={handleDownloadBulkPdf}
          onDownloadSelectedPdf={handleDownloadSelectedPdf}
          onDownloadAllIdsPdf={handleDownloadAllIdsPdf} // Add this new action
          onSaveAllPhotos={handleSaveAllPhotos}
          stagedPhotosCount={Object.keys(stagedPhotos).length}
          selectedStudentsCount={selectedStudents.length}
          canExport={totalFilteredCount > 0}
          canDownloadBulk={students && students.length > 0}
          isLoading={isOverallLoading} // Use updated loading state
        />
      )}

      {/* --- *** Render StudentImport Component *** --- */}
      {/* Conditionally render the import component if a school is selected */}
      {selectedSchoolId && (
        <StudentImport
          selectedSchoolId={selectedSchoolId}
          onImportStart={handleImportStarted}     // Callback when import begins
          onImportComplete={handleImportCompleted} // Callback when import finishes
          // Disable the import component if any major page operation is underway
          disabled={isOverallLoading}
        />
      )}

       {/* Display only non-import related errors here (e.g., photo upload) */}
       <ErrorMessage message={photoUploadError ? `Last Photo Upload Error: ${photoUploadError}` : null} />

       {/* ImportResultsDisplay and import specific ErrorMessage are now INSIDE StudentImport */}

      {/* Content Area: Loading Indicator or Table + Pagination */}
      {loadingSchools ? ( <LoadingIndicator message="Loading school info..." /> )
       : !selectedSchoolId ? ( <p style={{ textAlign: 'center', marginTop: '20px' }}>Please select a school.</p> )
       : loadingStudents && students?.length === 0 ? ( <LoadingIndicator message="Loading students..." /> )
       : studentFetchError && students?.length === 0 ? ( <div/> /* Error already shown above */ )
       : (
          <>
              {/* Render the main student table */}
              <StudentTable
                  students={paginatedStudents}
                  filters={filters}
                  sortConfig={sortConfig}
                  selectedStudents={selectedStudents}
                  stagedPhotos={stagedPhotos}
                  uploadingStudentId={uploadingStudentId}
                  deletingId={deletingId}
                  loadingDelete={loadingDelete}
                  totalFilteredCount={totalFilteredCount}
                  onFilterChange={handleFilterChange}
                  onSort={handleSort}
                  onSelectStudent={handleSelectStudent}
                  onSelectAll={handleSelectAll}
                  onDropPhoto={handleDropPhoto}
                  onDownloadSinglePdf={handleDownloadSinglePdf}
                  onDeleteStudent={handleDeleteStudent}
                  standardOptions={standardOptions}
                  divisionOptions={divisionOptions}
              />
              {/* Render pagination controls */}
              <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
              />
          </>
      )}
    </div>
  );
}

export default StudentListPage;