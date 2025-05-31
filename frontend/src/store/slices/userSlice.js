// src/store/slices/userSlice.js (New or Expanded)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// --- Thunks ---
export const fetchPaginatedUsers = createAsyncThunk(
    'users/fetchPaginated',
    async (queryParams, { rejectWithValue }) => {
        try {
            // Construct query string from params object
            const queryString = new URLSearchParams(queryParams).toString();
            const response = await api.get(`/api/users/paginated?${queryString}`);
            return response.data; // Expects PaginatedUserListDto
        } catch (error) { /* ... rejectWithValue ... */ }
    }
);

export const fetchUserDetails = createAsyncThunk(
    'users/fetchDetails',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/users/${userId}/details`);
            return response.data; // Expects UserDetailDto
        } catch (error) { /* ... rejectWithValue ... */ }
    }
);

// export const updateUserAssignments = createAsyncThunk(
//     'users/updateAssignments',
//     async ({ userId, updateDto }, { rejectWithValue }) => { // updateDto is UpdateUserDto
//         try {
//             await api.put(`/api/users/${userId}`, updateDto);
//             return { userId, updateDto }; // Return needed info for potential state update
//         } catch (error) { /* ... rejectWithValue ... */ }
//     }
// );

export const updateUser = createAsyncThunk(
    'users/updateUser', // Changed action type prefix
    async ({ userId, updateDto }, { rejectWithValue }) => {
        try {
            await api.put(`/api/users/${userId}`, updateDto);
            // Return enough info to update the list or details if needed
            // For now, just indicate success for this user and what was sent
            return { userId, updatedData: updateDto };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update user.';
            console.error(`Redux Thunk: Update user failed for ${userId}:`, message, error.response?.data);
            return rejectWithValue(error.response?.data || message);
        }
    }
);
// export const resetUserPassword = createAsyncThunk(
//     'users/resetPassword',
//     async (resetDto, { rejectWithValue }) => { // resetDto is ResetPasswordDto
//          try {
//             await api.post(`/api/users/reset-password`, resetDto);
//             return resetDto.userId; // Indicate success for this user
//          } catch (error) { /* ... rejectWithValue ... */ }
//     }
// );

export const adminResetPassword = createAsyncThunk(
    'users/adminResetPassword', // Changed action type prefix
    async (resetDto, { rejectWithValue }) => {
         try {
            await api.post(`/api/users/admin-reset-password`, resetDto); // Ensure endpoint matches
            return resetDto.userId;
         } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to reset password.';
            console.error(`Redux Thunk: Admin Reset password failed for ${resetDto.userId}:`, message);
            return rejectWithValue(error.response?.data || message);
        }
    }
);

export const addUser = createAsyncThunk(
    'users/addUser',
    async (createUserDto, { rejectWithValue }) => {
        try {
            debugger;
            const response = await api.post('/api/users', createUserDto); // Endpoint for adding user
            return response.data; // Expects UserDto of created user
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add user.';
            console.error(`Redux Thunk: Add user failed:`, message, error.response?.data);
            return rejectWithValue(error.response?.data || message);
        }
    }
);

export const updateUserWithAssignments = createAsyncThunk(
    'users/updateWithAssignments',
    async ({ userId, updateDto }, { dispatch, rejectWithValue }) => { // updateDto is UpdateUserDto
        try {
            console.log(`Redux Thunk: Updating user ${userId} with assignments`, updateDto);
            await api.put(`/api/users/${userId}`, updateDto);
            // After updating, refresh the details in state for the modal
            // AND potentially refresh the paginated list if user role/status changed impacting filters.
            dispatch(fetchUserDetails(userId));
            // To refresh the list, you'd need current list query params.
            // This can get complex. Simpler might be to let UserListPage refetch if needed after modal close.
            return { userId, updatedData: updateDto }; // Return what was sent for optimistic updates or confirmation
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update user.';
            console.error(`Redux Thunk: Update user failed for ${userId}:`, message, error.response?.data);
            return rejectWithValue(error.response?.data || message);
        }
    }
);

// --- Slice ---
const initialState = {
    paginatedUsers: { users: [], currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    currentUserDetails: null, // For edit modal
    loadingList: false,
    loadingDetails: false,
    loadingUpdate: false,
    loadingReset: false,
    errorList: null,
    errorDetails: null,
    errorUpdate: null,
    errorReset: null,
    loadingSubmit: false, // Generic for Add/Update form submission
    errorSubmit: null,   // Generic for Add/Update form submission errors
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUserDetails: (state) => { state.currentUserDetails = null; state.errorDetails = null; state.loadingDetails = false; },
        clearUserUpdateError: (state) => { state.errorUpdate = null; }, // Renamed from clearCoreUpdateError
        //clearUserErrors: (state) => { state.errorList=null; state.errorDetails=null; state.errorUpdate=null; state.errorReset=null;}
        // Reset state actions if needed
        clearUserSubmitError: (state) => { state.errorSubmit = null; }, // Action to clear submit error
        clearUserResetError: (state) => { state.errorReset = null; },   // Action to clear reset error
        clearUserListError: (state) => { state.errorList = null; }      // Action to clear list error
    },
    extraReducers: (builder) => {
        builder
        // Fetch Paginated Users
        .addCase(fetchPaginatedUsers.pending, (state) => { state.loadingList = true; state.errorList = null;})
        .addCase(fetchPaginatedUsers.fulfilled, (state, action) => { state.loadingList = false; state.paginatedUsers = action.payload; })
        .addCase(fetchPaginatedUsers.rejected, (state, action) => { state.loadingList = false; state.errorList = action.payload; })
        // Fetch User Details
        .addCase(fetchUserDetails.pending, (state) => { state.loadingDetails = true; state.errorDetails = null; state.currentUserDetails = null;})
        .addCase(fetchUserDetails.fulfilled, (state, action) => { state.loadingDetails = false; state.currentUserDetails = action.payload; })
        .addCase(fetchUserDetails.rejected, (state, action) => { state.loadingDetails = false; state.errorDetails = action.payload; })

        // Add User
        .addCase(addUser.pending, (state) => { state.loadingSubmit = true; state.errorSubmit = null; })
        .addCase(addUser.fulfilled, (state, action) => { state.loadingSubmit = false; /* Optionally add to list or rely on refresh */})
        .addCase(addUser.rejected, (state, action) => { state.loadingSubmit = false; state.errorSubmit = action.payload; })

        // Update User (was updateUserAssignments)
        // .addCase(updateUser.pending, (state) => { state.loadingSubmit = true; state.errorSubmit = null; }) // Use loadingSubmit
        // .addCase(updateUser.fulfilled, (state, action) => {
        //     state.loadingSubmit = false;
        //     state.currentUserDetails = null; // Clear details to force re-fetch or list update
        //     // Optionally update the item in paginatedUsers.users list if present
        //     const index = state.paginatedUsers.users.findIndex(u => u.userId === action.payload.userId);
        //     if (index !== -1) {
        //         // Simplistic update, just replace with basic info, detail DTO not available here
        //         state.paginatedUsers.users[index] = {
        //             ...state.paginatedUsers.users[index],
        //             ...action.payload.updatedData, // Assuming updatedData from thunk is like UpdateUserDto
        //              role: action.payload.updatedData.role,
        //              isActive: action.payload.updatedData.isActive
        //         };
        //     }
        // })
        // .addCase(updateUser.rejected, (state, action) => { state.loadingSubmit = false; state.errorSubmit = action.payload; }) // Use errorSubmit
        
        .addCase(updateUserWithAssignments.pending, (state) => { state.loadingUpdate = true; state.errorUpdate = null;})
        .addCase(updateUserWithAssignments.fulfilled, (state, action) => {
            state.loadingUpdate = false;
            // currentUserDetails will be updated by the fetchUserDetails dispatched in the thunk
            // Optionally, update paginatedUsers list if display fields (role, isActive) changed
            const index = state.paginatedUsers.users.findIndex(u => u.userId === action.payload.userId);
            if (index !== -1) {
                // Merge only the fields that UserListDto has and UpdateUserDto affects
                state.paginatedUsers.users[index] = {
                    ...state.paginatedUsers.users[index],
                    role: action.payload.updatedData.role,
                    isActive: action.payload.updatedData.isActive,
                };
            }
        })
        .addCase(updateUserWithAssignments.rejected, (state, action) => { state.loadingUpdate = false; state.errorUpdate = action.payload; })
         
        // Admin Reset Password
        .addCase(adminResetPassword.pending, (state) => { state.loadingReset = true; state.errorReset = null;})
        .addCase(adminResetPassword.fulfilled, (state, action) => { state.loadingReset = false; /* Password changed flag is on backend user */ })
        .addCase(adminResetPassword.rejected, (state, action) => { state.loadingReset = false; state.errorReset = action.payload; });


            // // Fetch Paginated Users
            // .addCase(fetchPaginatedUsers.pending, (state) => { state.loadingList = true; state.errorList = null;})
            // .addCase(fetchPaginatedUsers.fulfilled, (state, action) => { state.loadingList = false; state.paginatedUsers = action.payload; })
            // .addCase(fetchPaginatedUsers.rejected, (state, action) => { state.loadingList = false; state.errorList = action.payload; })
            // // Fetch User Details
            // .addCase(fetchUserDetails.pending, (state) => { state.loadingDetails = true; state.errorDetails = null;})
            // .addCase(fetchUserDetails.fulfilled, (state, action) => { state.loadingDetails = false; state.currentUserDetails = action.payload; })
            // .addCase(fetchUserDetails.rejected, (state, action) => { state.loadingDetails = false; state.errorDetails = action.payload; })
            // // Update User Assignments
            // .addCase(updateUserAssignments.pending, (state) => { state.loadingUpdate = true; state.errorUpdate = null;})
            // .addCase(updateUserAssignments.fulfilled, (state, action) => { state.loadingUpdate = false; state.currentUserDetails = null; /* Optionally update list or details state */ })
            // .addCase(updateUserAssignments.rejected, (state, action) => { state.loadingUpdate = false; state.errorUpdate = action.payload; })
            //  // Reset Password
            // .addCase(resetUserPassword.pending, (state) => { state.loadingReset = true; state.errorReset = null;})
            // .addCase(resetUserPassword.fulfilled, (state, action) => { state.loadingReset = false; /* Maybe show success message? */ })
            // .addCase(resetUserPassword.rejected, (state, action) => { state.loadingReset = false; state.errorReset = action.payload; });
    },
});

export const { clearUserDetails, clearUserSubmitError, clearUserResetError, clearUserListError, clearUserUpdateError  } = userSlice.actions;
export default userSlice.reducer;


// --- Selectors ---
export const selectPaginatedUsers = (state) => state.users.paginatedUsers;
export const selectCurrentUserDetails = (state) => state.users.currentUserDetails;
export const selectUserLoadingList = (state) => state.users.loadingList;
export const selectUserErrorList = (state) => state.users.errorList;
export const selectUserLoadingDetails = (state) => state.users.loadingDetails;
export const selectUserErrorDetails = (state) => state.users.errorDetails;

export const selectUserLoadingUpdate = (state) => state.users.loadingUpdate;
export const selectUserErrorUpdate = (state) => state.users.errorUpdate;

// --- New Selectors for Add/Update actions ---
export const selectUserLoadingSubmit = (state) => state.users.loadingSubmit;
export const selectUserErrorSubmit = (state) => state.users.errorSubmit;
// --- End New Selectors ---

export const selectUserLoadingReset = (state) => state.users.loadingReset;
export const selectUserErrorReset = (state) => state.users.errorReset;