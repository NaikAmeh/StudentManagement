// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // Use configured Axios instance

// --- Async Thunk for Login ---
// createAsyncThunk handles async request lifecycles (pending, fulfilled, rejected)
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    // Payload creator function: receives args passed to dispatch(loginUser(...))
    // and thunkAPI object ({ dispatch, getState, rejectWithValue, etc.})
    async ({ usernameOrEmail, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/auth/login', { usernameOrEmail, password });
           // debugger;
            if (response.data && response.data.success && response.data.token) {
                // Store token and user data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('authUser', JSON.stringify(response.data.user));
                localStorage.setItem('defaultSchoolId', response.data.defaultSchoolId || ''); // Store DefaultSchoolId

                // Return the relevant data to be stored in the Redux state
                return {
                    token: response.data.token,
                    user: response.data.user,
                    defaultSchoolId: response.data.defaultSchoolId || null, // Include DefaultSchoolId
                };
            } else {
                // Use rejectWithValue to pass specific error payload on failure
                return rejectWithValue(response.data?.message || 'Login failed: Invalid response format.');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An error occurred during login.';
            return rejectWithValue(message);
        }
    }
);

export const forcePasswordChange = createAsyncThunk(
    'auth/forcePasswordChange',
    async (forceChangeDto, { rejectWithValue }) => { // forceChangeDto matches backend DTO
        try {
            console.log("Redux Thunk: Forcing password change");
            await api.post('/api/auth/force-password-change', forceChangeDto);
            // On success, the flag IsPasswordChangeRequired should be false.
            // We might need to re-fetch user or update the local user state.
            // For simplicity now, we'll rely on re-login which should fetch fresh user data.
            return true; // Indicate success
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to change password.';
            console.error("Redux Thunk: Force password change failed:", message);
            return rejectWithValue(message);
        }
    }
);

// --- Auth Slice Definition ---
const initialState = {
    user: JSON.parse(localStorage.getItem('authUser') || 'null'), // Load initial state from storage
    token: localStorage.getItem('authToken') || null,
    defaultSchoolId: localStorage.getItem('defaultSchoolId') || null, // Load DefaultSchoolId from storage
    loading: false, // Indicates loading state for async operations like login
    error: null, // Stores login/auth error messages
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    // Reducers for synchronous actions (directly modify state)
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.defaultSchoolId = null; // Clear DefaultSchoolId on logout
            state.error = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            console.log("User logged out via Redux.");
        },
        // You could add other sync reducers here if needed
         clearAuthError: (state) => {
             state.error = null;
         }
    },
    // Extra reducers handle actions defined elsewhere (like createAsyncThunk actions)
    extraReducers: (builder) => {
        builder
            // Handle loginUser lifecycle
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null; // Clear previous errors on new attempt
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user; // Update state with payload from thunk
                state.token = action.payload.token;
                state.defaultSchoolId = action.payload.defaultSchoolId; // Set DefaultSchoolId in state
                state.error = null;
                 console.log("Redux login fulfilled:", action.payload.user);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null; // Clear user/token on failed login
                state.token = null;
                state.defaultSchoolId = null; // Clear DefaultSchoolId on failed login
                state.error = action.payload || 'Login failed.'; // Store error message from rejectWithValue
                 console.error("Redux login rejected:", action.payload);
            })
        // Handle other async thunks (e.g., registerUser, verifyToken) here
        .addCase(forcePasswordChange.pending, (state) => {
            state.loading = true; // Use general auth loading
            state.error = null;
        })
        .addCase(forcePasswordChange.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
            // User flag IsPasswordChangeRequired is updated on backend.
            // For frontend state, upon next login/token refresh, it will be correct.
            // OR, if the /auth/me endpoint is called after this, it would refresh user.
            // For now, we expect user to log out/re-login.
            if(state.user) state.user.isPasswordChangeRequired = false; // Optimistically update if user object exists
        })
        .addCase(forcePasswordChange.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Password change failed.';
        });
    },
});

// Export synchronous actions
export const { logout, clearAuthError } = authSlice.actions;

// Export reducer to be included in the store
export default authSlice.reducer;

// Export selectors (optional but good practice)
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectDefaultSchoolId = (state) => state.auth.defaultSchoolId; // Selector for DefaultSchoolId
export const selectIsAuthenticated = (state) => !!state.auth.token && !!state.auth.user; //Double negation converts to boolean
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;