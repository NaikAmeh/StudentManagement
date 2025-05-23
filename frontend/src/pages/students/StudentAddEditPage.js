// src/pages/students/StudentAddEditPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DatePickerWithIcon from "../Shared/DatePickerWithIcon";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentDetails,
  addStudent,
  updateStudent,
  uploadStudentPhoto,
  selectCurrentStudent,
  selectStudentLoadingDetails,
  selectStudentErrorDetails,
  selectStudentLoadingSubmit,
  selectStudentErrorSubmit,
  selectStudentLoadingPhotoUpload,
  selectStudentErrorPhotoUpload,
  clearCurrentStudent,
  clearSubmitError,
  clearPhotoUploadError,
  setCurrentStudentPhotoPath,
} from "../../store/slices/studentSlice";
//import { selectSelectedSchoolId } from "../../store/slices/schoolSlice";
import { selectSelectedSchoolId, selectSelectedSchool } from '../../store/slices/schoolSlice';
import api from '../../services/api'; // For fetching common data

// --- Styles ---
const formContainerStyle = {
  maxWidth: "600px",
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};
const formGroupStyle = { marginBottom: "15px" };
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "3px",
};
const errorStyle = { color: "#dc3545", marginTop: "5px", fontSize: "0.9em" }; // Use Bootstrap danger color
const buttonStyle = {
  padding: "10px 15px",
  marginRight: "10px",
  cursor: "pointer",
  borderRadius: "3px",
  border: "none",
};
const submitButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#0d6efd",
  color: "white",
}; // Bootstrap primary blue
const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  color: "white",
}; // Bootstrap secondary gray
const fileInputContainerStyle = {
  marginTop: "20px",
  padding: "15px",
  border: "1px dashed #adb5bd",
  borderRadius: "5px",
  backgroundColor: "#f8f9fa",
}; // Light background
const currentPhotoStyle = {
  maxWidth: "150px",
  maxHeight: "150px",
  margin: "10px 0",
  display: "block",
  border: "1px solid #dee2e6",
  borderRadius: "4px",
};
const previewStyle = {
  maxWidth: "150px",
  maxHeight: "150px",
  margin: "10px 0",
  display: "block",
  border: "1px dotted #0d6efd",
};
const photoErrorStyle = { ...errorStyle, marginTop: "10px" }; // Specific style if needed
const inputErrorStyle = { ...inputStyle, borderColor: '#dc3545', outlineColor: '#dc3545' }; // Red outline for errors
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }; // For two-column layout

