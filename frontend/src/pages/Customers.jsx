import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DEMO_CUSTOMERS,
  DEMO_OPPORTUNITIES,
  DEMO_FOLLOWUPS,
  DEMO_ACTIVITIES,
  formatINR,
  formatINRConcise,
} from '../data/mockDemoData';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  TrendingUp,
  CalendarCheck,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function Customers({ onNavigate, navParam }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 360 View Modal
  const [viewCustomer, setViewCustomer] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    status: 'ACTIVE',
    assignedToId: '',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handle incoming nav parameters
  useEffect(() => {
    if (navParam?.search) {
      setSearchTerm(navParam.search);
    } else if (navParam?.customerName) {
      setSearchTerm(navParam.customerName);
    }
    if (navParam?.openCreate) {
      openCreateModal();
    }
  }, [navParam]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers({
        search: searchTerm,
        status: statusFilter,
      });
      if (data && data.length > 0) {
        setCustomers(data);
      } else if (!searchTerm && !statusFilter) {
        // Fallback to shared cohesive demo data
        setCustomers(DEMO_CUSTOMERS);
      } else {
        // Filter demo data locally if backend returned empty
        const term = searchTerm.toLowerCase();
        const filtered = DEMO_CUSTOMERS.filter((c) => {
          const matchSearch =
            !term ||
            c.customerName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.phone.includes(term) ||
            (c.companyName && c.companyName.toLowerCase().includes(term));
          const matchStatus = !statusFilter || c.status === statusFilter;
          return matchSearch && matchStatus;
        });
        setCustomers(filtered);
      }
    } catch (err) {
      // Fallback gracefully to demo customers
      setCustomers(DEMO_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsersList(data);
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer Name is required.';
    } else if (formData.customerName.length > 100) {
      errs.customerName = 'Customer Name cannot exceed 100 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$|^\+[0-9]{1,3}[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number (10 digits).';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      status: 'ACTIVE',
      assignedToId: '',
      notes: '',
    });
    setFieldErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEdit(true);
    setCurrentId(c.id);
    setFormData({
      customerName: c.customerName,
      email: c.email,
      phone: c.phone,
      companyName: c.companyName || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      status: c.status || 'ACTIVE',
      assignedToId: c.assignedToId || '',
      notes: c.notes || '',
    });
    setFieldErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : null,
      };

      if (isEdit) {
        await api.updateCustomer(currentId, payload);
        showToast('Customer record updated successfully!', 'success');
      } else {
        await api.createCustomer(payload);
        showToast('Customer successfully created!', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Operation failed';
      setServerError(msg);
      if (err.data?.validationErrors) {
        setFieldErrors(err.data.validationErrors);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCustomer(deleteId);
      showToast('Customer deleted successfully.', 'success');
      setIsConfirmOpen(false);
      fetchCustomers();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  // Helper to find related data for any customer
  const getCustomerRelatedData = (c) => {
    const opps = DEMO_OPPORTUNITIES.filter(
      (o) => o.customerId === c.id || (o.customerName && o.customerName.toLowerCase() === c.customerName?.toLowerCase())
    );
    const followUps = DEMO_FOLLOWUPS.filter(
      (f) => f.customerId === c.id || (f.customerName && f.customerName.toLowerCase() === c.customerName?.toLowerCase())
    );
    const acts = DEMO_ACTIVITIES.filter(
      (a) => a.customerId === c.id || (a.customerName && a.customerName.toLowerCase() === c.customerName?.toLowerCase())
    );
    const totalPipeline = opps.reduce((sum, o) => sum + (o.amount || 0), 0);
    return { opps, followUps, acts, totalPipeline };
  };

  return (
    <div>
      {/* Header bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', margin: 0 }}>
            Customer Accounts & 360° Directory
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Maintain customer master accounts, contacts, and historical relationship records. All accounts are interconnected with Deals, Follow-ups, and Activities.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => api.exportReport('customers')}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 600, borderColor: '#cbd5e1' }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={openCreateModal}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c' }}
          >
            <Plus size={16} /> New Customer
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control-custom"
                  style={{ paddingLeft: 36, height: 40 }}
                  placeholder="Search by Name, Company, Email, Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-control-custom"
                style={{ height: 40 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="col-6 col-md-4 text-end">
              <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
                Showing <strong>{customers.length}</strong> active client account(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="content-card" style={{ border: '1px solid #fed7aa' }}>
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr style={{ background: '#fffbeb' }}>
                <th>Customer Name & Code</th>
                <th>Contact</th>
                <th>Company & Location</th>
                <th>Linked Deals</th>
                <th>Linked Tasks</th>
                <th>Status</th>
                <th>Account Owner</th>
                <th style={{ textAlign: 'right' }}>Cross-Module Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Loading customer database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <Users size={32} className="mb-2 opacity-50" />
                    <div>No customer records matching your filter criteria.</div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const { opps, followUps, totalPipeline } = getCustomerRelatedData(c);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-link p-0 text-decoration-none text-start"
                            style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}
                            onClick={() => setViewCustomer(c)}
                            title="Click to view Customer 360° overview"
                          >
                            {c.customerName}
                          </button>
                          <Eye
                            size={14}
                            className="text-muted cursor-pointer"
                            onClick={() => setViewCustomer(c)}
                            title="Inspect 360° profile"
                          />
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span
                            className="badge border"
                            style={{ fontFamily: 'monospace', fontSize: 11, background: '#fef3c7', color: '#9a3412', borderColor: '#fed7aa' }}
                          >
                            {c.customerCode || `CUST-100${c.id}`}
                          </span>
                        </div>
                        {c.notes && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, maxWidth: 220 }} className="text-truncate">
                            {c.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          <Mail size={12} className="me-1 text-muted" />
                          <a href={`mailto:${c.email}`} className="text-decoration-none text-dark">
                            {c.email}
                          </a>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          <Phone size={12} className="me-1 text-muted" />
                          {c.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          <Building size={12} className="me-1 text-muted" />
                          {c.companyName || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          <MapPin size={12} className="me-1 text-muted" />
                          {[c.city, c.state].filter(Boolean).join(', ') || 'India'}
                        </div>
                      </td>

                      {/* Linked Deals with Direct Navigation */}
                      <td>
                        {opps.length > 0 ? (
                          <button
                            className="btn btn-sm d-flex align-items-center gap-1"
                            style={{
                              borderRadius: 16,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                            }}
                            onClick={() => onNavigate && onNavigate('opportunities', { search: c.customerName })}
                            title="Jump to Opportunities filtered for this Customer"
                          >
                            <TrendingUp size={12} />
                            <span>{opps.length} Deal{opps.length > 1 ? 's' : ''} ({formatINRConcise(totalPipeline)})</span>
                            <ArrowRight size={10} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-light border text-muted"
                            style={{ fontSize: 11, borderRadius: 16 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('opportunities', {
                                prefillCustomer: c.id,
                                customerName: c.customerName,
                                openCreate: true,
                              })
                            }
                          >
                            + Add Deal
                          </button>
                        )}
                      </td>

                      {/* Linked Follow-Ups with Direct Navigation */}
                      <td>
                        {followUps.length > 0 ? (
                          <button
                            className="btn btn-sm d-flex align-items-center gap-1"
                            style={{
                              borderRadius: 16,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#c2410c',
                            }}
                            onClick={() => onNavigate && onNavigate('followups', { search: c.customerName })}
                            title="Jump to Follow-ups scheduled for this Customer"
                          >
                            <CalendarCheck size={12} />
                            <span>{followUps.length} Task{followUps.length > 1 ? 's' : ''}</span>
                            <ArrowRight size={10} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-light border text-muted"
                            style={{ fontSize: 11, borderRadius: 16 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('followups', {
                                prefillCustomer: c.id,
                                customerName: c.customerName,
                                openCreate: true,
                              })
                            }
                          >
                            + Schedule
                          </button>
                        )}
                      </td>

                      <td>
                        <span className={`status-badge ${c.status === 'ACTIVE' ? 'status-won' : 'status-lost'}`}>
                          {c.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {c.status}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                          {c.assignedToName || 'Rohan Verma (Sales)'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {/* Quick Jump Buttons to Schedule / Log Activity */}
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fef3c7', border: '1px solid #fed7aa', color: '#b45309', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('followups', {
                                prefillCustomerId: c.id,
                                customerName: c.customerName,
                                openCreate: true,
                              })
                            }
                            title="Schedule Follow-Up for this Customer"
                          >
                            <CalendarCheck size={14} />
                          </button>

                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('activities', {
                                prefillCustomerId: c.id,
                                customerName: c.customerName,
                                openCreate: true,
                              })
                            }
                            title="Log Touchpoint / Activity for this Customer"
                          >
                            <Activity size={14} />
                          </button>

                          <button
                            className="btn btn-sm btn-light border p-1"
                            onClick={() => openEditModal(c)}
                            title="Edit Customer Details"
                            style={{ borderRadius: 6 }}
                          >
                            <Edit2 size={14} className="text-primary" />
                          </button>

                          <button
                            className="btn btn-sm btn-light border p-1"
                            onClick={() => {
                              setDeleteId(c.id);
                              setIsConfirmOpen(true);
                            }}
                            title="Delete Customer"
                            style={{ borderRadius: 6 }}
                          >
                            <Trash2 size={14} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360° Profile Modal (Deep Linking Hub) */}
      {viewCustomer && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom" style={{ maxWidth: 680 }}>
            <div className="modal-header-custom" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <div>
                <h5 style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 18 }}>
                  Customer 360° Relationship Overview
                </h5>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {viewCustomer.customerName} ({viewCustomer.customerCode || `CUST-100${viewCustomer.id}`})
                </span>
              </div>
              <button
                className="btn-close"
                onClick={() => setViewCustomer(null)}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body-custom p-4">
              {/* Account Quick Facts */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>Company</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{viewCustomer.companyName || '—'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{[viewCustomer.city, viewCustomer.state].filter(Boolean).join(', ') || 'India'}</div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="p-3 rounded-3" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Primary Contact</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{viewCustomer.email}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{viewCustomer.phone}</div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="p-3 rounded-3" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Account Owner</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{viewCustomer.assignedToName || 'Rohan Verma (Sales)'}</div>
                    <div style={{ fontSize: 12, color: '#059669' }}>Status: {viewCustomer.status}</div>
                  </div>
                </div>
              </div>

              {/* Linked Deals Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>
                    💼 Linked Sales Deals & Pipeline
                  </strong>
                  <button
                    className="btn btn-sm btn-link p-0 text-decoration-none"
                    style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                    onClick={() => {
                      setViewCustomer(null);
                      onNavigate && onNavigate('opportunities', { search: viewCustomer.customerName });
                    }}
                  >
                    Open Pipeline Board <ArrowRight size={12} />
                  </button>
                </div>

                {(() => {
                  const opps = DEMO_OPPORTUNITIES.filter(
                    (o) => o.customerId === viewCustomer.id || o.customerName === viewCustomer.customerName
                  );
                  if (opps.length === 0) {
                    return <div className="text-muted p-2 border rounded bg-light" style={{ fontSize: 12 }}>No opportunities currently recorded.</div>;
                  }
                  return (
                    <div className="d-flex flex-column gap-2">
                      {opps.map((o) => (
                        <div
                          key={o.id}
                          className="p-2 border rounded-3 d-flex justify-content-between align-items-center bg-white"
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{o.opportunityName}</div>
                            <span className="badge bg-warning text-dark me-2" style={{ fontSize: 10 }}>{o.stage}</span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>Close: {o.expectedCloseDate}</span>
                          </div>
                          <div className="text-end">
                            <strong style={{ fontSize: 14, color: '#ea580c' }}>{formatINR(o.amount)}</strong>
                            <div style={{ fontSize: 11, color: '#059669' }}>Weighted: {formatINR(o.weightedPipeline)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Linked Follow-Ups & Activities Section */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>
                    📅 Scheduled Follow-Ups & Touchpoints
                  </strong>
                  <button
                    className="btn btn-sm btn-link p-0 text-decoration-none"
                    style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                    onClick={() => {
                      setViewCustomer(null);
                      onNavigate && onNavigate('followups', { search: viewCustomer.customerName });
                    }}
                  >
                    View All Follow-Ups <ArrowRight size={12} />
                  </button>
                </div>

                {(() => {
                  const followUps = DEMO_FOLLOWUPS.filter(
                    (f) => f.customerId === viewCustomer.id || f.customerName === viewCustomer.customerName
                  );
                  if (followUps.length === 0) {
                    return <div className="text-muted p-2 border rounded bg-light" style={{ fontSize: 12 }}>No follow-up reminders scheduled.</div>;
                  }
                  return (
                    <div className="d-flex flex-column gap-2">
                      {followUps.map((f) => (
                        <div
                          key={f.id}
                          className="p-2 border rounded-3 d-flex justify-content-between align-items-center bg-white"
                        >
                          <div>
                            <span className="badge bg-light text-primary border me-2" style={{ fontSize: 10 }}>{f.followUpType}</span>
                            <strong style={{ fontSize: 13 }}>{f.subject}</strong>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{f.remarks}</div>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${f.isOverdue ? 'bg-danger' : f.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}>
                              {f.isOverdue ? 'OVERDUE' : f.status}
                            </span>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{f.followUpDate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="modal-footer-custom bg-light d-flex justify-content-between">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 600 }}
                  onClick={() => {
                    const c = viewCustomer;
                    setViewCustomer(null);
                    onNavigate && onNavigate('opportunities', { prefillCustomerId: c.id, customerName: c.customerName, openCreate: true });
                  }}
                >
                  <TrendingUp size={13} /> + Deal
                </button>
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', fontWeight: 600 }}
                  onClick={() => {
                    const c = viewCustomer;
                    setViewCustomer(null);
                    onNavigate && onNavigate('followups', { prefillCustomerId: c.id, customerName: c.customerName, openCreate: true });
                  }}
                >
                  <CalendarCheck size={13} /> + Follow-Up
                </button>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setViewCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom" style={{ maxWidth: 560 }}>
            <div className="modal-header-custom" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 18 }}>
                {isEdit ? 'Edit Customer Record' : 'Create New Customer Account'}
              </h5>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom p-4">
                {serverError && (
                  <div className="alert alert-danger p-2 mb-3" style={{ fontSize: 13 }}>
                    {serverError}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label-custom">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control-custom ${fieldErrors.customerName ? 'is-invalid' : ''}`}
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g. Acme Global Technologies"
                    />
                    {fieldErrors.customerName && (
                      <div className="invalid-feedback d-block">{fieldErrors.customerName}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control-custom ${fieldErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                    {fieldErrors.email && (
                      <div className="invalid-feedback d-block">{fieldErrors.email}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">
                      Phone Number (10 digits) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control-custom ${fieldErrors.phone ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                    />
                    {fieldErrors.phone && (
                      <div className="invalid-feedback d-block">{fieldErrors.phone}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Company / Organization Name</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Acme Global Inc"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Billing / Street Address</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="100 Innovation Blvd"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">City</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">State</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Account Status</label>
                    <select
                      className="form-control-custom"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Assign Account Owner</label>
                    <select
                      className="form-control-custom"
                      value={formData.assignedToId}
                      onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    >
                      <option value="">Select Sales Executive...</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Notes & Relationship Context</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter strategic background notes..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#ea580c', borderColor: '#ea580c', fontWeight: 700 }}
                >
                  {isEdit ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Customer Record"
        message="Are you sure you want to delete this customer? This action cannot be undone and will be recorded in the audit log."
        confirmText="Yes, Delete Customer"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
