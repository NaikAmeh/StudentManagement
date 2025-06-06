// src/pages/students/StudentAddEditPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DatePickerWithIcon from "../Shared/DatePickerWithIcon";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import CustomDatePicker from "../Shared/CustomDatePicker";
import { useSelector, useDispatch } from "react-redux";
import { format, parse } from "date-fns"; // For date formatting and parsing
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
import { selectSelectedSchoolId, selectSelectedSchool } from '../../store/slices/schoolSlice';
import api from '../../services/api'; // For fetching common data
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FIELD_LENGTHS, VALIDATION_MESSAGES } from '../../utils/validationConstants';

const API_IMAGE_URL = import.meta.env.VITE_API_BASEIMAGE_URL;

// --- Styles ---
const formContainerStyle = {
  //maxWidth: "600px",
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
  padding: "8px 0",
  boxSizing: "border-box",
  border: "none",
  borderBottom: "2px solid #ccc",
  borderRadius: "0",
  fontWeight: "bold",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.3s ease-in-out",
  backgroundColor: "transparent"
};
const errorStyle = { 
  color: "#dc3545", 
  marginTop: "5px", 
  fontSize: "0.9em",
  fontWeight: "500"
}; 
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
const inputErrorStyle = {
  ...inputStyle,
  borderBottom: "2px solid #dc3545",
  backgroundColor: "rgba(220, 53, 69, 0.05)"
};

const requiredIndicatorStyle = {
  color: '#dc3545',
  marginLeft: '3px'
};


// Add style for focused state
const inputFocusedStyle = {
  ...inputStyle,
  borderBottom: "2px solid #0d6efd"
};

const invalidInputStyle = {
  ...inputStyle,
  borderBottom: "2px solid #dc3545",
  backgroundColor: "rgba(220, 53, 69, 0.05)"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr", // Two columns
  gap: "15px", // Space between fields
};

const fullWidthStyle = {
  gridColumn: "1 / -1", // Span both columns
};

const isNumericInputKey = (event) => {
  // Allow: backspace, delete, tab, escape, enter, decimal point
  if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'Enter' ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.ctrlKey === true && ['a', 'c', 'v', 'x'].indexOf(event.key.toLowerCase()) !== -1) ||
      // Allow: home, end, left, right
      event.key === 'Home' ||
      event.key === 'End' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
  ) {
      return true;
  }
  
  // Ensure that it is a number and stop the keypress if it's not
  return !isNaN(Number(event.key));
};

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
//console.log("Selected School from context:", selectedSchool);
  // --- Local Form State ---
  const initialFormData = {
    fullName: '', 
    dateOfBirth: '', 
    gender: '', 
    email: '', 
    phoneNo: '', 
    address: '',
    enrollmentDate: '', 
    standardId: '', 
    divisionId: '', 
    rollNo: '', 
    studentStatus: '',
    studentIdentifier: '',
    isActive: true, 
    schoolId: '',
    bloodGroupId: '', 
    houseId: '', 
      emergencyContactNo: '',
      studentStatusID: 1 // Default to Active status (ID: 1)
  };
