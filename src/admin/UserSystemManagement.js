// UserSystemManagement.js - UPDATED FOR YOUR ACTUAL SCHEMA
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  FaUser, FaSearch, FaTimes, FaUserPlus, FaCheckCircle, 
  FaExclamationTriangle, FaDatabase, FaShieldAlt, FaEnvelope, FaPhone,
  FaTrash, FaEye, FaStar, FaSync, FaEdit, FaLock, FaUnlock, FaCalendarAlt,
  FaShoppingBag, FaTools, FaUserCheck, FaUserTimes, FaUserClock, FaKey
} from 'react-icons/fa';

const UserSystemManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user'
  });
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [syncInfo, setSyncInfo] = useState({
    status: 'idle',
    message: '',
    lastSync: null
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    verified: 0,
    pending: 0
  });

  // Load users from your actual users table
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setSyncInfo({ ...syncInfo, status: 'syncing', message: 'Loading users...' });
      
      console.log('🚀 Loading users from Supabase...');
      
      // Fetch from 'users' table with ALL your columns
      const { data, error: dbError } = await supabase
        .from('users')
        .select(`
          id, email, full_name, phone, role, is_admin, is_active,
          email_verified, phone_verified, created_at, updated_at,
          verified_at, email_verification_token, phone_verification_code,
          verification_sent_at, phone_verification_sent_at
        `)
        .order('created_at', { ascending: false });
      
      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      if (data && data.length > 0) {
        setUsers(data);
        
        // Calculate statistics
        const stats = {
          total: data.length,
          admins: data.filter(u => u.is_admin || u.role === 'admin').length,
          active: data.filter(u => u.is_active).length,
          verified: data.filter(u => u.email_verified).length,
          pending: data.filter(u => !u.email_verified).length
        };
        setUserStats(stats);
        
        setSyncInfo({
          status: 'success',
          message: `Loaded ${data.length} users`,
          lastSync: new Date()
        });
        
        console.log(`✅ Loaded ${data.length} users`);
      } else {
        console.log('📭 No users found in database');
        setUsers([]);
        setUserStats({
          total: 0,
          admins: 0,
          active: 0,
          verified: 0,
          pending: 0
        });
        setSyncInfo({
          status: 'success',
          message: 'No users found',
          lastSync: new Date()
        });
      }
      
    } catch (err) {
      console.error('❌ Error loading users:', err);
      setError(`Failed to load users: ${err.message}`);
      setSyncInfo({ ...syncInfo, status: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Create new user in YOUR users table
  const createUser = async () => {
    try {
      if (!newUser.email) {
        setError('Email is required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', newUser.email);

      if (existingUsers && existingUsers.length > 0) {
        setError('User with this email already exists');
        return;
      }

      // Create user object matching YOUR schema
      const userRecord = {
        email: newUser.email.toLowerCase().trim(),
        full_name: newUser.full_name?.trim() || '',
        phone: newUser.phone?.trim() || '',
        role: newUser.role || 'user',
        is_admin: newUser.role === 'admin',
        is_active: true,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into YOUR users table
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([userRecord])
        .select();

      if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

      // Update local state
      if (data && data[0]) {
        setUsers([data[0], ...users]);
        setUserStats(prev => ({
          ...prev,
          total: prev.total + 1,
          active: prev.active + 1,
          pending: prev.pending + 1
        }));
      }
      
      // Reset form
      setNewUser({
        email: '',
        full_name: '',
        phone: '',
        role: 'user'
      });
      setShowAddUser(false);
      setError(null);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
    }
  };

  // Update user
  const updateUser = async (userId, updates) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, ...updateData } : u
      ));

      // Update stats if needed
      if (updates.hasOwnProperty('is_active')) {
        setUserStats(prev => ({
          ...prev,
          active: updates.is_active ? prev.active + 1 : prev.active - 1
        }));
      }

      if (updates.hasOwnProperty('role') || updates.hasOwnProperty('is_admin')) {
        const updatedUser = users.find(u => u.id === userId);
        const isAdmin = updates.is_admin || (updates.role === 'admin');
        const wasAdmin = updatedUser.is_admin || updatedUser.role === 'admin';
        
        if (isAdmin !== wasAdmin) {
          setUserStats(prev => ({
            ...prev,
            admins: isAdmin ? prev.admins + 1 : prev.admins - 1
          }));
        }
      }

      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setEditUser(null);
      setShowEditUser(false);

    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Remove from local state
      const deletedUser = users.find(u => u.id === userId);
      setUsers(users.filter(u => u.id !== userId));
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        total: prev.total - 1,
        admins: deletedUser.is_admin ? prev.admins - 1 : prev.admins,
        active: deletedUser.is_active ? prev.active - 1 : prev.active,
        verified: deletedUser.email_verified ? prev.verified - 1 : prev.verified,
        pending: !deletedUser.email_verified ? prev.pending - 1 : prev.pending
      }));

      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  // Toggle user active status
  const toggleUserActive = async (user) => {
    try {
      const newActiveStatus = !user.is_active;
      await updateUser(user.id, { is_active: newActiveStatus });
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message);
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (user) => {
    try {
      const newAdminStatus = !user.is_admin;
      const newRole = newAdminStatus ? 'admin' : 'user';
      
      await updateUser(user.id, { 
        is_admin: newAdminStatus,
        role: newRole
      });
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setError(err.message);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  // Render user card
  const renderUserCard = (user) => (
    <div key={user.id} className="user-card">
      <div className="user-header">
        <div className="user-avatar">
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          {!user.is_active && <div className="inactive-overlay">🚫</div>}
        </div>
        <div className="user-info">
          <div className="user-name-row">
            <span className="user-name">
              {user.full_name || user.email}
              {!user.email_verified && <span className="verification-badge">✉️</span>}
            </span>
            <div className="user-badges">
              {user.is_admin && (
                <span className="admin-badge">
                  <FaShieldAlt size={10} /> Admin
                </span>
              )}
              {!user.is_active && (
                <span className="inactive-badge">
                  <FaUserTimes size={10} /> Inactive
                </span>
              )}
            </div>
          </div>
          <div className="user-email">
            <FaEnvelope size={12} /> {user.email}
          </div>
          {user.phone && (
            <div className="user-phone">
              <FaPhone size={12} /> {user.phone}
              {user.phone_verified && <span className="verified-check">✓</span>}
            </div>
          )}
          <div className="user-meta">
            <span className="user-role">
              Role: <span className={`role-tag ${user.role}`}>{user.role}</span>
            </span>
            <span className="user-created">
              <FaCalendarAlt size={10} /> {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="user-footer">
        <div className="user-actions">
          <button 
            className="btn-view"
            onClick={() => {
              setSelectedUser(user);
              setIsModalOpen(true);
            }}
          >
            <FaEye size={12} /> View
          </button>
          
          <button 
            className="btn-edit"
            onClick={() => {
              setEditUser(user);
              setShowEditUser(true);
            }}
          >
            <FaEdit size={12} /> Edit
          </button>
          
          <button 
            className={`btn-status ${user.is_active ? 'active' : 'inactive'}`}
            onClick={() => toggleUserActive(user)}
            title={user.is_active ? 'Deactivate User' : 'Activate User'}
          >
            {user.is_active ? <FaUnlock size={12} /> : <FaLock size={12} />}
          </button>
          
          <button 
            className="btn-delete"
            onClick={() => deleteUser(user.id)}
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">
          {syncInfo.status === 'syncing' ? syncInfo.message : 'Loading users...'}
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="header">
        <h1>
          <FaUser /> User Management
        </h1>
        <div className="subtitle">
          Manage your application users and their permissions
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card admins">
          <div className="stat-icon">
            <FaShieldAlt />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.active}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        
        <div className="stat-card verified">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{userStats.verified}</div>
            <div className="stat-label">Email Verified</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {syncInfo.message && (
        <div className={`status-bar ${syncInfo.status}`}>
          <div className="status-content">
            {syncInfo.status === 'syncing' && <span className="spinning">⟳</span>}
            {syncInfo.status === 'success' && <FaCheckCircle />}
            {syncInfo.status === 'error' && <FaExclamationTriangle />}
            <span>{syncInfo.message}</span>
            {syncInfo.lastSync && (
              <span className="sync-time">
                Last sync: {syncInfo.lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="success-alert">
          <FaCheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search users by email, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>
        
        <div className="toolbar-actions">
          <button 
            className="btn-refresh"
            onClick={loadUsers}
            disabled={syncInfo.status === 'syncing'}
          >
            <FaSync className={syncInfo.status === 'syncing' ? 'spinning' : ''} /> Refresh
          </button>
          
          <button 
            className="btn-add"
            onClick={() => setShowAddUser(true)}
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <FaSearch size={60} />
              <h3>No users found</h3>
              <p>No users match your search criteria</p>
              <button 
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <FaUser size={60} />
              <h3>No users yet</h3>
              <p>Start by adding your first user</p>
              <button 
                className="btn-add-first"
                onClick={() => setShowAddUser(true)}
              >
                <FaUserPlus /> Add First User
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="users-info">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="users-grid">
            {filteredUsers.map(renderUserCard)}
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal user-detail-modal">
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="user-avatar-large">
                {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || 'U'}
                {!selectedUser.is_active && <div className="inactive-overlay-large">🚫</div>}
              </div>
              
              <div className="detail-grid">
                <div className="detail-row">
                  <label>Email:</label>
                  <span>
                    {selectedUser.email}
                    {selectedUser.email_verified && (
                      <span className="verified-tag">✓ Verified</span>
                    )}
                  </span>
                </div>
                
                <div className="detail-row">
                  <label>Full Name:</label>
                  <span>{selectedUser.full_name || '-'}</span>
                </div>
                
                <div className="detail-row">
                  <label>Phone:</label>
                  <span>
                    {selectedUser.phone || '-'}
                    {selectedUser.phone_verified && (
                      <span className="verified-tag">✓ Verified</span>
                    )}
                  </span>
                </div>
                
                <div className="detail-row">
                  <label>Role:</label>
                  <span className={`role-badge ${selectedUser.role} ${selectedUser.is_admin ? 'admin' : ''}`}>
                    {selectedUser.role} {selectedUser.is_admin && '(Admin)'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <label>Created:</label>
                  <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
                </div>
                
                <div className="detail-row">
                  <label>Last Updated:</label>
                  <span>{new Date(selectedUser.updated_at).toLocaleString()}</span>
                </div>
                
                {selectedUser.verified_at && (
                  <div className="detail-row">
                    <label>Verified At:</label>
                    <span>{new Date(selectedUser.verified_at).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <label>User ID:</label>
                  <span className="user-id">{selectedUser.id}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-edit-modal"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditUser(selectedUser);
                  setShowEditUser(true);
                }}
              >
                <FaEdit /> Edit User
              </button>
              <button 
                className="btn-close-modal" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal add-user-modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button onClick={() => setShowAddUser(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              {error && (
                <div className="error-alert-modal">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
                <div className="form-hint">Required. Must be a valid email address.</div>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  placeholder="Optional"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="Optional (e.g., +1234567890)"
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <div className="form-hint">Administrators have full system access.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowAddUser(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={createUser}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editUser && (
        <div className="modal-overlay">
          <div className="modal edit-user-modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setShowEditUser(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  disabled
                />
                <div className="form-hint">Email cannot be changed.</div>
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editUser.full_name || ''}
                  onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Admin Status</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="admin-toggle"
                      checked={editUser.is_admin}
                      onChange={(e) => setEditUser({...editUser, is_admin: e.target.checked})}
                    />
                    <label htmlFor="admin-toggle" className="toggle-label">
                      {editUser.is_admin ? 'Admin User' : 'Regular User'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Account Status</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="active-toggle"
                      checked={editUser.is_active}
                      onChange={(e) => setEditUser({...editUser, is_active: e.target.checked})}
                    />
                    <label htmlFor="active-toggle" className="toggle-label">
                      {editUser.is_active ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email Verified</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="email-verified-toggle"
                      checked={editUser.email_verified}
                      onChange={(e) => setEditUser({...editUser, email_verified: e.target.checked})}
                    />
                    <label htmlFor="email-verified-toggle" className="toggle-label">
                      {editUser.email_verified ? 'Verified' : 'Unverified'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowEditUser(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-delete-modal"
                onClick={() => deleteUser(editUser.id)}
              >
                <FaTrash /> Delete User
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => updateUser(editUser.id, {
                  full_name: editUser.full_name,
                  phone: editUser.phone,
                  role: editUser.role,
                  is_admin: editUser.is_admin,
                  is_active: editUser.is_active,
                  email_verified: editUser.email_verified
                })}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .user-management {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0077b6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 16px;
          color: #6b7280;
          font-size: 14px;
        }

        .header {
          margin-bottom: 24px;
          text-align: center;
        }

        .header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #1f2937;
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-card.total { border-left: 4px solid #0077b6; }
        .stat-card.admins { border-left: 4px solid #dc2626; }
        .stat-card.active { border-left: 4px solid #10b981; }
        .stat-card.verified { border-left: 4px solid #f59e0b; }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .total .stat-icon { background: #0077b6; }
        .admins .stat-icon { background: #dc2626; }
        .active .stat-icon { background: #10b981; }
        .verified .stat-icon { background: #f59e0b; }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        /* Status Bar */
        .status-bar {
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .status-bar.syncing {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }

        .status-bar.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-bar.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .sync-time {
          margin-left: auto;
          font-size: 13px;
          opacity: 0.8;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        /* Alerts */
        .error-alert, .success-alert {
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .error-alert {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .success-alert {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .error-alert button, .success-alert button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .error-alert button:hover, .success-alert button:hover {
          opacity: 1;
        }

        /* Toolbar */
        .toolbar {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 0 16px;
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: #0077b6;
        }

        .search-box input {
          flex: 1;
          padding: 14px 12px;
          border: none;
          background: none;
          outline: none;
          font-size: 15px;
          color: #374151;
        }

        .clear-search {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-search:hover {
          color: #64748b;
        }

        .toolbar-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-refresh {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-add {
          background: #0077b6;
          color: white;
        }

        .btn-add:hover {
          background: #005a8c;
        }

        /* Users Info */
        .users-info {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
          padding: 0 8px;
        }

        /* Users Grid */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .user-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .user-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transform: translateY(-4px);
        }

        .user-header {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .user-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077b6, #00b4d8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          flex-shrink: 0;
          position: relative;
        }

        .inactive-overlay {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 2px solid white;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .user-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .verification-badge {
          font-size: 12px;
          opacity: 0.7;
        }

        .user-badges {
          display: flex;
          gap: 6px;
          margin-left: auto;
        }

        .admin-badge, .inactive-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .admin-badge {
          background: #fee2e2;
          color: #dc2626;
        }

        .inactive-badge {
          background: #f3f4f6;
          color: #6b7280;
        }

        .user-email, .user-phone {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .verified-check {
          color: #10b981;
          font-weight: bold;
          margin-left: 4px;
        }

        .user-meta {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          font-size: 13px;
        }

        .user-role {
          color: #6b7280;
        }

        .user-created {
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .role-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 6px;
        }

        .role-tag.user { background: #e0f2fe; color: #0369a1; }
        .role-tag.admin { background: #fee2e2; color: #dc2626; }
        .role-tag.manager { background: #fef3c7; color: #92400e; }
        .role-tag.staff { background: #d1fae5; color: #065f46; }

        .user-footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
        }

        .user-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-view, .btn-edit, .btn-status, .btn-delete {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-view {
          background: #10b981;
          color: white;
        }

        .btn-view:hover {
          background: #0da271;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .btn-status {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-status:hover {
          background: #e5e7eb;
        }

        .btn-status.active:hover {
          background: #fecaca;
          color: #dc2626;
        }

        .btn-status.inactive:hover {
          background: #bbf7d0;
          color: #065f46;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 40px;
          color: #6b7280;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-top: 20px;
        }

        .empty-state h3 {
          margin: 20px 0 12px;
          color: #374151;
          font-size: 24px;
        }

        .empty-state p {
          color: #9ca3af;
          font-size: 16px;
          margin-bottom: 30px;
        }

        .btn-clear-search, .btn-add-first {
          background: #0077b6;
          color: white;
          padding: 14px 28px;
          font-size: 16px;
          border-radius: 10px;
          margin: 0 auto;
        }

        .btn-clear-search:hover, .btn-add-first:hover {
          background: #005a8c;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: modalFadeIn 0.3s ease;
        }

        .user-detail-modal, .add-user-modal, .edit-user-modal {
          max-width: 600px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 32px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #0077b6 0%, #00b4d8 100%);
          color: white;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .modal-header button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .modal-header button:hover {
          background: rgba(255,255,255,0.3);
        }

        .modal-content {
          padding: 32px;
          max-height: calc(90vh - 140px);
          overflow-y: auto;
        }

        .user-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077b6, #00b4d8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: bold;
          margin: 0 auto 32px;
          position: relative;
        }

        .inactive-overlay-large {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 3px solid white;
        }

        .detail-grid {
          display: grid;
          gap: 16px;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .detail-row span {
          color: #6b7280;
          font-size: 15px;
          word-break: break-word;
        }

        .verified-tag {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 10px;
        }

        .role-badge, .status-badge {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
        }

        .role-badge.user { background: #e0f2fe; color: #0369a1; }
        .role-badge.admin { background: #fee2e2; color: #dc2626; }
        .role-badge.manager { background: #fef3c7; color: #92400e; }
        .role-badge.staff { background: #d1fae5; color: #065f46; }

        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #fee2e2; color: #dc2626; }

        .user-id {
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          background: #f3f4f6;
          padding: 10px;
          border-radius: 6px;
          color: #6b7280;
          display: block;
          word-break: break-all;
        }

        .modal-footer {
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .btn-close-modal, .btn-cancel {
          background: #6b7280;
          color: white;
        }

        .btn-close-modal:hover, .btn-cancel:hover {
          background: #4b5563;
        }

        .btn-edit-modal, .btn-confirm {
          background: #0077b6;
          color: white;
        }

        .btn-edit-modal:hover, .btn-confirm:hover {
          background: #005a8c;
        }

        .btn-delete-modal {
          background: #ef4444;
          color: white;
        }

        .btn-delete-modal:hover {
          background: #dc2626;
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          color: #374151;
          background: white;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0077b6;
          box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.1);
        }

        .form-group input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .form-hint {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 6px;
        }

        /* Toggle Switch */
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-switch input[type="checkbox"] {
          display: none;
        }

        .toggle-switch input[type="checkbox"] + .toggle-label {
          position: relative;
          padding-left: 60px;
          cursor: pointer;
          display: inline-block;
          height: 34px;
          line-height: 34px;
        }

        .toggle-switch input[type="checkbox"] + .toggle-label:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 56px;
          height: 34px;
          background: #d1d5db;
          border-radius: 17px;
          transition: background 0.2s;
        }

        .toggle-switch input[type="checkbox"] + .toggle-label:after {
          content: '';
          position: absolute;
          left: 4px;
          top: 4px;
          width: 26px;
          height: 26px;
          background: white;
          border-radius: 13px;
          transition: transform 0.2s;
        }

        .toggle-switch input[type="checkbox"]:checked + .toggle-label:before {
          background: #0077b6;
        }

        .toggle-switch input[type="checkbox"]:checked + .toggle-label:after {
          transform: translateX(22px);
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .detail-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .toolbar {
            flex-direction: column;
            gap: 16px;
          }
          
          .search-box {
            min-width: 100%;
          }
          
          .user-card {
            padding: 20px;
          }
          
          .user-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          
          .user-avatar {
            margin: 0 auto;
          }
          
          .user-badges {
            justify-content: center;
            margin: 8px 0 0;
          }
          
          .user-meta {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .modal {
            margin: 10px;
            max-height: 95vh;
          }
          
          .modal-content {
            padding: 20px;
          }
          
          .modal-footer {
            flex-direction: column;
          }
          
          .modal-footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UserSystemManagement;