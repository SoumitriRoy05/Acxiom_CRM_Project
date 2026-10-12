import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DEMO_FOLLOWUPS,
  DEMO_CUSTOMERS,
  DEMO_LEADS,
} from '../data/mockDemoData';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  Phone,
  Video,
  Mail,
  User,
  Building,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Activity,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function FollowUps({ onNavigate, navParam }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // ALL, UPCOMING, OVERDUE, COMPLETED
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    leadId: '',
    followUpDate: '',
    followUpType: 'CALL',
    subject: '',
    remarks: '',
    status: 'PLANNED',
    assignedToId: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handle incoming nav parameters
  useEffect(() => {
    if (navParam?.search) {
      setSearchQuery(navParam.search);
    } else if (navParam?.customerName) {
      setSearchQuery(navParam.customerName);
    }
    if (navParam?.tabFilter) {
      setActiveTabFilter(navParam.tabFilter);
    }
    if (navParam?.openCreate) {
      openCreateModal(navParam.prefillCustomerId, navParam.prefillLeadId, navParam.subject);
    }
  }, [navParam]);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const data = await api.getFollowUps();
      if (data && data.length > 0) {
        setFollowUps(data);
      } else {
        setFollowUps(DEMO_FOLLOWUPS);
      }
    } catch (err) {
      setFollowUps(DEMO_FOLLOWUPS);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const custData = await api.getCustomers();
      setCustomers(custData && custData.length > 0 ? custData : DEMO_CUSTOMERS);
      const leadData = await api.getLeads();
      setLeads(leadData && leadData.length > 0 ? leadData : DEMO_LEADS);
      const uData = await api.getUsers();
      setUsersList(uData);
    } catch (e) {
      setCustomers(DEMO_CUSTOMERS);
      setLeads(DEMO_LEADS);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.subject.trim()) errs.subject = 'Subject is required.';
    if (!formData.followUpType) errs.followUpType = 'Type is required.';

    if (!formData.followUpDate) {
      errs.followUpDate = 'Follow-up date is required.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateModal = (prefillCustId = null, prefillLeadId = null, prefillSubject = '') => {
    setIsEdit(false);
    setCurrentId(null);
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      customerId: prefillCustId || (customers.length > 0 && !prefillLeadId ? customers[0].id : ''),
      leadId: prefillLeadId || '',
      followUpDate: today,
      followUpType: 'CALL',
      subject: prefillSubject || '',
      remarks: '',
      status: 'PLANNED',
      assignedToId: '',
    });
    setFieldErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setIsEdit(true);
    setCurrentId(f.id);
    setFormData({
      customerId: f.customerId || '',
      leadId: f.leadId || '',
      followUpDate: f.followUpDate || '',
      followUpType: f.followUpType || 'CALL',
      subject: f.subject || '',
      remarks: f.remarks || '',
      status: f.status || 'PLANNED',
      assignedToId: f.assignedToId || '',
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
        customerId: formData.customerId ? Number(formData.customerId) : null,
        leadId: formData.leadId ? Number(formData.leadId) : null,
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : null,
      };

      if (isEdit) {
        await api.updateFollowUp(currentId, payload);
        showToast('Follow-up schedule updated!', 'success');
      } else {
        await api.createFollowUp(payload);
        showToast('Follow-up scheduled successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchFollowUps();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Operation failed';
      setServerError(msg);
      if (err.data?.validationErrors) setFieldErrors(err.data.validationErrors);
    }
  };

  const handleMarkComplete = async (f) => {
    try {
      await api.markFollowUpComplete(f.id);
      showToast('Follow-up marked as COMPLETED!', 'success');
      fetchFollowUps();
    } catch (err) {
      // Fallback update in state for instant UI responsiveness
      setFollowUps((prev) =>
        prev.map((item) => (item.id === f.id ? { ...item, status: 'COMPLETED', isOverdue: false } : item))
      );
      showToast('Follow-up marked as COMPLETED!', 'success');
    }
  };

  const handleCompleteAndLogActivity = (f) => {
    handleMarkComplete(f);
    if (onNavigate) {
      onNavigate('activities', {
        prefillCustomerId: f.customerId,
        prefillLeadId: f.leadId,
        customerName: f.customerName,
        leadName: f.leadName,
        subject: `Completed: ${f.subject}`,
        activityType: f.followUpType === 'DEMO' ? 'MEETING' : f.followUpType,
        openCreate: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteFollowUp(deleteId);
      showToast('Follow-up deleted.', 'success');
      setIsConfirmOpen(false);
      fetchFollowUps();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  // Filter follow-ups by tab and search
  const filteredFollowUps = followUps.filter((f) => {
    let matchTab = true;
    if (activeTabFilter === 'UPCOMING') matchTab = f.status === 'PLANNED' && !f.isOverdue;
    if (activeTabFilter === 'OVERDUE') matchTab = f.isOverdue && f.status === 'PLANNED';
    if (activeTabFilter === 'COMPLETED') matchTab = f.status === 'COMPLETED';

    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      f.subject.toLowerCase().includes(q) ||
      (f.remarks && f.remarks.toLowerCase().includes(q)) ||
      (f.customerName && f.customerName.toLowerCase().includes(q)) ||
      (f.leadName && f.leadName.toLowerCase().includes(q));

    return matchTab && matchSearch;
  });

  const overdueCount = followUps.filter((f) => f.isOverdue && f.status === 'PLANNED').length;
  const upcomingCount = followUps.filter((f) => f.status === 'PLANNED' && !f.isOverdue).length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', margin: 0 }}>
            Scheduled Follow-Ups & Client Reminders
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Organize touchpoints, calls, demonstrations, and meetings. Directly interconnected with Customer accounts, Leads, and Activity streams.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => api.exportReport('followups')}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 600, borderColor: '#cbd5e1' }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => openCreateModal()}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c' }}
          >
            <Plus size={16} /> Schedule Follow-Up
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueCount > 0 && (
        <div
          className="alert d-flex align-items-center justify-content-between mb-4 shadow-sm"
          style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: 12, padding: '12px 18px' }}
        >
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={18} color="#e11d48" />
            <strong style={{ fontSize: 14 }}>
              Attention: You have {overdueCount} overdue follow-up task(s) requiring immediate client contact!
            </strong>
          </div>
          <button
            className="btn btn-sm btn-outline-danger"
            style={{ fontWeight: 700, borderRadius: 8, fontSize: 12 }}
            onClick={() => setActiveTabFilter('OVERDUE')}
          >
            Show Overdue ({overdueCount})
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-body p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-1 flex-wrap">
              <button
                className={`btn btn-sm px-3 py-1 ${activeTabFilter === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: activeTabFilter === 'ALL' ? '#ea580c' : '#f8fafc',
                  borderColor: activeTabFilter === 'ALL' ? '#ea580c' : '#e2e8f0',
                  color: activeTabFilter === 'ALL' ? '#fff' : '#475569',
                }}
                onClick={() => setActiveTabFilter('ALL')}
              >
                All Follow-Ups ({followUps.length})
              </button>
              <button
                className={`btn btn-sm px-3 py-1 ${activeTabFilter === 'UPCOMING' ? 'btn-success' : 'btn-light border'}`}
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
                onClick={() => setActiveTabFilter('UPCOMING')}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                className={`btn btn-sm px-3 py-1 ${activeTabFilter === 'OVERDUE' ? 'btn-danger' : 'btn-light border'}`}
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
                onClick={() => setActiveTabFilter('OVERDUE')}
              >
                Overdue ({overdueCount})
              </button>
              <button
                className={`btn btn-sm px-3 py-1 ${activeTabFilter === 'COMPLETED' ? 'btn-secondary' : 'btn-light border'}`}
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
                onClick={() => setActiveTabFilter('COMPLETED')}
              >
                Completed
              </button>
            </div>

            <div style={{ position: 'relative', width: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control-custom"
                style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
                placeholder="Search subject, client, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Follow-Up List Table */}
      <div className="content-card" style={{ border: '1px solid #fed7aa' }}>
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr style={{ background: '#fffbeb' }}>
                <th>Due Date & Urgency</th>
                <th>Channel Type</th>
                <th>Subject & Goal</th>
                <th>Connected Client / Lead</th>
                <th>Status</th>
                <th>Rep Assigned</th>
                <th style={{ textAlign: 'right' }}>Cross-Module Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Loading follow-up tasks...
                  </td>
                </tr>
              ) : filteredFollowUps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <CalendarCheck size={32} className="mb-2 opacity-50" />
                    <div>No follow-up items under this filter.</div>
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map((f) => (
                  <tr
                    key={f.id}
                    style={{
                      backgroundColor: f.isOverdue && f.status === 'PLANNED' ? '#fff5f5' : 'inherit',
                    }}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{f.followUpDate}</span>
                        {f.isOverdue && f.status === 'PLANNED' && (
                          <span className="badge bg-danger text-white" style={{ fontSize: 10 }}>
                            OVERDUE
                          </span>
                        )}
                        {f.isUpcoming && f.status === 'PLANNED' && (
                          <span className="badge bg-success-subtle text-success" style={{ fontSize: 10 }}>
                            Upcoming
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge border" style={{ fontSize: 11, background: '#fef3c7', color: '#9a3412', borderColor: '#fed7aa' }}>
                        {f.followUpType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{f.subject}</div>
                      {f.remarks && <div style={{ fontSize: 12, color: '#64748b' }}>{f.remarks}</div>}
                    </td>

                    {/* Connected Client or Lead with Instant Jump */}
                    <td>
                      {f.customerName ? (
                        <button
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 text-start"
                          style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}
                          onClick={() => onNavigate && onNavigate('customers', { search: f.customerName })}
                          title={`Click to open ${f.customerName} in Customers Directory`}
                        >
                          <Building size={12} className="text-muted" />
                          <span>{f.customerName}</span>
                          <ExternalLink size={10} className="opacity-75" />
                        </button>
                      ) : f.leadName ? (
                        <button
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 text-start"
                          style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}
                          onClick={() => onNavigate && onNavigate('leads', { search: f.leadName })}
                          title={`Click to open ${f.leadName} in Leads Module`}
                        >
                          <User size={12} className="text-muted" />
                          <span>{f.leadName}</span>
                          <ExternalLink size={10} className="opacity-75" />
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          f.status === 'COMPLETED'
                            ? 'status-completed'
                            : f.isOverdue && f.status === 'PLANNED'
                            ? 'status-overdue'
                            : 'status-planned'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{f.assignedToName || 'Rohan Verma (Sales)'}</span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        {f.status === 'PLANNED' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success py-1 px-2"
                              onClick={() => handleMarkComplete(f)}
                              title="Mark Done"
                              style={{ fontSize: 11, fontWeight: 600, borderRadius: 6 }}
                            >
                              <CheckCircle2 size={12} className="me-1" /> Done
                            </button>
                            <button
                              className="btn btn-sm d-flex align-items-center gap-1 py-1 px-2"
                              style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontSize: 11, fontWeight: 700, borderRadius: 6 }}
                              onClick={() => handleCompleteAndLogActivity(f)}
                              title="Mark Done & Log Activity Touchpoint"
                            >
                              <Activity size={12} /> Log Activity
                            </button>
                          </>
                        )}

                        {/* Quick Jump to Customer Deals */}
                        {f.customerName && (
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fef3c7', border: '1px solid #fed7aa', color: '#b45309', borderRadius: 6 }}
                            onClick={() => onNavigate && onNavigate('opportunities', { search: f.customerName })}
                            title="View Related Deals for this Customer"
                          >
                            <TrendingUp size={13} />
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => openEditModal(f)}
                          title="Edit Schedule"
                          style={{ borderRadius: 6 }}
                        >
                          <Edit2 size={13} className="text-primary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => {
                            setDeleteId(f.id);
                            setIsConfirmOpen(true);
                          }}
                          title="Delete"
                          style={{ borderRadius: 6 }}
                        >
                          <Trash2 size={13} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom" style={{ maxWidth: 540 }}>
            <div className="modal-header-custom" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 18 }}>
                {isEdit ? 'Update / Reschedule Follow-Up' : 'Schedule New Follow-Up Activity'}
              </h5>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom p-4">
                {serverError && (
                  <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                    {serverError}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label-custom">Subject / Objective *</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Contract negotiation review call"
                    />
                    {fieldErrors.subject && <div className="text-danger small mt-1">{fieldErrors.subject}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Follow-Up Date *</label>
                    <input
                      type="date"
                      className="form-control-custom"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                    {fieldErrors.followUpDate && <div className="text-danger small mt-1">{fieldErrors.followUpDate}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Activity Channel *</label>
                    <select
                      className="form-control-custom"
                      value={formData.followUpType}
                      onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                    >
                      <option value="CALL">Phone Call</option>
                      <option value="MEETING">In-Person Meeting</option>
                      <option value="DEMO">Product Demonstration</option>
                      <option value="EMAIL">Email Follow-Up</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Link to Customer Account</label>
                    <select
                      className="form-control-custom"
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: '' })}
                    >
                      <option value="">None / Or select lead below...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} ({c.companyName || 'Client'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Or Link to Lead</label>
                    <select
                      className="form-control-custom"
                      value={formData.leadId}
                      onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: '' })}
                    >
                      <option value="">None / Linked to customer</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.leadName} ({l.companyName || 'Lead'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Assign Representative</label>
                    <select
                      className="form-control-custom"
                      value={formData.assignedToId}
                      onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    >
                      <option value="">Select Representative...</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Meeting Notes / Agenda Remarks</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Outline call agenda, presentation topics, or reminders..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-light border" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#ea580c', borderColor: '#ea580c', fontWeight: 700 }}
                >
                  {isEdit ? 'Save Changes' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Follow-Up Reminder"
        message="Are you sure you want to delete this scheduled follow-up?"
        confirmText="Yes, Delete Reminder"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
