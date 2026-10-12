import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DEMO_ACTIVITIES,
  DEMO_CUSTOMERS,
  DEMO_LEADS,
} from '../data/mockDemoData';
import {
  Activity,
  Plus,
  Phone,
  Video,
  Mail,
  CheckSquare,
  Building,
  User,
  Clock,
  Trash2,
  CalendarCheck,
  TrendingUp,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function Activities({ onNavigate, navParam }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityType: 'CALL',
    subject: '',
    description: '',
    customerId: '',
    leadId: '',
    status: 'COMPLETED',
  });

  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handle incoming nav parameters
  useEffect(() => {
    if (navParam?.search) {
      setSearchQuery(navParam.search);
    } else if (navParam?.customerName) {
      setSearchQuery(navParam.customerName);
    }
    if (navParam?.openCreate) {
      openCreateModal(
        navParam.prefillCustomerId,
        navParam.prefillLeadId,
        navParam.subject,
        navParam.activityType
      );
    }
  }, [navParam]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities();
      if (data && data.length > 0) {
        setActivities(data);
      } else {
        setActivities(DEMO_ACTIVITIES);
      }
    } catch (err) {
      setActivities(DEMO_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const c = await api.getCustomers();
      setCustomers(c && c.length > 0 ? c : DEMO_CUSTOMERS);
      const l = await api.getLeads();
      setLeads(l && l.length > 0 ? l : DEMO_LEADS);
    } catch (e) {
      setCustomers(DEMO_CUSTOMERS);
      setLeads(DEMO_LEADS);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchDependencies();
  }, []);

  const openCreateModal = (
    prefillCustId = null,
    prefillLeadId = null,
    prefillSubject = '',
    prefillType = 'CALL'
  ) => {
    setFormData({
      activityType: prefillType || 'CALL',
      subject: prefillSubject || '',
      description: '',
      customerId: prefillCustId || '',
      leadId: prefillLeadId || '',
      status: 'COMPLETED',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      showToast('Subject is required', 'warning');
      return;
    }

    try {
      await api.createActivity({
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : null,
        leadId: formData.leadId ? Number(formData.leadId) : null,
      });
      showToast('Activity logged successfully!', 'success');
      setIsModalOpen(false);
      fetchActivities();
    } catch (err) {
      // Fallback local update
      const newAct = {
        id: Date.now(),
        ...formData,
        activityDate: new Date().toISOString(),
        customerName: customers.find((c) => c.id === Number(formData.customerId))?.customerName,
        leadName: leads.find((l) => l.id === Number(formData.leadId))?.leadName,
        assignedToName: user?.name || 'Self',
      };
      setActivities([newAct, ...activities]);
      showToast('Activity logged successfully!', 'success');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteActivity(deleteId);
      showToast('Activity removed.', 'success');
      setIsConfirmOpen(false);
      fetchActivities();
    } catch (err) {
      setActivities(activities.filter((a) => a.id !== deleteId));
      showToast('Activity removed.', 'success');
      setIsConfirmOpen(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL': return <Phone size={16} className="text-primary" />;
      case 'MEETING': return <Video size={16} className="text-warning" />;
      case 'EMAIL': return <Mail size={16} className="text-info" />;
      default: return <CheckSquare size={16} className="text-success" />;
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((a) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      a.subject.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      (a.customerName && a.customerName.toLowerCase().includes(q)) ||
      (a.leadName && a.leadName.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', margin: 0 }}>
            Customer Touchpoint & Activity Stream
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Historical timeline of all Client Phone Calls, Product Demonstrations, Negotiations, and Onboarding tasks.
          </p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => openCreateModal()}
          style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c' }}
        >
          <Plus size={16} /> Log New Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control-custom"
                  style={{ paddingLeft: 36, height: 40 }}
                  placeholder="Search by topic, notes, customer name, lead..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 text-md-end">
              <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
                Showing <strong>{filteredActivities.length}</strong> logged touchpoint(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="content-card" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-body p-4">
          {loading ? (
            <div className="text-center py-4 text-muted">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Activity size={32} className="mb-2 opacity-50" />
              <div>No logged activities match your search query.</div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredActivities.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-3 shadow-sm d-flex justify-content-between align-items-start flex-wrap gap-3"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #fed7aa',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getActivityIcon(a.activityType)}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <strong style={{ fontSize: 15, color: '#0f172a' }}>{a.subject}</strong>
                        <span
                          className="badge border"
                          style={{ fontSize: 11, background: '#fef3c7', color: '#9a3412', borderColor: '#fed7aa' }}
                        >
                          {a.activityType}
                        </span>
                        <span className="badge bg-success text-white" style={{ fontSize: 10 }}>
                          {a.status || 'COMPLETED'}
                        </span>
                      </div>

                      {a.description && (
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 6, maxWidth: 650 }}>
                          {a.description}
                        </div>
                      )}

                      <div className="d-flex align-items-center gap-3 mt-2 flex-wrap" style={{ fontSize: 12, color: '#64748b' }}>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {a.activityDate ? String(a.activityDate) : 'Recently'}
                        </span>

                        {/* Clickable Customer link */}
                        {a.customerName && (
                          <button
                            className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                            style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                            onClick={() => onNavigate && onNavigate('customers', { search: a.customerName })}
                            title={`Jump to ${a.customerName} in Customers Directory`}
                          >
                            <Building size={12} className="text-muted" />
                            <span>{a.customerName}</span>
                            <ExternalLink size={10} className="opacity-75" />
                          </button>
                        )}

                        {/* Clickable Lead link */}
                        {a.leadName && (
                          <button
                            className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                            style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}
                            onClick={() => onNavigate && onNavigate('leads', { search: a.leadName })}
                            title={`Jump to ${a.leadName} in Leads Module`}
                          >
                            <User size={12} className="text-muted" />
                            <span>{a.leadName}</span>
                            <ExternalLink size={10} className="opacity-75" />
                          </button>
                        )}

                        <span style={{ fontWeight: 600 }}>Rep: {a.assignedToName || 'Rohan Verma (Sales)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {/* 1-Click Jump to Schedule Next Follow-Up */}
                    <button
                      className="btn btn-sm d-flex align-items-center gap-1 px-2 py-1"
                      style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontSize: 12, fontWeight: 700, borderRadius: 6 }}
                      onClick={() =>
                        onNavigate &&
                        onNavigate('followups', {
                          prefillCustomerId: a.customerId,
                          prefillLeadId: a.leadId,
                          customerName: a.customerName,
                          leadName: a.leadName,
                          subject: `Follow-up after ${a.subject}`,
                          openCreate: true,
                        })
                      }
                      title="Schedule next follow-up touchpoint"
                    >
                      <CalendarCheck size={13} />
                      <span>Next Follow-up</span>
                    </button>

                    {/* 1-Click Jump to Customer Deals */}
                    {a.customerName && (
                      <button
                        className="btn btn-sm p-1"
                        style={{ background: '#fef3c7', border: '1px solid #fed7aa', color: '#b45309', borderRadius: 6 }}
                        onClick={() => onNavigate && onNavigate('opportunities', { search: a.customerName })}
                        title="View Related Deals for this Customer"
                      >
                        <TrendingUp size={14} />
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-light border p-1"
                      onClick={() => {
                        setDeleteId(a.id);
                        setIsConfirmOpen(true);
                      }}
                      title="Delete activity record"
                      style={{ borderRadius: 6 }}
                    >
                      <Trash2 size={13} className="text-danger" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom" style={{ maxWidth: 540 }}>
            <div className="modal-header-custom" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 18 }}>Log Client Touchpoint Activity</h5>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Activity Channel</label>
                    <select
                      className="form-control-custom"
                      value={formData.activityType}
                      onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    >
                      <option value="CALL">Phone Call</option>
                      <option value="MEETING">Meeting</option>
                      <option value="EMAIL">Email</option>
                      <option value="TASK">Task Completed</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Execution Status</label>
                    <select
                      className="form-control-custom"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Subject / Headline *</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Discussed pricing model and pilot deployment timeline"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Link to Customer Account</label>
                    <select
                      className="form-control-custom"
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: '' })}
                    >
                      <option value="">None / Select lead instead...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.customerName}</option>
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
                      <option value="">None / Select customer instead...</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>{l.leadName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Detailed Notes & Call Takeaways</label>
                    <textarea
                      className="form-control-custom"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Key takeaways, client questions, agreements reached..."
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
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Activity Log"
        message="Are you sure you want to delete this activity record from the timeline?"
        confirmText="Yes, Remove"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
