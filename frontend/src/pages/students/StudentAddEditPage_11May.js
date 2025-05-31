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
import { selectSelectedSchoolId } from "../../store/slices/schoolSlice";

// --- Styles ---
const formContainerStyle = {
 // maxWidth: "600px",
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
  const submitError = useSelector(selectStudentErrorSubmit);
  const loadingPhotoUpload = useSelector(selectStudentLoadingPhotoUpload);
  const photoUploadError = useSelector(selectStudentErrorPhotoUpload);
  const selectedSchoolIdFromContext = useSelector(selectSelectedSchoolId);

  // --- Local Form State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    studentIdentifier: "",
    isActive: true,
    schoolId: "",
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null); // Holds the File object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null); // For image preview
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  const [pageError, setPageError] = useState(""); // General page errors

  // --- Effects ---

  // Effect for mode change / Initial Load / Fetch Details
  useEffect(() => {
    setIsEditMode(mode === "edit");
    dispatch(clearSubmitError());
    dispatch(clearPhotoUploadError());
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input visually

    if (mode === "edit" && id) {
      dispatch(fetchStudentDetails(parseInt(id, 10)));
    } else {
      // In add mode, clear any potentially loaded student details
      dispatch(clearCurrentStudent());
      // Set default schoolId from context or location state if passed
      const defaultSchoolId =
        location.state?.schoolId || selectedSchoolIdFromContext;
      setFormData((prev) => ({
        // Use default values, not potentially stale prev state
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        studentIdentifier: "",
        isActive: true,
        schoolId: defaultSchoolId || "", // Set default school
      }));
    }

    // Cleanup function
    return () => {
      dispatch(clearCurrentStudent());
      dispatch(clearSubmitError());
      dispatch(clearPhotoUploadError());
    };
  }, [mode, id, dispatch, selectedSchoolIdFromContext, location.state]); // Dependencies

  // Effect to populate form when currentStudent data arrives (edit mode)
  useEffect(() => {
    if (isEditMode && currentStudent) {
      setFormData({
        firstName: currentStudent.firstName || "",
        lastName: currentStudent.lastName || "",
        dateOfBirth: currentStudent.dateOfBirth
          ? new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(currentStudent.dateOfBirth))
          : "",
        studentIdentifier: currentStudent.studentIdentifier || "",
        isActive: currentStudent.isActive ?? true,
        schoolId: currentStudent.schoolId,
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

  // --- Event Handlers ---

  // Handles changes in text inputs, date, checkbox
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      // Clear errors when user starts typing again
      if (submitError) dispatch(clearSubmitError());
      if (photoUploadError) dispatch(clearPhotoUploadError());
    },
    [dispatch, submitError, photoUploadError]
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
      dispatch(clearSubmitError());
      dispatch(clearPhotoUploadError());

      let studentIdToUse = isEditMode ? parseInt(id, 10) : null;
      let isNewStudent = false;
      let success = false;

      // Disable button during operation (handled by isLoading state check on button)
      console.log("Form submit initiated...");

      try {
        // Step 1: Save/Update Student Data (text fields etc.)
        const formattedDateOfBirth = formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
          : null;

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
          ).unwrap();
          console.log("Update student data successful.");
        } else {
          // Add mode
          const createDto = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formattedDateOfBirth,
            studentIdentifier: formData.studentIdentifier || null
            //schoolId: formData.schoolId, // Must have schoolId
          };
        //   if (!createDto.schoolId)
        //     throw new Error("Cannot add student: School ID is missing.");
          console.log("Dispatching addStudent", createDto);
          const createdStudent = await dispatch(addStudent(createDto)).unwrap();
          studentIdToUse = createdStudent?.studentId; // Get ID for photo upload
          if (!studentIdToUse)
            throw new Error("Failed to get new student ID after creation."); // Check if ID was returned
          isNewStudent = true;
          console.log("Add student data successful. New ID:", studentIdToUse);
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
    [dispatch, formData, id, isEditMode, navigate, selectedPhotoFile]
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

  // --- Main Form Render ---
  return (
    <div style={formContainerStyle}>
      <h2>
        {isEditMode
          ? `Edit Student - ${formData.firstName} ${formData.lastName}`
          : "Add New Student"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* --- Form Fields --- */}
        <div style={formGroupStyle}>
          <label htmlFor="firstName" style={labelStyle}>
            First Name:
          </label>
          <input
            style={inputStyle}
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div style={formGroupStyle}>
          <label htmlFor="lastName" style={labelStyle}>
            Last Name:
          </label>
          <input
            style={inputStyle}
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        {/* <div style={formGroupStyle}>
  <label htmlFor="dateOfBirth" style={labelStyle}>
    Date of Birth:
  </label>
  <DatePicker
    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
    onChange={(date) => {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date ? date.toISOString().split("T")[0] : "",
      }));
    }}
    dateFormat="dd-MMM-yyyy" // Display format
    placeholderText="Select Date of Birth"
    maxDate={new Date()} // Prevent selecting future dates
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    disabled={isLoading}
    className="form-control" // Optional: Add custom styles
  />
</div> */}
{/* <div style={{ position: "relative", ...formGroupStyle }}>
  <label htmlFor="dateOfBirth" style={labelStyle}>
    Date of Birth:
  </label>
  <DatePicker
    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
    onChange={(date) => {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date ? date.toISOString().split("T")[0] : "",
      }));
    }}
    dateFormat="dd-MMM-yyyy" // Display format
    placeholderText="Select Date of Birth"
    maxDate={new Date()} // Prevent selecting future dates
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    disabled={isLoading}
    className="form-control" // Optional: Add custom styles
    style={{ width: "100%", paddingRight: "40px" }} // Add padding for the icon
  />
  <FaCalendarAlt
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none", // Prevent interaction with the icon
      color: "#6c757d", // Gray color for the icon
    }}
  />
</div> */}
<div style={formGroupStyle}>
  <label htmlFor="dateOfBirth" style={labelStyle}>
    Date of Birth:
  </label>
  <DatePickerWithIcon
    selectedDate={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
    onChange={(date) => {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date ? date.toISOString().split("T")[0] : "",
      }));
    }}
    placeholder="Select Date of Birth"
    maxDate={new Date()} // Prevent selecting future dates
    disabled={isLoading}
  />
</div>
        <div style={formGroupStyle}>
          <label htmlFor="studentIdentifier" style={labelStyle}>
            Roll no:
          </label>{" "}
          {/* Student Identifier (School Specific) */}
          <input
            style={inputStyle}
            type="text"
            id="studentIdentifier"
            name="studentIdentifier"
            value={formData.studentIdentifier}
            onChange={handleChange}
            disabled={isLoading}
          />
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