const [formData, setFormData] = useState(initialFormData);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null); // Holds the File object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null); // For image preview
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  const [pageError, setPageError] = useState(""); // General page errors
  
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  
  const [standards, setStandards] = useState([]); // For dropdown
  const [divisions, setDivisions] = useState([]); // For dropdown
  const [houses, setHouses] = useState([]); // For dropdown
    const [bloodGroups, setBloodGroups] = useState([]); // For blood group dropdown
    const [studentStatuses, setStudentStatuses] = useState([]);

   // --- Local Validation State ---
   const [formErrors, setFormErrors] = useState({}); // { fieldName: "Error message" }
   const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
   const [focusedField, setFocusedField] = useState(null);
   const [originalStudentName, setOriginalStudentName] = useState('');

  // --- New State for Invalid Input Indication ---
  const [phoneNoInvalid, setPhoneNoInvalid] = useState(false);
  const [emergencyContactInvalid, setEmergencyContactInvalid] = useState(false);

  // --- Effects ---

  // Fetch Master Data based on selected school
  useEffect(() => {
    const schoolIdForMasters = selectedSchool?.schoolId;

    const fetchMasters = async (schoolIdForMasters) => {
      if (!schoolIdForMasters) {
        if (standards.length > 0 || divisions.length > 0 || houses.length > 0 || bloodGroups.length > 0) {
          setStandards([]);
          setDivisions([]);
          setHouses([]);
            setBloodGroups([]);
            setStudentStatuses([]);
        }
        return;
      }
      
      setLoadingMasters(true);
      try {
          const [standardsRes, divisionsRes, bloodGroupsRes, housesRes, studentStatusesRes] = await Promise.all([
          api.get(`/api/commondata/standards?schoolId=${schoolIdForMasters}`),
          api.get(`/api/commondata/divisions?schoolId=${schoolIdForMasters}`),
          api.get(`/api/commondata/bloodgroups`),
            api.get(`/api/commondata/houses?schoolId=${schoolIdForMasters}`),
            api.get(`/api/commondata/studentstatuses`) // New API call for student statuses
        ]);

        // Update states only if data has changed
        if (JSON.stringify(standards) !== JSON.stringify(standardsRes.data)) {
          setStandards(standardsRes.data || []);
        }
        if (JSON.stringify(divisions) !== JSON.stringify(divisionsRes.data)) {
          setDivisions(divisionsRes.data || []);
        }
        if (JSON.stringify(bloodGroups) !== JSON.stringify(bloodGroupsRes.data)) {
          setBloodGroups(bloodGroupsRes.data || []);
        }
        if (JSON.stringify(houses) !== JSON.stringify(housesRes.data)) {
          setHouses(housesRes.data || []);
          }
          if (JSON.stringify(studentStatuses) !== JSON.stringify(studentStatusesRes.data)) {
              setStudentStatuses(studentStatusesRes.data || []);
          }
      } catch (err) {
        setPageError("Could not load dropdown options.");
      } finally {
        setLoadingMasters(false);
      }
    };

    const schoolIdToFetchFor = isEditMode ? currentStudent?.schoolId : selectedSchool?.schoolId;
    if (schoolIdToFetchFor) {
      fetchMasters(schoolIdToFetchFor);
    }
  }, [isEditMode, currentStudent?.schoolId, selectedSchool]);

useEffect(() => {
    console.log("Standards array:", standards);
  }, [standards]);

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
      console.log("Fetching student details for ID:", currentStudent);
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
      // Store original name when student data is loaded
      setOriginalStudentName(currentStudent.fullName || '');
      
      const updatedFormData = {
        fullName: currentStudent.fullName || '',
        dateOfBirth: currentStudent.dateOfBirth
          ? new Date(currentStudent.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: currentStudent.gender || '',
        email: currentStudent.email || '',
        phoneNo: currentStudent.phoneNo || '',
        address: currentStudent.address || '',
        enrollmentDate: currentStudent.enrollmentDate
          ? new Date(currentStudent.enrollmentDate).toISOString().split('T')[0]
          : '',
        standardId: currentStudent.standardId || '',
        divisionId: currentStudent.divisionId || '',
        rollNo: currentStudent.rollNo?.toString() || '',
        studentIdentifier: currentStudent.studentIdentifier || '',
        isActive: currentStudent.isActive ?? true,
        schoolId: currentStudent.schoolId,
        bloodGroupId: currentStudent.bloodGroupId?.toString() || '',
        houseId: currentStudent.houseId?.toString() || '',
          emergencyContactNo: currentStudent.emergencyContactNo || '',
          studentStatusID: currentStudent.studentStatusID || 1 
      };

      setFormData(updatedFormData);
      setOriginalFormData(updatedFormData); // Store original data for comparison
    }
  }, [currentStudent, isEditMode]);

  // Add function to check if form has changes
  const hasFormChanges = useCallback(() => {
    if (!originalFormData) return true;
    return JSON.stringify(originalFormData) !== JSON.stringify(formData);
  }, [originalFormData, formData]);

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
    const isRequired = ['fullName', 'standardId', 'divisionId', 'rollNo', 'studentStatus'].includes(name);
    console.log("full name length", FIELD_LENGTHS.FULL_NAME);
    switch (name) {
        case 'studentStatus':
            if (!value && isRequired) error = 'Student Status is required.';
            break;
        case 'fullName':
            if (!value && isRequired) error = 'Full Name is required.';
            else if (value && value.length > FIELD_LENGTHS.FULL_NAME) error = VALIDATION_MESSAGES.FULL_NAME;
            break;
        case 'standardId':
            if (!value && isRequired) error = 'Standard is required.';
            break;
        case 'divisionId':
            if (!value && isRequired) error = 'Division is required.';
            break;
        case 'rollNo':
            if (!value && isRequired) error = 'Roll No. is required.';
            else if (value && (isNaN(Number(value)) || Number(value) <= 0)) error = 'Roll No. must be a positive number.';
            break;
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format.';
                        break;
        case 'phoneNo':
            if (value && !/^\d{10}$/.test(value)) error = 'Phone number must be 10 digits.';
            break;
        case 'address':
            if (value && value.length > 200) error = 'Address max 200 chars.';
            break;
        case 'enrollmentDate':
            if (value) {
                const enrollDate = new Date(value);
                const today = new Date();
                if (enrollDate > today) error = 'Enrollment Date cannot be in the future.';
            }
            break;
        case 'dateOfBirth':
            if (value) {
                const dob = new Date(value);
                const today = new Date();
                if (dob > today) error = 'Date of Birth cannot be in the future.';
            }
            break;
        case 'studentIdentifier':
            if (value && value.length > FIELD_LENGTHS.STUDENT_IDENTIFIER) error = VALIDATION_MESSAGES.STUDENT_IDENTIFIER;
            break;
        case 'emergencyContactNo':
            if (value && !/^\d{10}$/.test(value)) error = 'Emergency contact must be 10 digits.';
            break;
        default: break;
    }
    return error;
}, []);

