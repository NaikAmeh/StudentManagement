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

const DEBOUNCE_DELAY = 500;

function UserListPage() {
    const dispatch = useDispatch();
    const { users, currentPage, pageSize, totalCount, totalPages } = useSelector(selectPaginatedUsers);
    const loading = useSelector(selectUserLoadingList);
    const error = useSelector(selectUserErrorList);

    const [filters, setFilters] = useState({ username: '', email: '', role: '', isActive: '' });
    const [sortOrder, setSortOrder] = useState('username_asc');
    const [currentPageState, setCurrentPageState] = useState(1);
    const [pageSizeState, setPageSizeState] = useState(10);
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [resettingPasswordUserId, setResettingPasswordUserId] = useState(null);

    // Debounce filter input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
            if (currentPageState !== 1) setCurrentPageState(1);
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [filters, currentPageState]);

    // Fetch data effect
    useEffect(() => {
        dispatch(clearUserSubmitError());
        const queryParams = {
            PageNumber: currentPageState,
            PageSize: pageSizeState,
            SortOrder: sortOrder,
            ...(debouncedFilters.username && { Username: debouncedFilters.username }),
            ...(debouncedFilters.email && { Email: debouncedFilters.email }),
            ...(debouncedFilters.role && { Role: debouncedFilters.role }),
            ...(debouncedFilters.isActive !== '' && { IsActive: debouncedFilters.isActive === 'true' }),
        };
        dispatch(fetchPaginatedUsers(queryParams));
    }, [dispatch, currentPageState, pageSizeState, sortOrder, debouncedFilters]);

    // Handlers
    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSort = useCallback((field) => {
        setSortOrder((prev) => {
            const currentField = prev.split('_')[0];
            const currentDir = prev.endsWith('_desc') ? 'desc' : 'asc';
            if (field === currentField) return `${field}_${currentDir === 'asc' ? 'desc' : 'asc'}`;
            return `${field}_asc`;
        });
        setCurrentPageState(1);
    }, []);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPageState(newPage);
    }, [totalPages]);

    const handlePageSizeChange = useCallback((e) => {
        setPageSizeState(Number(e.target.value));
        setCurrentPageState(1);
    }, []);

    const openAddModal = () => setShowAddModal(true);
    const closeAddModal = (refreshNeeded = false) => {
        setShowAddModal(false);
        if (refreshNeeded) dispatch(fetchPaginatedUsers({ PageNumber: currentPageState, PageSize: pageSizeState, SortOrder: sortOrder, ...debouncedFilters }));
    };

    const openEditModal = (userId) => setEditingUserId(userId);
    const closeEditModal = (refreshNeeded = false) => {
        setEditingUserId(null);
        if (refreshNeeded) dispatch(fetchPaginatedUsers({ PageNumber: currentPageState, PageSize: pageSizeState, SortOrder: sortOrder, ...debouncedFilters }));
    };

    const openResetPasswordModal = (userId) => setResettingPasswordUserId(userId);
    const closeResetPasswordModal = () => setResettingPasswordUserId(null);

    const renderSortIndicator = (field) => {
        const currentField = sortOrder.split('_')[0];
        if (field !== currentField) return null;
        return sortOrder.endsWith('_desc') ? ' ▼' : ' ▲';
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>User Management</h2>
            <button onClick={openAddModal} style={{ marginBottom: '20px', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add New User</button>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="text" name="username" placeholder="Filter Username..." value={filters.username} onChange={handleFilterChange} style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                <input type="text" name="email" placeholder="Filter Email..." value={filters.email} onChange={handleFilterChange} style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }} />
                <select name="role" value={filters.role} onChange={handleFilterChange} style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="StandardUser">Standard User</option>
                </select>
                <select name="isActive" value={filters.isActive} onChange={handleFilterChange} style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                    <option value="">Any Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: 'red' }}>Error loading users: {error}</p>}

            {!loading && !error && (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('username')}>Username {renderSortIndicator('username')}</th>
                                <th onClick={() => handleSort('email')}>Email {renderSortIndicator('email')}</th>
                                <th onClick={() => handleSort('role')}>Role {renderSortIndicator('role')}</th>
                                <th onClick={() => handleSort('isActive')}>Status {renderSortIndicator('isActive')}</th>
                                <th onClick={() => handleSort('createdAt')}>Created At {renderSortIndicator('createdAt')}</th>
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
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => openEditModal(user.userId)} style={{ marginRight: '5px', backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => openResetPasswordModal(user.userId)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset PW</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No users found.</td></tr>}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Page {currentPage} of {totalPages} (Total: {totalCount} users)</span>
                        <div>
                            <select value={pageSizeState} onChange={handlePageSizeChange} style={{ marginRight: '10px', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}>
                                {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size} per page</option>)}
                            </select>
                            <button onClick={() => handlePageChange(currentPageState - 1)} disabled={currentPageState <= 1} style={{ padding: '8px 15px', marginRight: '5px', borderRadius: '4px', cursor: 'pointer' }}>Previous</button>
                            <button onClick={() => handlePageChange(currentPageState + 1)} disabled={currentPageState >= totalPages || totalPages === 0} style={{ padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </>
            )}

            {showAddModal && <UserAddModal onClose={closeAddModal} />}
            {editingUserId && <UserEditModal userId={editingUserId} onClose={closeEditModal} />}
            {resettingPasswordUserId && <AdminResetPasswordModal userId={resettingPasswordUserId} onClose={closeResetPasswordModal} />}
        </div>
    );
}

export default UserListPage;