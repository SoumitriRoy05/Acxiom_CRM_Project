import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  Plus,
  Search,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Mail,
  Clock,
} from 'lucide-react';

export function UsersAdmin({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const defaultUsers = [
    { id: 1, name: 'Aarav Sharma (Admin)', email: 'admin@acxiom.com', role: 'ADMIN', active: true, accountLocked: false, failedLoginAttempts: 0 },
    { id: 2, name: 'Pooja Verma (Manager)', email: 'manager@acxiom.com', role: 'MANAGER', active: true, accountLocked: false, failedLoginAttempts: 0 },
    { id: 3, name: 'Rohan Verma (Sales)', email: 'sales@acxiom.com', role: 'SALES_EXECUTIVE', active: true, accountLocked: false, failedLoginAttempts: 0 },
    { id: 4, name: 'Neha Gupta (Sales)', email: 'rachel@acxiom.com', role: 'SALES_EXECUTIVE', active: true, accountLocked: false, failedLoginAttempts: 0 },
  ];

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES_EXECUTIVE',
  });
  const [createErrors, setCreateErrors] = useState({});

  // Reset Password Modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(searchTerm);
      if (data && data.length > 0) {
        setUsers(data);
      } else {
        setUsers(defaultUsers);
      }
    } catch (err) {
      setUsers(defaultUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!createForm.name.trim()) errs.name = 'Full Name is required.';
    if (!createForm.email.trim()) errs.email = 'Email is required.';
    if (!createForm.password || createForm.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(createForm.password)) {
      errs.password = 'Must contain at least 1 letter and 1 number.';
    }

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }

    try {
      await api.createUser(createForm);
      showToast(`User ${createForm.name} created successfully!`, 'success');
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'SALES_EXECUTIVE' });
      setCreateErrors({});
      fetchUsers();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Creation failed', 'danger');
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      await api.updateUser(targetUser.id, {
        isActive: !targetUser.active,
      });
      showToast(`User ${targetUser.name} is now ${!targetUser.active ? 'Active' : 'Deactivated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Status update failed', 'danger');
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    try {
      await api.updateUser(targetUser.id, {
        role: newRole,
      });
      showToast(`Role updated for ${targetUser.name} to ${newRole}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Role update failed', 'danger');
    }
  };

  const handleUnlock = async (targetUser) => {
    try {
      await api.unlockUser(targetUser.id);
      showToast(`Account unlocked for ${targetUser.email}! Failed attempts reset.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Could not unlock account', 'danger');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      setResetError('Password must contain at least 1 letter and 1 number.');
      return;
    }

    try {
      await api.resetPassword(selectedUser.id, newPassword);
      showToast(`Password reset successfully for ${selectedUser.email}.`, 'success');
      setIsResetOpen(false);
      setNewPassword('');
      setResetError('');
      fetchUsers();
    } catch (err) {
      setResetError(err.data?.message || 'Password reset failed');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            User & Role Governance
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Administrator console to manage access roles, unlock lockout states, and enforce security policies.
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setCreateErrors({});
            setIsCreateOpen(true);
          }}
          style={{ borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#4f46e5', borderColor: '#4f46e5' }}
        >
          <Plus size={16} /> Add Application User
        </button>
      </div>

      {/* Search Bar */}
      <div className="content-card mb-4">
        <div className="content-card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control-custom"
                  style={{ paddingLeft: 36, height: 40 }}
                  placeholder="Search users by name or email address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Total Registered Users: <strong>{users.length}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role Assignment</th>
                <th>Account Status</th>
                <th>Lockout Status</th>
                <th>Failed Logins</th>
                <th style={{ textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto', fontSize: 12, fontWeight: 600 }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="SALES_EXECUTIVE">Sales Executive</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.active ? 'btn-outline-success' : 'btn-outline-danger'}`}
                        style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '2px 10px' }}
                        onClick={() => handleToggleActive(u)}
                        title="Click to toggle status"
                      >
                        {u.active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td>
                      {u.locked ? (
                        <div className="d-flex align-items-center gap-1 text-danger" style={{ fontSize: 12, fontWeight: 600 }}>
                          <ShieldAlert size={14} /> Locked until {u.lockoutEnd ? new Date(u.lockoutEnd).toLocaleTimeString() : 'admin reset'}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-1 text-success" style={{ fontSize: 12 }}>
                          <ShieldCheck size={14} /> Normal (Unlocked)
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.failedLoginCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-muted border'}`}>
                        {u.failedLoginCount} / 5 attempts
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {u.locked && (
                        <button
                          className="btn btn-sm btn-outline-warning py-1 px-2 me-2"
                          onClick={() => handleUnlock(u)}
                          title="Unlock account immediately"
                          style={{ fontSize: 12, fontWeight: 600 }}
                        >
                          <Unlock size={13} className="me-1" /> Unlock
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-light border py-1 px-2"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewPassword('');
                          setResetError('');
                          setIsResetOpen(true);
                        }}
                        title="Reset user password"
                        style={{ fontSize: 12 }}
                      >
                        <KeyRound size={13} className="me-1 text-muted" /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom" style={{ maxWidth: 500 }}>
            <div className="modal-header-custom">
              <h5 style={{ margin: 0, fontWeight: 700 }}>Add New Application User</h5>
              <button type="button" className="btn-close" onClick={() => setIsCreateOpen(false)}></button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body-custom">
                <div className="mb-3">
                  <label className="form-label-custom">Full Name *</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Neha Gupta"
                  />
                  {createErrors.name && <div className="form-error">{createErrors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Email Address *</label>
                  <input
                    type="email"
                    className="form-control-custom"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="neha.gupta@acxiom.com"
                  />
                  {createErrors.email && <div className="form-error">{createErrors.email}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Initial Password *</label>
                  <input
                    type="password"
                    className="form-control-custom"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min 8 chars (letters and digits)"
                  />
                  {createErrors.password && <div className="form-error">{createErrors.password}</div>}
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                    Enforced password policy: minimum 8 characters with at least 1 letter and 1 number.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Primary Role</label>
                  <select
                    className="form-control-custom"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  >
                    <option value="SALES_EXECUTIVE">Sales Executive (Scoped records)</option>
                    <option value="MANAGER">Manager (Team visibility)</option>
                    <option value="ADMIN">Administrator (Full authority)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-light border" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', borderColor: '#4f46e5' }}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom" style={{ maxWidth: 460 }}>
            <div className="modal-header-custom">
              <h5 style={{ margin: 0, fontWeight: 700 }}>Reset Password for {selectedUser?.name}</h5>
              <button type="button" className="btn-close" onClick={() => setIsResetOpen(false)}></button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body-custom">
                {resetError && (
                  <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                    {resetError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label-custom">New Temporary Password *</label>
                  <input
                    type="password"
                    className="form-control-custom"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters (letters & digits)"
                  />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    Account lockout counter will also be cleared to 0.
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-light border" onClick={() => setIsResetOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', borderColor: '#4f46e5' }}>
                  Set New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