function StudentAddEditPage({ mode = "add" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // --- Redux State ---
  const currentStudent = useSelector(selectCurrentStudent);
  const loadingDetails = useSelector(selectStudentLoadingDetails);
  const errorDetails = useSelector(selectStudentErrorDetails);
  const loadingSubmit = useSelector(selectStudentLoadingSubmit);
  const submitError = useSelector(selectStudentErrorSubmit); // This will hold backend validation errors
  const loadingPhotoUpload = useSelector(selectStudentLoadingPhotoUpload);
  const photoUploadError = useSelector(selectStudentErrorPhotoUpload);
  const selectedSchoolIdFromContext = useSelector(selectSelectedSchoolId);
  
  const selectedSchool = useSelector(selectSelectedSchool); // Get full school object
console.log("Selected School from context:", selectedSchool);
  // --- Local Form State ---
  const initialFormData = {
    fullName: '', dateOfBirth: '', gender: '', email: '', phoneNo: '', address: '',
    enrollmentDate: '', standard: '', division: '', rollNo: '', studentIdentifier: '',
    isActive: true, schoolId: ''
};
const [formData, setFormData] = useState(initialFormData);
  // const [formData, setFormData] = useState({
  //   firstName: "",
  //   lastName: "",
  //   dateOfBirth: "",
  //   studentIdentifier: "",
  //   isActive: true,
  //   schoolId: "",
  // });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null); // Holds the File object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null); // For image preview
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  const [pageError, setPageError] = useState(""); // General page errors
  
  const [loadingMasters, setLoadingMasters] = useState(false);
  
  const [standards, setStandards] = useState([]); // For dropdown
  const [divisions, setDivisions] = useState([]); // For dropdown

   // --- Local Validation State ---
   const [formErrors, setFormErrors] = useState({}); // { fieldName: "Error message" }
   const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // --- Effects ---

  // Fetch Master Data (Standards, Divisions) based on selected school
  useEffect(() => {
    const schoolIdForMasters =  selectedSchool?.schoolId;
console.log("Selected School ID for Masters:", schoolIdForMasters);

    const fetchMasters = async (schoolIdForMasters) => {
        if (!schoolIdForMasters) {
          console.log("No school ID provided for fetching masters.");
            setStandards([]); setDivisions([]); return;
        }
        setLoadingMasters(true);
        try {
          console.log("Fetching standards/divisions for school ID:", schoolIdForMasters);
            const [standardsRes, divisionsRes] = await Promise.all([
                api.get(`/api/commondata/standards?schoolId=${schoolIdForMasters}`),
                api.get(`/api/commondata/divisions?schoolId=${schoolIdForMasters}`)
            ]);
            setStandards(standardsRes.data || []);
            setDivisions(divisionsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch standards/divisions", err);
            setPageError("Could not load standard/division options.");
        } finally {
            setLoadingMasters(false);
        }
    };

    const schoolIdToFetchFor = isEditMode ? currentStudent?.schoolId : selectedSchool?.schoolId;
    if (schoolIdToFetchFor) {
        fetchMasters(schoolIdToFetchFor);
    } else if (!isEditMode && selectedSchool) { // For Add mode, use context school
        fetchMasters(selectedSchool.schoolId);
    } else if (!isEditMode && !selectedSchool) {
        // If in add mode and no school selected from context, clear or handle
        setStandards([]); setDivisions([]);
        console.warn("Add Student: No school selected in context to fetch masters.");
    }

}, [isEditMode, currentStudent?.schoolId, selectedSchool]); // Re-fetch if school context changes in add mode

  // Effect for mode change / Initial Load / Fetch Details
  useEffect(() => {
    setIsEditMode(mode === "edit");
    dispatch(clearSubmitError());
    dispatch(clearPhotoUploadError());
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(null);
    setFormErrors({}); setHasAttemptedSubmit(false);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input visually

    if (mode === "edit" && id) {
      dispatch(fetchStudentDetails(parseInt(id, 10)));
    } else {
      // In add mode, clear any potentially loaded student details
      dispatch(clearCurrentStudent());
      // Set default schoolId from context or location state if passed
      const defaultSchoolId = location.state?.schoolId || selectedSchool?.schoolId;
      setFormData((prev) => ({
        ...initialFormData, // Reset all fields
        schoolId: defaultSchoolId || '',
        isActive: true // Ensure default
      }));
    }

    // Cleanup function
    return () => {
      dispatch(clearCurrentStudent());
      dispatch(clearSubmitError());
      dispatch(clearPhotoUploadError());
    };
  }, [mode, id, dispatch, selectedSchool, location.state]); // Dependencies

  // Effect to populate form when currentStudent data arrives (edit mode)
  useEffect(() => {
    if (isEditMode && currentStudent) {
      setFormData({
        fullName: currentStudent.fullName || '',
        dateOfBirth: currentStudent.dateOfBirth ? new Date(currentStudent.dateOfBirth).toISOString().split('T')[0] : '',
        gender: currentStudent.gender || '',
        email: currentStudent.email || '',
        phoneNo: currentStudent.phoneNo || '',
        address: currentStudent.address || '',
        enrollmentDate: currentStudent.enrollmentDate ? new Date(currentStudent.enrollmentDate).toISOString().split('T')[0] : '',
        standard: currentStudent.standard || '', // Should match value in standards list
        division: currentStudent.division || '', // Should match value in divisions list
        rollNo: currentStudent.rollNo?.toString() || '', // Ensure string for input
        studentIdentifier: currentStudent.studentIdentifier || '',
        isActive: currentStudent.isActive ?? true,
        schoolId: currentStudent.schoolId // This is primarily for context, not directly editable
      });
      setPhotoPreviewUrl(null); // Clear preview when loading existing data
      setSelectedPhotoFile(null); // Clear selected file
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input visually
    }
  }, [currentStudent, isEditMode]);

  // Effect to handle Page Errors (e.g., failed details fetch)
  useEffect(() => {
    setPageError(
      errorDetails ? `Error loading student details: ${errorDetails}` : ""
    );
  }, [errorDetails]);

  // Effect for Photo Preview URL Management
  useEffect(() => {
    if (!selectedPhotoFile) {
      setPhotoPreviewUrl(null);
      return; // Exit if no file
    }
    // Create URL
    const objectUrl = URL.createObjectURL(selectedPhotoFile);
    setPhotoPreviewUrl(objectUrl);

    // Cleanup function to free memory
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhotoFile]);

  // --- Client-Side Validation Logic ---
  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
        case 'fullName':
            if (!value) error = 'Full Name is required.';
            else if (value.length > 100) error = 'Full Name max 100 chars.';
            break;
        case 'standard':
            if (!value) error = 'Standard is required.';
            break;
        case 'division':
            if (!value) error = 'Division is required.';
            break;
        case 'rollNo':
            if (!value) error = 'Roll No. is required.';
            else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Roll No. must be a positive number.';
            break;
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format.';
            break;
        // Add more field validations (gender, phoneNo, etc.)
        default: break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error; // Return true if valid
}, []);

const validateForm = useCallback(() => {
  let allValid = true;
  const newErrors = {};
  Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) { // Call validateField for each
          allValid = false;
          // Ensure error message is captured if validateField doesn't set it immediately for all cases
          if (!newErrors[key] && formErrors[key]) newErrors[key] = formErrors[key];
      }
  });
   // After individual checks, update formErrors state at once if needed
   setFormErrors(prev => ({...prev, ...newErrors}));
  return allValid;
}, [formData, validateField, formErrors]); // Add formErrors to dependencies

 // Re-validate on field change IF submit has been attempted
 useEffect(() => {
  if (hasAttemptedSubmit) {
      validateForm();
  }
}, [formData, hasAttemptedSubmit, validateForm]);
  // --- Event Handlers ---

  // Handles changes in text inputs, date, checkbox
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      // setFormData((prev) => ({
      //   ...prev,
      //   [name]: type === "checkbox" ? checked : value,
      // }));
      const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
      // Clear errors when user starts typing again
      if (submitError) dispatch(clearSubmitError());
      if (photoUploadError) dispatch(clearPhotoUploadError());
      if (hasAttemptedSubmit) { // Validate on change only after first submit attempt
        validateField(name, val);
    }
    },
    [dispatch, submitError, photoUploadError, hasAttemptedSubmit, validateField]
  );

  // Handles the file input change for photo selection
  const handlePhotoFileChange = useCallback(
    (event) => {
      dispatch(clearPhotoUploadError()); // Clear previous redux photo errors first
      const file = event.target.files[0];
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file) {
        let error = null;
        // Client-side validation
        if (!allowedTypes.includes(file.type)) {
          error = `Invalid file type. Allowed: ${allowedTypes.join(", ")}`;
        } else if (file.size > maxSize) {
          error = `File too large. Max ${maxSize / 1024 / 1024}MB.`;
        }

        if (error) {
          // Set the error state in Redux for display
          dispatch(uploadStudentPhoto.rejected(error)); // Use the rejected action type pattern
          setSelectedPhotoFile(null); // Clear the local file state
          if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the actual input element
        } else {
          setSelectedPhotoFile(file); // Store the valid File object in local state
          // Any previous error is cleared by the dispatch at the start of the handler
        }
      } else {
        setSelectedPhotoFile(null); // Clear local state if no file selected
      }
    },
    [dispatch]
  ); // Dependency for useCallback

  // Handles the main form submission (Add or Edit)
  const handleSubmit = useCallback(
    async (e) => {
      debugger;
      console.log("Save button clicked");
      e.preventDefault();
      setHasAttemptedSubmit(true); 
      dispatch(clearSubmitError());
      dispatch(clearPhotoUploadError());

      if (!validateForm()) { // Perform full form validation
        alert("Please correct the highlighted errors.");
        return;
    }

      let studentIdToUse = isEditMode ? parseInt(id, 10) : null;
      let isNewStudent = false;
      let success = false;

      const dtoData = {
        ...formData,
        rollNo: parseInt(formData.rollNo, 10),
        dateOfBirth: formData.dateOfBirth || null,
        enrollmentDate: formData.enrollmentDate || null,
    };

      // Disable button during operation (handled by isLoading state check on button)
      console.log("Form submit initiated...");

      try {
        // Step 1: Save/Update Student Data (text fields etc.)
        // const formattedDateOfBirth = formData.dateOfBirth
        //   ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
        //   : null;

        if (isEditMode && studentIdToUse) {
          const updateDto = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formattedDateOfBirth,
            studentIdentifier: formData.studentIdentifier || null,
            isActive: formData.isActive,
          };
          console.log(
            `Dispatching updateStudent for ID: ${studentIdToUse}`,
            updateDto
          );
          await dispatch(
            updateStudent({ id: studentIdToUse, updateStudentDto: updateDto })
          ).unwrap();const { schoolId, ...updateDtoFields } = dtoData; // Exclude schoolId from UpdateStudentDto
          await dispatch(updateStudent({ id: studentIdToUse, updateStudentDto: updateDtoFields })).unwrap();
          console.log("Update student data successful.");
        } else {
          // Add mode
          if (!dtoData.schoolId) {
            setFormErrors(prev => ({...prev, schoolId: "School ID is missing. Select school from header."}));
            throw new Error("School ID is missing.");
          }
          const createdStudent = await dispatch(addStudent(dtoData)).unwrap();
          studentIdToUse = createdStudent?.studentId;
          if (!studentIdToUse) throw new Error("Failed to get new student ID.");
        }

        // Step 2: Upload Photo if selected AND we have a valid studentId
        if (selectedPhotoFile && studentIdToUse) {
          console.log(
            `Proceeding to upload photo for student ID: ${studentIdToUse}`
          );
          await dispatch(
            uploadStudentPhoto({
              studentId: studentIdToUse,
              file: selectedPhotoFile,
            })
          ).unwrap();
          console.log("Photo upload successful.");
          // Clear file state after successful upload as part of submit flow
          setSelectedPhotoFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else if (selectedPhotoFile && !studentIdToUse) {
          // Should not happen if logic above is correct, but safeguard
          console.warn(
            "Photo was selected, but student ID is invalid. Photo not uploaded."
          );
        }

        success = true; // If we reach here without exceptions, mark as success
      } catch (error) {
        console.error("Error during student save/upload:", error);
        success = false;
        // Errors are set in Redux state by rejected thunks (submitError or photoUploadError)
        // The component will re-render and display them via useSelector.
      }

      // Step 3: Navigate on overall success
      if (success) {
        alert(`Student successfully ${isNewStudent ? "added" : "updated"}!`);
        navigate("/students"); // Navigate back to list
      }
      // If not successful, errors should be displayed via Redux state selectors
    },
    [dispatch, formData, id, isEditMode, mode, navigate, selectedPhotoFile, validateForm, submitError, photoUploadError]
  ); // Dependencies for useCallback

  // Handles navigation back to the list page
  const handleCancel = useCallback(() => navigate("/students"), [navigate]);

  // --- Render Logic ---
  const isLoading = loadingDetails || loadingSubmit || loadingPhotoUpload; // Combined loading state

  // Display loading indicator while fetching details in Edit mode
  if (loadingDetails && isEditMode) {
    return <div>Loading student details...</div>;
  }

  // Display error if fetching details failed
  if (pageError) {
    return <div style={errorStyle}>{pageError}</div>;
  }

  // Display message if in edit mode but student data hasn't loaded yet (and not actively loading)
  // This might indicate an invalid ID or the fetch completed with no data
  if (isEditMode && !currentStudent && !loadingDetails) {
    return (
      <div style={errorStyle}>
        Error: Student data not available. It might have been deleted or the ID
        is incorrect.
      </div>
    );
  }

  const getInputClass = (fieldName) => {
    return hasAttemptedSubmit && formErrors[fieldName] ? inputErrorStyle : inputStyle;
};

  // --- Main Form Render ---
  return (
    <div style={formContainerStyle}>
      <h2>
        {isEditMode
          ? `Edit Student - ${formData.firstName} ${formData.lastName}`
          : "Add New Student"}
      </h2>

 {pageError && <p style={errorStyle}>{pageError}</p>}

      <form onSubmit={handleSubmit}>
        {/* --- Form Fields --- */}
        {/*<div style={gridStyle}>  Two-column layout for form fields */}
        <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="fullName">Full Name:</label>
                        <input style={getInputClass('fullName')} type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled={isLoading} />
                        {hasAttemptedSubmit && formErrors.fullName && <small style={errorStyle}>{formErrors.fullName}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="dateOfBirth">Date of Birth:</label>
                        <input style={getInputClass('dateOfBirth')} type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={isLoading} />
                         {hasAttemptedSubmit && formErrors.dateOfBirth && <small style={errorStyle}>{formErrors.dateOfBirth}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="gender">Gender:</label>
                        <select style={getInputClass('gender')} id="gender" name="gender" value={formData.gender} onChange={handleChange} disabled={isLoading}>
                            <option value="">-- Select --</option> <option value="M">Male</option> <option value="F">Female</option> <option value="O">Other</option>
                        </select>
                         {hasAttemptedSubmit && formErrors.gender && <small style={errorStyle}>{formErrors.gender}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="email">Email:</label>
                        <input style={getInputClass('email')} type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
                         {hasAttemptedSubmit && formErrors.email && <small style={errorStyle}>{formErrors.email}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="phoneNo">Phone No:</label>
                        <input style={getInputClass('phoneNo')} type="tel" id="phoneNo" name="phoneNo" value={formData.phoneNo} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="address">Address:</label>
                        <input style={getInputClass('address')} type="text" id="address" name="address" value={formData.address} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="enrollmentDate">Enrollment Date:</label>
                        <input style={getInputClass('enrollmentDate')} type="date" id="enrollmentDate" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="standard">Standard/Class:</label>
                        <select style={getInputClass('standard')} id="standard" name="standard" value={formData.standard} onChange={handleChange} disabled={isLoading || loadingMasters}>
                            <option value="">-- Select Standard --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {standards.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                         {hasAttemptedSubmit && formErrors.standard && <small style={errorStyle}>{formErrors.standard}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="division">Division:</label>
                        <select style={getInputClass('division')} id="division" name="division" value={formData.division} onChange={handleChange} disabled={isLoading || loadingMasters}>
                            <option value="">-- Select Division --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {divisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                         {hasAttemptedSubmit && formErrors.division && <small style={errorStyle}>{formErrors.division}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="rollNo">Roll No:</label>
                        <input style={getInputClass('rollNo')} type="number" id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} disabled={isLoading} />
                         {hasAttemptedSubmit && formErrors.rollNo && <small style={errorStyle}>{formErrors.rollNo}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="studentIdentifier">Registration ID (School Specific):</label>
                        <input style={getInputClass('studentIdentifier')} type="text" id="studentIdentifier" name="studentIdentifier" value={formData.studentIdentifier} onChange={handleChange} disabled={isLoading} />
                    </div>
                    {isEditMode && (
          <div style={formGroupStyle}>
            <label htmlFor="isActive" style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={isLoading}
              />{" "}
              Active
            </label>
          </div>
        )}
         {/* <div style={formGroupStyle}>
                     <label style={labelStyle}>School:</label>
                     <input style={inputStyle} type="text" value={selectedSchool?.name || (isEditMode ? currentStudent?.schoolName : 'Select school in header')} disabled />
                     {!isEditMode && !formData.schoolId && <small style={errorStyle}>School ID is required. Select from header.</small>}
                 </div> */}
        {/* <div style={formGroupStyle}>
                     <label style={labelStyle}>School ID:</label>
                     <input style={inputStyle} type="text" value={isEditMode ? currentStudent?.schoolId : formData.schoolId} disabled />
                     {!isEditMode && !formData.schoolId && <span style={{fontSize: '0.8em', color: 'orange'}}> (Select a school in the header first)</span>}
                 </div> */}

        {/* --- Photo Section --- */}
        <div style={fileInputContainerStyle}>
          <h4>{isEditMode ? "Update" : "Add"} Student Photo</h4>

          {/* Display current photo in Edit mode if available and no new preview */}
          {isEditMode && currentStudent?.photoPath && !photoPreviewUrl && (
            <div>
              <label style={labelStyle}>Current Photo:</label>
              <img
                src={`/${currentStudent.photoPath}`}
                alt="Current"
                style={currentPhotoStyle}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Display photo preview if a new file is selected */}
          {photoPreviewUrl && (
            <div>
              <label style={labelStyle}>New Photo Preview:</label>
              <img src={photoPreviewUrl} alt="Preview" style={previewStyle} />
            </div>
          )}

          {/* File Input */}
          <div style={formGroupStyle}>
            <label htmlFor="photoFile" style={labelStyle}>
              Select Photo (Max 5MB, JPG/PNG/GIF/WEBP):
            </label>
            <input
              style={inputStyle}
              type="file"
              id="photoFile"
              accept="image/jpeg, image/png, image/gif, image/webp" // Be specific
              onChange={handlePhotoFileChange}
              ref={fileInputRef} // Ref to help clear it
              disabled={isLoading} // Disable during any loading operation
            />
          </div>

          {/* Display photo upload specific errors from Redux */}
          {photoUploadError && (
            <p style={photoErrorStyle}>Photo Error: {photoUploadError}</p>
          )}
          {/* Indicate photo upload progress */}
          {loadingPhotoUpload && <p>Uploading photo...</p>}
        </div>
        {/* --- End Photo Section --- */}

        {/* --- Submit Errors & Buttons --- */}
        {/* Display general submit errors from Redux */}
        {submitError && (
          <div style={errorStyle}>
            <h4>Save Failed:</h4>
            {typeof submitError === "object" && submitError.message ? (
              <p>{submitError.message}</p>
            ) : typeof submitError === "string" ? (
              <p>{submitError}</p>
            ) : (
              <p>An unknown error occurred.</p>
            )}
            {typeof submitError === "object" && submitError.errors && (
              <ul>
                {Object.entries(submitError.errors).map(([field, errors]) => (
                  <li key={field}>
                    {field}:{" "}
                    {Array.isArray(errors) ? errors.join(", ") : errors}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            // Disable if loading OR if in Add mode and no school is selected
            //disabled={isLoading || (!isEditMode)}//&& !formData.schoolId
            style={submitButtonStyle}
          >
            {/* Show specific loading state */}
            {loadingSubmit
              ? "Saving Data..."
              : loadingPhotoUpload
              ? "Uploading Photo..."
              : isEditMode
              ? "Update Student"
              : "Add Student"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentAddEditPage;