const validateForm = useCallback(() => {
        const newErrors = {};
    let allValid = true;

    Object.keys(formData).forEach((key) => {
        const value = formData[key];
        const error = validateField(key, value);
        if (error) {
            newErrors[key] = error;
            allValid = false;
        }
    });

    setFormErrors(newErrors);
    return allValid;
}, [formData, validateField]);

  // --- Event Handlers ---

  // Handles changes in text inputs, date, checkbox
const handleChange = useCallback(
  (e) => {
    const { name, value } = e.target;

    // Update form state
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (hasAttemptedSubmit) {
      const error = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    // Clear errors when user starts typing again
    if (submitError) dispatch(clearSubmitError());
    if (photoUploadError) dispatch(clearPhotoUploadError());
  },
  [dispatch, submitError, photoUploadError, validateField, hasAttemptedSubmit]
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
      e.preventDefault();
      setHasAttemptedSubmit(true); // Set this first to trigger validation display
      
      if (isEditMode && !hasFormChanges()) {
        toast.info('No changes made to update');
        return;
      }

      // Validate the entire form
      const isValid = validateForm();
      if (!isValid) {
        return; // Stop submission if validation fails
      }
  
      let studentIdToUse = isEditMode ? parseInt(id, 10) : null;
      let success = false;
  
      const dtoData = {
        ...formData,
        rollNo: parseInt(formData.rollNo, 10),
        dateOfBirth: formData.dateOfBirth || null,
        enrollmentDate: formData.enrollmentDate || null,
      };
  
      try {
        if (isEditMode && studentIdToUse) {
          console.log("Updating student with ID:", studentIdToUse);
          const { schoolId, ...updateDtoFields } = {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth || null,
            gender: formData.gender,
            email: formData.email,
            phoneNo: formData.phoneNo,
            address: formData.address,
            enrollmentDate: formData.enrollmentDate || null,
            standardId: formData.standardId ? parseInt(formData.standardId, 10) : null,
            divisionId: formData.divisionId ? parseInt(formData.divisionId, 10) : null,
            rollNo: formData.rollNo ? parseInt(formData.rollNo, 10) : null,
            studentIdentifier: formData.studentIdentifier,
            isActive: Boolean(formData.isActive),
            studentStatusID: formData.studentStatusID ? parseInt(formData.studentStatusID, 10) : null,
            bloodGroupId: formData.bloodGroupId ? parseInt(formData.bloodGroupId, 10) : null,
            houseId: formData.houseId ? parseInt(formData.houseId, 10) : null,
            emergencyContactNo: formData.emergencyContactNo
          };
          await dispatch(updateStudent({ 
            id: studentIdToUse, 
            updateStudentDto: updateDtoFields//{ updateStudentDto: updateDtoFields }  // Wrap in updateStudentDto object
          })).unwrap();
        } else {
          if (!dtoData.schoolId) {
            console.log("School ID is missing");
            setFormErrors((prev) => ({ ...prev, schoolId: "School ID is missing. Select school from header." }));
            throw new Error("School ID is missing.");
          }
          console.log("Adding new student");
          const createdStudent = await dispatch(addStudent(dtoData)).unwrap();
          studentIdToUse = createdStudent?.studentId;
          if (!studentIdToUse) throw new Error("Failed to get new student ID.");
        }
  
        if (selectedPhotoFile && studentIdToUse) {
          console.log("Uploading photo for student ID:", studentIdToUse);
          await dispatch(
            uploadStudentPhoto({
              studentId: studentIdToUse,
              file: selectedPhotoFile,
            })
          ).unwrap();
        }
  
        success = true;
      } catch (error) {
        console.error("Error during student save/upload:", error);
        success = false;
      }
  
      if (success) {
        console.log("Student save successful");
        alert(`Student successfully ${isEditMode ? "updated" : "added"}!`);
        navigate("/students");
      }
    },
    [dispatch, formData, id, isEditMode, navigate, selectedPhotoFile, validateForm, hasFormChanges]
  );

  // Handles navigation back to the list page
  const handleCancel = useCallback(() => navigate("/students"), [navigate]);

  // Handle field focus
  const handleFocus = useCallback((e) => {
    setFocusedField(e.target.name);
  }, []);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFocusedField(null);
    // Only validate on blur if user has started interacting with the form
    if (hasAttemptedSubmit || value) {
      validateField(name, value);
    }
  }, [hasAttemptedSubmit, validateField]);

  const getInputClass = (fieldName) => {
    debugger;
    if (focusedField === fieldName) return inputFocusedStyle;
    return hasAttemptedSubmit && formErrors[fieldName] ? inputErrorStyle : inputStyle;
  };

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

  // --- Main Form Render ---
  return (
    <div style={formContainerStyle}>
      <ToastContainer position="top-right" />
      <h2>
        {isEditMode
          ? `Edit Student - ${originalStudentName}`
          : "Add New Student"}
      </h2>

 {pageError && <p style={errorStyle}>{pageError}</p>}

      <form onSubmit={handleSubmit}>
        {/* --- Form Fields --- */}
        {/*<div style={gridStyle}>  Two-column layout for form fields */}
        <div style={gridStyle}>
        <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="fullName">Full Name<span style={requiredIndicatorStyle}>*</span>:</label>
                        <input 
              style={getInputClass('fullName')}
              type="text" 
              id="fullName" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              disabled={isLoading} 
              onFocus={handleFocus} 
              onBlur={handleBlur}
              maxLength={FIELD_LENGTHS.FULL_NAME}
              required
            />
                        {hasAttemptedSubmit && formErrors.fullName && <small style={errorStyle}>{formErrors.fullName}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="dateOfBirth">Date of Birth:</label>
                        <CustomDatePicker
    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null} // Convert ISO string to Date object
    onChange={(date) => {
      handleChange({
        target: {
          name: "dateOfBirth",
          value: date ? date.toISOString().split("T")[0] : "", // Save in ISO format
        },
      });
    }}
    placeholder="dd/MM/yyyy"
    maxDate={new Date()} // Disable current and future dates
    disabled={isLoading} // Disable if loading
  />
                        
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
                        <input 
              style={getInputClass('email')} 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              disabled={isLoading} 
              onFocus={handleFocus} 
              onBlur={handleBlur}
              maxLength={FIELD_LENGTHS.EMAIL}
            />
                         {hasAttemptedSubmit && formErrors.email && <small style={errorStyle}>{formErrors.email}</small>}
                    </div>
                    <div style={formGroupStyle}>
    <label style={labelStyle} htmlFor="phoneNo">Phone No:</label>
    <div style={{ position: 'relative' }}>
        <input 
            style={phoneNoInvalid ? invalidInputStyle : getInputClass('phoneNo')} 
            type="tel" 
            id="phoneNo" 
            name="phoneNo" 
            value={formData.phoneNo} 
            onChange={handleChange} 
            disabled={isLoading} 
            onFocus={handleFocus} 
            onBlur={(e) => {
                handleBlur(e);
                setPhoneNoInvalid(false);
            }}
            maxLength={FIELD_LENGTHS.PHONE}
            pattern="[0-9]*"
            inputMode="numeric"
            onKeyDown={(e) => {
                if (!isNumericInputKey(e)) {
                    e.preventDefault();
                    setPhoneNoInvalid(true);
                    setTimeout(() => setPhoneNoInvalid(false), 500);
                }
            }}
        />
        {phoneNoInvalid && <span style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#dc3545',
            fontWeight: 'bold'
        }}>!</span>}
    </div>
    {hasAttemptedSubmit && formErrors.phoneNo && <small style={errorStyle}>{formErrors.phoneNo}</small>}
