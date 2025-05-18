// src/store/slices/schoolSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// --- Async Thunk for Fetching Available Schools ---
export const fetchSchools = createAsyncThunk(
    'school/fetchSchools',
    async (_, { getState, rejectWithValue }) => { // _ indicates no direct args needed
        const { auth } = getState(); // Get auth state to check role
        if (!auth.token) {
            return rejectWithValue('User not authenticated'); // Don't fetch if not logged in
        }

        try {
            let response;
             if (auth.user?.role === 'Admin') {
                 console.log("Redux fetching all schools for Admin");
                 response = await api.get('/api/schools');
             } else {
                 console.log("Redux fetching assigned schools for StandardUser");
                 response = await api.get('/api/users/me/schools');
             }

             if (response.data && Array.isArray(response.data)) {
                 return response.data; // Return the array of SchoolDto
             } else {
                 return rejectWithValue('Invalid school data format received.');
             }
        } catch (error) {
             const message = error.response?.data?.message || error.message || 'Failed to load schools.';
             return rejectWithValue(message);
        }
    }
);

// --- School Slice Definition ---
const initialState = {
    availableSchools: [],
    selectedSchoolId: parseInt(localStorage.getItem('selectedSchoolId') || '0', 10) || null, // Load from storage
    loading: false,
    error: null,
};

const schoolSlice = createSlice({
    name: 'school',
    initialState,
    reducers: {
        // Synchronous action to change selected school
        setSelectedSchool: (state, action) => {
            const schoolId = action.payload;
            // Validate if the schoolId exists in availableSchools
            if (state.availableSchools.some(s => s.schoolId === schoolId)) {
                state.selectedSchoolId = schoolId;
                localStorage.setItem('selectedSchoolId', schoolId.toString());
                 console.log("Redux selected school changed:", schoolId);
            } else {
                 console.warn(`Redux: Attempted to select invalid school ID ${schoolId}`);
            }
        },
        clearSelectedSchool: (state) => {
             state.selectedSchoolId = null;
             localStorage.removeItem('selectedSchoolId');
        },
        clearSchoolError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchools.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSchools.fulfilled, (state, action) => {
                state.loading = false;
                state.availableSchools = action.payload;
                state.error = null;

                // Auto-select logic after fetching
                if (action.payload.length > 0) {
                    // If no school selected OR current selection is invalid, select first
                    if (!state.selectedSchoolId || !action.payload.some(s => s.schoolId === state.selectedSchoolId)) {
                        state.selectedSchoolId = action.payload[0].schoolId;
                        localStorage.setItem('selectedSchoolId', state.selectedSchoolId.toString());
                         console.log("Redux auto-selected first school:", state.selectedSchoolId);
                    }
                } else {
                    // No schools available, clear selection
                    state.selectedSchoolId = null;
                    localStorage.removeItem('selectedSchoolId');
                }
                 console.log("Redux fetch schools fulfilled:", action.payload);
            })
            .addCase(fetchSchools.rejected, (state, action) => {
                state.loading = false;
                state.availableSchools = []; // Clear schools on error
                state.selectedSchoolId = null;
                state.error = action.payload || 'Failed to load schools.';
                localStorage.removeItem('selectedSchoolId');
                 console.error("Redux fetch schools rejected:", action.payload);
            })
            // --- Handle Logout ---
            // Reset school state when user logs out (listen to authSlice action)
            // Note: This requires careful setup or cross-slice communication patterns
            // Simpler way: Dispatch clearSelectedSchool from logout logic or on auth change
            // Alternative: Add a case for `logout` action if imported correctly (can be tricky)
            // .addCase('auth/logout', (state) => { ... reset state ... });
            ;
    },
});

export const { setSelectedSchool, clearSelectedSchool, clearSchoolError } = schoolSlice.actions;
export default schoolSlice.reducer;

// Selectors
export const selectAvailableSchools = (state) => state.school.availableSchools;
export const selectSelectedSchoolId = (state) => state.school.selectedSchoolId;
// Selector to get the full selected school object (derived state)
export const selectSelectedSchool = (state) => {
    return state.school.availableSchools.find(s => s.schoolId === state.school.selectedSchoolId) || null;
};
export const selectSchoolLoading = (state) => state.school.loading;
export const selectSchoolError = (state) => state.school.error;