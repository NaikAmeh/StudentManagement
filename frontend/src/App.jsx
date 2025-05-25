// src/App.js
import {React, useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Use Redux hook
import { selectIsAuthenticated, selectAuthLoading, selectCurrentUser, selectDefaultSchoolId  } from './store/slices/authSlice'; // Import Redux selectors
import { fetchSchools, selectAvailableSchools, setSelectedSchool } from './store/slices/schoolSlice'; // Import school-related actions and selectors
import { fetchStudentsBySchool } from './store/slices/studentSlice';

// Import Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StudentListPage from './pages/students/StudentListPage';
import StudentAddEditPage from './pages/students/StudentAddEditPage'; 
import NotFoundPage from './pages/NotFoundPage';
// Import Add/Edit pages later...
//  import StudentAddEditPage from './pages/students/StudentAddEditPage';
// import UserListPage from './pages/Users/UserListPage';    
// import UserFormPage from './pages/Users/UserFormPage';
import UserListPage from './pages/Users/UserListPage'; // <-- Import
//import ForcePasswordChangePage from './pages/auth/ForcePasswordChangePage'; // <-- Import
import SwitchSchoolPopup from './pages/School/SwitchSchoolPopup'; // Import the popup component


// Import Layouts
import MainLayout from './layouts/MainLayout';

// Protected Route Component using Redux state
function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading); // Optional: Use loading state
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation(); // Use the `useLocation` hook to get the current location


  // Optional: Show loading indicator while auth state might be resolving initially
  // This depends on how robust your initial state loading is in the slice.
  // if (loading) {
  //   return <div>Authenticating...</div>;
  // }

  // return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  if (!isAuthenticated) {
    // Not logged in, redirect to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.isPasswordChangeRequired && location.pathname !== '/force-password-change') {
    // Logged in, but must change password, and not already on the change page
    return <Navigate to="/force-password-change" replace />;
  }

  if (!currentUser?.isPasswordChangeRequired && location.pathname === '/force-password-change') {
      // Logged in, doesn't need to change password, but trying to access change page -> go home
      return <Navigate to="/" replace />;
  }

  // Authenticated and password change not required (or already on the correct page)
  return <Outlet />; // Render the intended child route
}

// Layout component for public pages like Login
function PublicLayout() {
  return <Outlet />;
}

function App() {
  //const [selectedSchool, setSelectedSchool] = useState({ id: 1, name: 'School A' });

  const dispatch = useDispatch();
  const defaultSchoolId = useSelector(selectDefaultSchoolId); // Get DefaultSchoolId from Redux
  const availableSchools = useSelector(selectAvailableSchools); // Get available schools from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated); // Check if the user is authenticated
  const currentUser = useSelector(selectCurrentUser); // Get the current user
console.log("currentUser",defaultSchoolId);
  const [selectedSchool, setSelectedSchool] = useState({}); // Initially no school selected
  const [isSwitchSchoolPopupOpen, setIsSwitchSchoolPopupOpen] = useState(false);

  useEffect(() => {
    console.log("🚀 useEffect called");
  }, []);

  useEffect(() => {
    setIsSwitchSchoolPopupOpen(true);
    
    console.log("initial load default", isSwitchSchoolPopupOpen);
    // Fetch available schools if DefaultSchoolId is null
    if (defaultSchoolId === null && isAuthenticated) {
      console.log("fdfdffd",defaultSchoolId);
      dispatch(fetchSchools());
    }
  }, [defaultSchoolId, isAuthenticated, dispatch]);
  
  useEffect(() => {
    console.log("isSwitchSchoolPopupOpen updated:", isSwitchSchoolPopupOpen);
  }, [isSwitchSchoolPopupOpen]);

  useEffect(() => {
    console.log("fdfdffd",defaultSchoolId);
    // Show the popup if no school is selected and schools are available
    if (defaultSchoolId === null && availableSchools.length > 0) {
      setIsSwitchSchoolPopupOpen(true);
    }
  }, [defaultSchoolId, availableSchools]);

  const handleSwitchSchool = (school) => {
    debugger;
    console.log("handleSwitchSchool",defaultSchoolId);
    //const selected = availableSchools.find((school) => school.schoolId === schoolId);
    if (school) {
      //dispatch(setSelectedSchool(school.schoolId)); // Set the selected school in Redux
      setSelectedSchool(school); // Update local state
      setIsSwitchSchoolPopupOpen(false); // Close the popup

      // Fetch students for the selected school
    dispatch(fetchStudentsBySchool(school.schoolId));
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <MainLayout
                selectedSchool={selectedSchool}
                onSwitchSchool={handleSwitchSchool}
              />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/students/new" element={<StudentAddEditPage mode="add" />} />
            <Route path="/students/:id/edit" element={<StudentAddEditPage mode="edit" />} />
            <Route path="/users" element={<UserListPage />} />
            {/* Add other protected routes here */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
        {/* <Route path="/force-password-change" element={<ForcePasswordChangePage />} /> */}

        {/* Fallback Not Found for non-matching routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* {isSwitchSchoolPopupOpen && (
        <SwitchSchoolPopup
          isOpen={isSwitchSchoolPopupOpen}
          availableSchools={availableSchools}
          onClose={() => setIsSwitchSchoolPopupOpen(false)}
          onSelectSchool={handleSwitchSchool}
        />
      )} */}
    </Router>
  );
}

export default App;