</div>
<div style={formGroupStyle}>
    <label style={labelStyle} htmlFor="emergencyContactNo">Emergency Contact No:</label>
    <div style={{ position: 'relative' }}>
        <input 
            style={emergencyContactInvalid ? invalidInputStyle : getInputClass('emergencyContactNo')} 
            type="tel" 
            id="emergencyContactNo" 
            name="emergencyContactNo" 
            value={formData.emergencyContactNo} 
            onChange={handleChange} 
            disabled={isLoading} 
            onFocus={handleFocus} 
            onBlur={(e) => {
                handleBlur(e);
                setEmergencyContactInvalid(false);
            }}
            maxLength={FIELD_LENGTHS.EMERGENCY_CONTACT}
            pattern="[0-9]*"
            inputMode="numeric"
            onKeyDown={(e) => {
                if (!isNumericInputKey(e)) {
                    e.preventDefault();
                    setEmergencyContactInvalid(true);
                    setTimeout(() => setEmergencyContactInvalid(false), 500);
                }
            }}
        />
        {emergencyContactInvalid && <span style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#dc3545',
            fontWeight: 'bold'
        }}>!</span>}
    </div>
    {hasAttemptedSubmit && formErrors.emergencyContactNo && <small style={errorStyle}>{formErrors.emergencyContactNo}</small>}
