import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchPaginatedUsers,
    selectPaginatedUsers,
    selectUserLoadingList,
    selectUserErrorList,
    clearUserSubmitError,
} from '../../store/slices/userSlice';
import UserAddModal from './UserAddModal';
import UserEditModal from './UserEditModal';
import AdminResetPasswordModal from './AdminResetPasswordModal';

function UserListPage() {
    const dispatch = useDispatch();
    const { users, currentPage, pageSize, totalCount, totalPages } = useSelector(selectPaginatedUsers);
    const loading = useSelector(selectUserLoadingList);
    const error = useSelector(selectUserErrorList);

    const [filters, setFilters] = useState({ username: '', email: '', role: '', isActive: '' });
    const [tempFilters, setTempFilters] = useState(filters); // Temporary filters for the modal
    const [sortOrder, setSortOrder] = useState('username_asc');
    const [currentPageState, setCurrentPageState] = useState(1);
    const [pageSizeState, setPageSizeState] = useState(10);
    const [showFilterModal, setShowFilterModal] = useState(false); // State to show/hide filter modal
    const [filterField, setFilterField] = useState(''); // Field being filtered

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [resettingPasswordUserId, setResettingPasswordUserId] = useState(null);

    // Fetch data effect
    useEffect(() => {
        const queryParams = {
            PageNumber: currentPageState,
            PageSize: pageSizeState,
            SortOrder: sortOrder,
            ...(filters.username && { Username: filters.username }),
            ...(filters.email && { Email: filters.email }),
            ...(filters.role && { Role: filters.role }),
            ...(filters.isActive !== '' && { IsActive: filters.isActive === 'true' }),
        };
        dispatch(fetchPaginatedUsers(queryParams));
    }, [dispatch, currentPageState, pageSizeState, sortOrder, filters]);

    // Handlers
    const handleSort = useCallback((field) => {
        setSortOrder((prev) => {
            const currentField = prev.split('_')[0];
            const currentDir = prev.endsWith('_desc') ? 'desc' : 'asc';
            if (field === currentField) return `${field}_${currentDir === 'asc' ? 'desc' : 'asc'}`;
            return `${field}_asc`;
        });
        setCurrentPageState(1);
    }, []);

    const handleFilterChange = (e) => {
        const { value } = e.target;
        setTempFilters((prev) => ({ ...prev, [filterField]: value }));
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters); // Apply the temporary filters
        setShowFilterModal(false); // Close the filter modal
    };

    const handleCancelFilters = () => {
        setTempFilters(filters); // Reset temporary filters to the current filters
        setShowFilterModal(false); // Close the filter modal
    };

    const openFilterModal = (field) => {
        setFilterField(field); // Set the field being filtered
        setShowFilterModal(true); // Open the filter modal
    };

    const openAddModal = () => setShowAddModal(true);
        const closeAddModal = (refreshNeeded = false) => {
            setShowAddModal(false);
            if (refreshNeeded) dispatch(fetchPaginatedUsers({ PageNumber: currentPageState, PageSize: pageSizeState, SortOrder: sortOrder, ...debouncedFilters }));
        };
    
    const openResetPasswordModal = (userId) => setResettingPasswordUserId(userId);
    const closeResetPasswordModal = () => setResettingPasswordUserId(null);

    const renderSortIndicator = (field) => {
        const currentField = sortOrder.split('_')[0];
        if (field !== currentField) return null;
        return sortOrder.endsWith('_desc') ? ' ▼' : ' ▲';
    };

    const openEditModal = (userId) => setEditingUserId(userId);
        const closeEditModal = (refreshNeeded = false) => {
            setEditingUserId(null);
            if (refreshNeeded) dispatch(fetchPaginatedUsers({ PageNumber: currentPageState, PageSize: pageSizeState, SortOrder: sortOrder, ...debouncedFilters }));
        };
    return (
        <div style={{ padding: '20px' }}>
            <h2>User Management</h2>
            <button onClick={() => setShowAddModal(true)} style={{ marginBottom: '20px', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add New User</button>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: 'red' }}>Error loading users: {error}</p>}

            {!loading && !error && (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th>
                                    <span onClick={() => openFilterModal('username')} style={{ cursor: 'pointer' }}>Username</span>
                                    <span onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>{renderSortIndicator('username')}</span>
                                </th>
                                <th>
                                    <span onClick={() => openFilterModal('email')} style={{ cursor: 'pointer' }}>Email</span>
                                    <span onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>{renderSortIndicator('email')}</span>
                                </th>
                                <th>
                                    <span onClick={() => openFilterModal('role')} style={{ cursor: 'pointer' }}>Role</span>
                                    <span onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>{renderSortIndicator('role')}</span>
                                </th>
                                <th>
                                    <span onClick={() => openFilterModal('isActive')} style={{ cursor: 'pointer' }}>Status</span>
                                    <span onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }}>{renderSortIndicator('isActive')}</span>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.userId}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                                    <td>
                                        <button onClick={() => openEditModal(user.userId)} style={{ marginRight: '5px', backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => openResetPasswordModal(user.userId)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset PW</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users found.</td></tr>}
                        </tbody>
                    </table>
                </>
            )}

            {showFilterModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        minWidth: '400px',
                    }}>
                        <h3>Filter by {filterField}</h3>
                        {filterField === 'role' || filterField === 'isActive' ? (
                            <select
                                value={tempFilters[filterField]}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px' }}
                            >
                                {filterField === 'role' ? (
                                    <>
                                        <option value="">All Roles</option>
                                        <option value="Admin">Admin</option>
                                        <option value="StandardUser">Standard User</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="">Any Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </>
                                )}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={tempFilters[filterField]}
                                onChange={handleFilterChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px' }}
                            />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={handleCancelFilters} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleApplyFilters} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && <UserAddModal onClose={closeAddModal} />}
            {editingUserId && <UserEditModal userId={editingUserId} onClose={closeEditModal} />}
            {resettingPasswordUserId && <AdminResetPasswordModal userId={resettingPasswordUserId} onClose={closeResetPasswordModal} />}
        
        </div>
    );
}

export default UserListPage;