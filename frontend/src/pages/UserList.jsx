import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, UserPlus, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User', status: 'Active', password: '' });
  const [error, setError] = useState('');

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${search}&role=${roleFilter}&page=${page}`);
      setUsers(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, roleFilter, page]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'User', status: 'Active', password: '' });
    setSelectedUser(null);
    setError('');
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      status: user.status,
      password: ''
    });
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to deactivate user');
      }
    }
  };

  const handleShowDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="user-list-page">
      <header className="page-header flex justify-between items-center">
        <div>
          <h1>User Management</h1>
          <p>Manage application users and their permissions</p>
        </div>
        {currentUser.role === 'Admin' && (
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <UserPlus size={18} />
            <span>Create User</span>
          </button>
        )}
      </header>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="role-filter">
          <Filter size={18} className="filter-icon" />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-10">Loading users...</td></tr>
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleShowDetail(user)} title="View Detail"><Info size={18} /></button>
                    {(currentUser.role === 'Admin' || (currentUser.role === 'Manager' && user.role !== 'Admin')) && (
                      <button onClick={() => handleEdit(user)} title="Edit"><Edit2 size={18} /></button>
                    )}
                    {currentUser.role === 'Admin' && user.id !== currentUser.id && (
                      <button onClick={() => handleDeactivate(user._id)} className="text-red" title="Deactivate"><Trash2 size={18} /></button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center p-10">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={20} /></button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={20} /></button>
      </div>

      {showDetailModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setShowDetailModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
               <div className="detail-grid">
                  <div className="detail-item"><strong>Name:</strong> {selectedUser.name}</div>
                  <div className="detail-item"><strong>Email:</strong> {selectedUser.email}</div>
                  <div className="detail-item"><strong>Role:</strong> {selectedUser.role}</div>
                  <div className="detail-item"><strong>Status:</strong> {selectedUser.status}</div>
                  <div className="detail-item"><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                  <div className="detail-item"><strong>Created By:</strong> {selectedUser.createdBy?.name || 'System'}</div>
                  <div className="detail-item"><strong>Last Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</div>
                  <div className="detail-item"><strong>Updated By:</strong> {selectedUser.updatedBy?.name || 'System'}</div>
               </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedUser ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            {error && <div className="error-message mb-4">{error}</div>}
            <form onSubmit={handleCreateOrUpdate} className="user-form">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
              {!selectedUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                  />
                </div>
              )}
              {currentUser.role === 'Admin' && (
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">
                {selectedUser ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
