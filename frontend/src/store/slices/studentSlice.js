// src/store/slices/studentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api"; // Use configured Axios instance

// --- Async Thunk for Fetching Students by School ---
export const fetchStudentsBySchool = createAsyncThunk(
  "students/fetchBySchool",
  async (schoolId, { rejectWithValue }) => {
    if (!schoolId) {
      return rejectWithValue("No School ID provided to fetch students.");
    }
    try {
      console.log(`Redux Thunk: Fetching students for School ID: ${schoolId}`);
      const response = await api.get(`/api/schools/${schoolId}/students`);
      if (response.data && Array.isArray(response.data)) {
        return response.data; // Payload will be the array of StudentSummaryDto
      } else {
        return rejectWithValue("Invalid data format received for students.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load students.";
      console.error("Redux Thunk: Fetch students failed:", message);
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentDetails = createAsyncThunk(
  "students/fetchDetails",
  async (studentId, { rejectWithValue }) => {
    try {
      console.log(`Redux Thunk: Fetching details for Student ID: ${studentId}`);
      // Uses the GET /api/students/{id} endpoint
      const response = await api.get(`/api/students/${studentId}`);
      return response.data; // Expects StudentDetailDto
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load student details.";
      console.error(
        `Redux Thunk: Fetch student details failed for ${studentId}:`,
        message
      );
      return rejectWithValue(message);
    }
  }
);

// Add a new student
export const addStudent = createAsyncThunk(
  "students/addStudent",
  async (createStudentDto, { rejectWithValue }) => {
    try {
      console.log("Redux Thunk: Adding new student", createStudentDto);
      // Uses POST /api/students
      const response = await api.post("/api/students", createStudentDto);
      return response.data; // Expects the created StudentDetailDto
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add student.";
      console.error(
        "Redux Thunk: Add student failed:",
        message,
        error.response?.data
      );
      // Pass the whole response data on error if available (might contain validation details)
      return rejectWithValue(error.response?.data || message);
    }
  }
);

// Update an existing student
export const updateStudent = createAsyncThunk(
  "students/updateStudent",
  async ({ id, updateStudentDto }, { rejectWithValue }) => {
    try {
      console.log(`Redux Thunk: Updating student ID: ${id}`, updateStudentDto);
      // Uses PUT /api/students/{id} - Expects 204 No Content on success typically
      await api.put(`/api/students/${id}`, updateStudentDto);
      // Return data needed to update the state (e.g., the updated DTO or just the ID)
      // Since PUT often returns 204, we might need to return the input DTO or refetch
      // Returning the input DTO allows optimistic updates if desired
      return { id, updatedData: updateStudentDto }; // Or just return id if refetching list
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update student.";
      console.error(
        `Redux Thunk: Update student failed for ${id}:`,
        message,
        error.response?.data
      );
      return rejectWithValue(error.response?.data || message);
    }
  }
);

// Add Async Thunk for Deleting a Student
export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      console.log(`Redux Thunk: Deleting student ID: ${studentId}`);
      // Uses DELETE /api/students/{id} - Expects 204 No Content on success
      await api.delete(`/api/students/${studentId}`);
      // Return the deleted studentId so the reducer can remove it from the list
      return studentId;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete student.";
      console.error(
        `Redux Thunk: Delete student failed for ${studentId}:`,
        message,
        error.response?.data
      );
      // Pass specific error if available (like dependencies preventing delete)
      return rejectWithValue(error.response?.data || message);
    }
  }
);

export const uploadStudentPhoto = createAsyncThunk(
  "students/uploadPhoto",
  async ({ studentId, file }, { dispatch, rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      console.log(`Redux Thunk: Uploading photo for Student ID: ${studentId}`);
      const response = await api.post(
        `/api/students/${studentId}/photo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data && response.data.photoPath) {
        console.log(
          "Redux Thunk: Photo uploaded, path:",
          response.data.photoPath
        );
        // Dispatch action to update photo path in currentStudent state
        // Or return data and handle in extraReducer
        dispatch(setCurrentStudentPhotoPath(response.data.photoPath)); // Requires new reducer action
        //return response.data.photoPath; // Return the path
        return { studentId: studentId, photoPath: response.data.photoPath };
      } else {
        return rejectWithValue("Invalid response after photo upload.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload photo.";
      console.error(
        `Redux Thunk: Upload photo failed for ${studentId}:`,
        message
      );
      return rejectWithValue(message);
    }
  }
);
// --- TODO: Add Async Thunks for Add, Update, Delete later ---
// export const addStudent = createAsyncThunk(...)
// export const updateStudent = createAsyncThunk(...)
// export const deleteStudent = createAsyncThunk(...)

// --- Student Slice Definition ---
// const initialState = {
//     // Store students as an object keyed by studentId for easier lookup/update?
//     // Or just an array if only displaying lists. Array is simpler for now.
//     items: [],          // Array to hold StudentSummaryDto or StudentDetailDto
//     loading: false,     // Loading state for student operations
//     currentRequestId: undefined, // Helps handle race conditions with async ops
//     error: null,        // Stores errors from student operations
// };

const initialState = {
  items: [], // List of StudentSummaryDto (from fetchStudentsBySchool)
  currentStudent: null, // Holds StudentDetailDto when fetching/editing single student
  loadingList: false, // Loading state for the list
  loadingDetails: false, // Loading state for fetching single student details
  loadingSubmit: false, // Loading state for add/update operations
  loadingDelete: false,
  errorList: null,
  errorDetails: null,
  errorSubmit: null,
  errorDelete: null,
  loadingPhotoUpload: false, // Specific loading state for photo upload
  errorPhotoUpload: null, // Specific error state for photo upload
};

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearStudents: (state) => {
      state.items = [];
      state.errorList = null;
      state.loadingList = false;
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
      state.errorDetails = null;
      state.loadingDetails = false;
    },
    clearSubmitError: (state) => {
      state.errorSubmit = null;
    },
    clearDeleteError: (state) => {
      // Action to clear delete error
      state.errorDelete = null;
    },
    clearPhotoUploadError: (state) => {
      // New action
      state.errorPhotoUpload = null;
    },
    setCurrentStudentPhotoPath: (state, action) => {
      if (state.currentStudent) {
        state.currentStudent.photoPath = action.payload;
      }
    },
    updateStudentPhotoPathInList: (state, action) => {
      const { studentId, photoPath } = action.payload;
      const index = state.items.findIndex(s => s.studentId === studentId);
      if (index !== -1) {
          // Update the photo path in the list item
          // NOTE: Assumes items store StudentSummaryDto which might need photoPath added
          state.items[index].photoPath = photoPath;
          state.items[index].photoThumbnailPath = photoPath; // Assuming same for now
      }
  }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students By School
      .addCase(fetchStudentsBySchool.pending, (state) => {
        state.loadingList = true; // Use specific loading state
        state.errorList = null;
      })
      .addCase(fetchStudentsBySchool.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loadingList = false;
      })
      .addCase(fetchStudentsBySchool.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload || "Failed to fetch students.";
      })

      // Fetch Student Details
      .addCase(fetchStudentDetails.pending, (state) => {
        state.loadingDetails = true;
        state.currentStudent = null; // Clear previous details
        state.errorDetails = null;
      })
      .addCase(fetchStudentDetails.fulfilled, (state, action) => {
        state.currentStudent = action.payload; // Store fetched details
        state.loadingDetails = false;
      })
      .addCase(fetchStudentDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.errorDetails =
          action.payload || "Failed to fetch student details.";
      })

      // Add Student
      .addCase(addStudent.pending, (state) => {
        state.loadingSubmit = true;
        state.errorSubmit = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loadingSubmit = false;
        // Optionally add the new student to the list state for immediate UI update
        // This assumes the returned payload is compatible with the list DTO (StudentSummaryDto)
        // Or map it here if needed. Often simpler to trigger a list refresh instead.
        // state.items.push(_mapper.map<StudentSummaryDto>(action.payload)); // Example if mapping needed
        console.log("Add student fulfilled. Consider refreshing list.");
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loadingSubmit = false;
        state.errorSubmit = action.payload || "Failed to add student.";
      })

      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.loadingSubmit = true;
        state.errorSubmit = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loadingSubmit = false;
        // Optionally update the student in the list state for immediate UI update
        // const index = state.items.findIndex(s => s.studentId === action.payload.id);
        // if (index !== -1) {
        //   state.items[index] = { ...state.items[index], ...action.payload.updatedData };
        // }
        // Also update currentStudent if it matches the updated one
        if (state.currentStudent?.studentId === action.payload.id) {
          state.currentStudent = {
            ...state.currentStudent,
            ...action.payload.updatedData,
          };
        }
        console.log("Update student fulfilled. Consider refreshing list.");
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loadingSubmit = false;
        state.errorSubmit = action.payload || "Failed to update student.";
      })
      .addCase(deleteStudent.pending, (state) => {
        state.loadingDelete = true;
        state.errorDelete = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loadingDelete = false;
        // Remove the student from the list state
        const deletedId = action.payload; // Get the ID from the fulfilled action payload
        state.items = state.items.filter((s) => s.studentId !== deletedId);
        state.errorDelete = null;
        console.log(`Redux delete student fulfilled for ID: ${deletedId}`);
        // Clear currentStudent if it was the one deleted
        if (state.currentStudent?.studentId === deletedId) {
          state.currentStudent = null;
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loadingDelete = false;
        state.errorDelete = action.payload || "Failed to delete student.";
        console.error("Redux delete student rejected:", action.payload);
      })
      .addCase(uploadStudentPhoto.pending, (state) => {
        state.loadingPhotoUpload = true;
        state.errorPhotoUpload = null;
    })
    .addCase(uploadStudentPhoto.fulfilled, (state, action) => {
        state.loadingPhotoUpload = false;
        // Photo path already updated via setCurrentStudentPhotoPath action dispatched in thunk
        // state.errorPhotoUpload = null;
        //  console.log("Redux Upload photo fulfilled.");
        const { studentId, photoPath } = action.payload;
        const index = state.items.findIndex(s => s.studentId === studentId);
        if (index !== -1) {
            state.items[index].photoPath = photoPath;
            state.items[index].photoThumbnailPath = photoPath; // Update path in list
        }
        state.errorPhotoUpload = null;
    })
    .addCase(uploadStudentPhoto.rejected, (state, action) => {
        state.loadingPhotoUpload = false;
        state.errorPhotoUpload = action.payload || 'Failed to upload photo.';
         console.error("Redux Upload photo rejected:", action.payload);
    });
  },
});

export const {
  clearStudents,
  clearCurrentStudent,
  clearSubmitError,
  clearDeleteError,
  clearPhotoUploadError, // Export new action
  setCurrentStudentPhotoPath, // Export new action
  updateStudentPhotoPathInList 
} = studentSlice.actions;
export default studentSlice.reducer;

// --- Selectors ---
export const selectStudentList = (state) => state.students.items;
export const selectStudentLoadingList = (state) => state.students.loadingList;
export const selectStudentErrorList = (state) => state.students.errorList;

export const selectCurrentStudent = (state) => state.students.currentStudent;
export const selectStudentLoadingDetails = (state) =>
  state.students.loadingDetails;
export const selectStudentErrorDetails = (state) => state.students.errorDetails;

export const selectStudentLoadingSubmit = (state) =>
  state.students.loadingSubmit;
export const selectStudentErrorSubmit = (state) => state.students.errorSubmit;

export const selectStudentLoadingDelete = (state) =>
  state.students.loadingDelete; // Selector for delete loading
export const selectStudentErrorDelete = (state) => state.students.errorDelete; // Selector for delete error

export const selectStudentLoadingPhotoUpload = (state) => state.students.loadingPhotoUpload; // New selector
export const selectStudentErrorPhotoUpload = (state) => state.students.errorPhotoUpload;   // New selector