</div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="address">Address:</label>
                        <input 
              style={getInputClass('address')} 
              type="text" 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              disabled={isLoading} 
              onFocus={handleFocus} 
              onBlur={handleBlur}
              maxLength={FIELD_LENGTHS.ADDRESS}
            />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="enrollmentDate">Enrollment Date:</label>
                        <CustomDatePicker
    selected={formData.enrollmentDate ? new Date(formData.enrollmentDate) : null} // Convert ISO string to Date object
    onChange={(date) => {
      handleChange({
        target: {
          name: "enrollmentDate",
          value: date ? date.toISOString().split("T")[0] : "", // Save in ISO format
        },
      });
    }}
    placeholder="dd/MM/yyyy"
    maxDate={new Date()} // Disable current and future dates
    disabled={isLoading} // Disable if loading
  />
  {hasAttemptedSubmit && formErrors.enrollmentDate && (
    <small style={errorStyle}>{formErrors.enrollmentDate}</small>
  )}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="standardId">Class<span style={requiredIndicatorStyle}>*</span>:</label>
                        <select
                            style={getInputClass('standardId')}
                            id="standardId"
                            name="standardId"
                            value={formData.standardId || ''} // Ensure value is correctly bound
                            onChange={handleChange}
                            disabled={isLoading || loadingMasters}
                        >
                            <option value="">-- Select Standard --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {standards.map((s) => (
                                <option key={s.standardId} value={s.standardId}>{s.name}</option>
                            ))}
                        </select>
                        {hasAttemptedSubmit && formErrors.standardId && (
                            <small style={errorStyle}>{formErrors.standardId}</small>
                        )}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="divisionId">Division<span style={requiredIndicatorStyle}>*</span>:</label>
                        <select
                            style={getInputClass('divisionId')}
                            id="divisionId"
                            name="divisionId"
                            value={formData.divisionId || ''} 
                            onChange={handleChange}
                            disabled={isLoading || loadingMasters}
                        >
                            <option value="">-- Select Division --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {divisions.map((d) => (
                                <option key={d.divisionId} value={d.divisionId}>{d.name}</option>
                            ))}
                        </select>
                        {hasAttemptedSubmit && formErrors.divisionId && (
                            <small style={errorStyle}>{formErrors.divisionId}</small>
                        )}
                    </div>
                  <div style={formGroupStyle}>
                      <label style={labelStyle} htmlFor="studentStatusID">Student Status:</label>
                      <select
                          style={getInputClass('studentStatusID')}
                          id="studentStatusID"
                          name="studentStatusID"
                          value={formData.studentStatusID || ''}
                          onChange={handleChange}
                          disabled={isLoading || loadingMasters}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                      >
                          <option value="">-- Select Status --</option>
                          {loadingMasters && <option disabled>Loading...</option>}
                          {studentStatuses.map((status) => (
                              <option key={status.studentStatusID} value={status.studentStatusID}>
                                  {status.statusName}
                              </option>
                          ))}
                      </select>
                      {hasAttemptedSubmit && formErrors.studentStatusID && (
                          <small style={errorStyle}>{formErrors.studentStatusID}</small>
                      )}
                  </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="rollNo">Roll No<span style={requiredIndicatorStyle}>*</span>:</label>
                        <input style={getInputClass('rollNo')} type="number" id="rollNo" name="rollNo" value={formData.rollNo} onChange={handleChange} disabled={isLoading} onFocus={handleFocus} onBlur={handleBlur} />
                         {hasAttemptedSubmit && formErrors.rollNo && <small style={errorStyle}>{formErrors.rollNo}</small>}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="studentIdentifier">Registration ID (Institution Specific):</label>
                        <input 
              style={getInputClass('studentIdentifier')} 
              type="text" 
              id="studentIdentifier" 
              name="studentIdentifier" 
              value={formData.studentIdentifier} 
              onChange={handleChange} 
              disabled={isLoading} 
              onFocus={handleFocus} 
              onBlur={handleBlur}
              maxLength={FIELD_LENGTHS.STUDENT_IDENTIFIER}
            />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="bloodGroupId">Blood Group:</label>
                        <select
                            style={getInputClass('bloodGroupId')}
                            id="bloodGroupId"
                            name="bloodGroupId"
                            value={formData.bloodGroupId || ''} 
                            onChange={handleChange}
                            disabled={isLoading || loadingMasters}
                        >
                            <option value="">-- Select Blood Group --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {bloodGroups.map((bg) => (
                                <option key={bg.bloodGroupId} value={bg.bloodGroupId}>{bg.bloodGroupName}</option>
                            ))}
                        </select>
                        {hasAttemptedSubmit && formErrors.bloodGroupId && (
                            <small style={errorStyle}>{formErrors.bloodGroupId}</small>
                        )}
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="houseId">House:</label>
                        <select
                            style={getInputClass('houseId')}
                            id="houseId"
                            name="houseId"
                            value={formData.houseId || ''} 
                            onChange={handleChange}
                            disabled={isLoading || loadingMasters}
                        >
                            <option value="">-- Select House --</option>
                            {loadingMasters && <option disabled>Loading...</option>}
                            {houses.map((h) => (
                                <option key={h.houseId} value={h.houseId}>{h.houseName}</option>
                            ))}
                        </select>
                        {hasAttemptedSubmit && formErrors.houseId && (
                            <small style={errorStyle}>{formErrors.houseId}</small>
                        )}
                    </div>
                    {/* {isEditMode && (
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
        )} */}
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
</div>
        {/* --- Photo Section --- */}
        <div style={fileInputContainerStyle}>
          <h4>{isEditMode ? "Update" : "Add"} Student Photo</h4>

          {/* Display current photo in Edit mode if available and no new preview */}
          {isEditMode && currentStudent?.photoPath && !photoPreviewUrl && (
  <div>
    <label style={labelStyle}>Current Photo:</label>
    <img
      src={`${API_IMAGE_URL}${currentStudent.photoName}`} // Replace localhost:5000 with your backend URL
      alt="Current"
      style={currentPhotoStyle}
      onError={(e) => {
        e.target.style.display = "none"; // Hide the image if it fails to load
        console.error("Failed to load current photo:", currentStudent.photoName);
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
