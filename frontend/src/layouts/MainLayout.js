import React, { useState, useEffect } from 'react'; // Ensure useState is imported
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import SchoolSelector from '../components/SchoolSelector'; // Ensure this uses Redux too
import SwitchSchoolPopup from '../pages/School/SwitchSchoolPopup'; // Import the new popup component

import '../styles/MainLayout.css'; // Import the CSS file

function MainLayout({ selectedSchool, onSwitchSchool }) {
  const user = useSelector(selectCurrentUser); // Get user from Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated); // Ensure you have this selector
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //const location = useLocation(); // For active link styling

  const [isSwitchSchoolPopupOpen, setIsSwitchSchoolPopupOpen] = useState(false);
  const [availableSchools, setAvailableSchools] = useState([
    { id: 1, name: 'School A' },
    { id: 2, name: 'School B' },
    { id: 3, name: 'School C' },
  ]);

  useEffect(() => {
    console.log("test", user,selectedSchool);
    // Show the popup if the user is an admin and no school is selected
    if (user?.role === 'Admin' && !selectedSchool && availableSchools.length > 0) {
      console.log("school is selected");
      setIsSwitchSchoolPopupOpen(true);
    }
  }, [user, selectedSchool, availableSchools]);

  const handleSchoolSelect = (school) => {
    onSwitchSchool(school); // Call the parent-provided function to switch school
    setIsSwitchSchoolPopupOpen(false); // Close the popup
  };

  const handleLogout = () => {
    dispatch(logout()); // Dispatch Redux action
    navigate('/login');
  };

  // Only render layout if authenticated, otherwise ProtectedRoute handles redirection
  if (!isAuthenticated) {
    return null; // Or a loading spinner if auth state is still resolving
  }

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="header-title">
          <h3>Student ID Management</h3>
          {user && (
            <span className="user-info">
              Welcome, {user.username} ({user.role})
            </span>
          )}
        </div>
        <nav className="layout-nav">
          <Link to="/">Home</Link>
          <Link to="/students">Students</Link>
          <Link to="/students/new">Add Student</Link>
          {/* Add User Management link for Admin users */}
          {user?.role === 'Admin' && <Link to="/users">User Management</Link>}
          <SchoolSelector /> {/* Ensure this uses Redux */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <div className="school-info">
            <span>Current School: {selectedSchool.name}</span>
            <button
              className="switch-school-button"
              onClick={() => setIsSwitchSchoolPopupOpen(true)}
            >
              Switch School
            </button>
          </div>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet /> {/* Renders the matched nested route */}
      </main>
      {/* Use the new SwitchSchoolPopup component */}
      {isSwitchSchoolPopupOpen && (
      <SwitchSchoolPopup
        isOpen={isSwitchSchoolPopupOpen}
        availableSchools={availableSchools}
        onClose={() => setIsSwitchSchoolPopupOpen(false)}
        onSelectSchool={handleSchoolSelect}
      />
    )}
    </div>
  );
}

export default MainLayout;