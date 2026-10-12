import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  DEMO_OPPORTUNITIES,
  DEMO_CUSTOMERS,
  formatINR,
  formatINRConcise,
} from '../data/mockDemoData';
import {
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Building,
  LayoutGrid,
  List,
  FileSpreadsheet,
  CalendarCheck,
  Activity,
  ArrowRight,
  ExternalLink,
  FileBarChart,
  Users,
} from 'lucide-react';

export function Opportunities({ onNavigate, navParam }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    opportunityName: '',
    customerId: '',
    amount: '',
    stage: 'QUALIFICATION',
    probability: 50,
    expectedCloseDate: '',
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
    } else if (navParam?.filterCustomer || navParam?.customerName) {
      setSearchTerm(navParam.filterCustomer || navParam.customerName);
    }
    if (navParam?.openCreate) {
      openCreateModal(navParam.prefillCustomerId || navParam.prefillCustomer);
    }
  }, [navParam]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getOpportunities({
        search: searchTerm,
        stage: stageFilter,
        status: statusFilter,
      });
      if (data && data.length > 0) {
        setOpportunities(data);
      } else if (!searchTerm && !stageFilter && !statusFilter) {
        setOpportunities(DEMO_OPPORTUNITIES);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = DEMO_OPPORTUNITIES.filter((o) => {
          const matchSearch =
            !term ||
            o.opportunityName.toLowerCase().includes(term) ||
            (o.customerName && o.customerName.toLowerCase().includes(term));
          const matchStage = !stageFilter || o.stage === stageFilter;
          const matchStatus = !statusFilter || o.status === statusFilter;
          return matchSearch && matchStage && matchStatus;
        });
        setOpportunities(filtered);
      }
    } catch (err) {
      setOpportunities(DEMO_OPPORTUNITIES);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const custData = await api.getCustomers();
      setCustomers(custData && custData.length > 0 ? custData : DEMO_CUSTOMERS);
      const uData = await api.getUsers();
      setUsersList(uData);
    } catch (e) {
      setCustomers(DEMO_CUSTOMERS);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [searchTerm, stageFilter, statusFilter]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.opportunityName.trim()) {
      errs.opportunityName = 'Opportunity Name is required.';
    }

    if (!formData.customerId) {
      errs.customerId = 'Customer is required.';
    }

    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Opportunity Amount must be greater than 0.';
    }

    const prob = Number(formData.probability);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      errs.probability = 'Probability must be between 0 and 100.';
    }

    if (!formData.expectedCloseDate) {
      errs.expectedCloseDate = 'Expected Close Date is required.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateModal = (prefillCustId = null) => {
    setIsEdit(false);
    setCurrentId(null);
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const defaultDate = today.toISOString().split('T')[0];

    const fallbackCustId =
      prefillCustId || (customers.length > 0 ? customers[0].id : 1);

    setFormData({
      opportunityName: '',
      customerId: fallbackCustId,
      amount: '',
      stage: 'QUALIFICATION',
      probability: 50,
      expectedCloseDate: defaultDate,
      assignedToId: '',
      notes: '',
    });
    setFieldErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const openEditModal = (opp) => {
    setIsEdit(true);
    setCurrentId(opp.id);
    setFormData({
      opportunityName: opp.opportunityName,
      customerId: opp.customerId || '',
      amount: opp.amount || '',
      stage: opp.stage || 'QUALIFICATION',
      probability: opp.probability || 50,
      expectedCloseDate: opp.expectedCloseDate || '',
      assignedToId: opp.assignedToId || '',
      notes: opp.notes || '',
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
        customerId: Number(formData.customerId),
        amount: Number(formData.amount),
        probability: Number(formData.probability),
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : null,
      };

      if (isEdit) {
        await api.updateOpportunity(currentId, payload);
        showToast('Deal updated successfully!', 'success');
      } else {
        await api.createOpportunity(payload);
        showToast('Deal created in pipeline!', 'success');
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Operation failed';
      setServerError(msg);
      if (err.data?.validationErrors) setFieldErrors(err.data.validationErrors);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteOpportunity(deleteId);
      showToast('Deal removed from pipeline.', 'success');
      setIsConfirmOpen(false);
      fetchOpportunities();
    } catch (err) {
      showToast(err.data?.message || err.message || 'Delete failed', 'danger');
    }
  };

  const stages = ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

  const getStageColor = (st) => {
    switch (st) {
      case 'QUALIFICATION': return '#3b82f6';
      case 'PROPOSAL': return '#f59e0b';
      case 'NEGOTIATION': return '#8b5cf6';
      case 'WON': return '#10b981';
      case 'LOST': return '#ef4444';
      default: return '#64748b';
    }
  };

  const totalPipelineVal = opportunities.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalWeightedVal = opportunities.reduce((acc, curr) => acc + (curr.weightedPipeline || (curr.amount * curr.probability) / 100 || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', margin: 0 }}>
            Sales Opportunities & Weighted Pipeline
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Track deals across qualification stages. Every deal is linked to customer accounts, follow-ups, and activity history.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* View Mode Switcher */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                borderRadius: '8px 0 0 8px',
                fontSize: 12,
                fontWeight: 600,
                background: viewMode === 'kanban' ? '#ea580c' : 'transparent',
                borderColor: viewMode === 'kanban' ? '#ea580c' : '#fed7aa',
                color: viewMode === 'kanban' ? '#fff' : '#9a3412',
              }}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={14} className="me-1" /> Kanban Board
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                borderRadius: '0 8px 8px 0',
                fontSize: 12,
                fontWeight: 600,
                background: viewMode === 'list' ? '#ea580c' : 'transparent',
                borderColor: viewMode === 'list' ? '#ea580c' : '#fed7aa',
                color: viewMode === 'list' ? '#fff' : '#9a3412',
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} className="me-1" /> Table List
            </button>
          </div>

          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => api.exportReport('opportunities')}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 600, borderColor: '#cbd5e1' }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => openCreateModal()}
            style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c' }}
          >
            <Plus size={16} /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-3 shadow-sm bg-white" style={{ border: '1px solid #fed7aa', borderLeft: '4px solid #ea580c' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Total Deal Volume</span>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{formatINR(totalPipelineVal)}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Across {opportunities.length} tracked deals</div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 rounded-3 shadow-sm bg-white" style={{ border: '1px solid #fed7aa', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Weighted Forecast Value</span>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#047857' }}>{formatINR(Math.round(totalWeightedVal))}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Formula: Deal Amount × Probability %</div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 rounded-3 shadow-sm bg-white d-flex align-items-center justify-content-between" style={{ border: '1px solid #fed7aa', borderLeft: '4px solid #3b82f6' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Analytics & Reports</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Pipeline Stage Breakdown</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Multi-stage win/loss metrics</div>
            </div>
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, borderRadius: 8 }}
              onClick={() => onNavigate && onNavigate('reports')}
            >
              <FileBarChart size={14} /> View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control-custom"
                  style={{ paddingLeft: 36, height: 40 }}
                  placeholder="Filter by deal title or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-control-custom"
                style={{ height: 40 }}
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Deal Stages</option>
                {stages.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-control-custom"
                style={{ height: 40 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open Deals</option>
                <option value="WON">Won Deals</option>
                <option value="LOST">Lost Deals</option>
              </select>
            </div>

            <div className="col-12 col-md-2 text-md-end">
              <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
                Found: <strong>{opportunities.length}</strong> deal(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {stages.map((st) => {
            const oppsInStage = opportunities.filter((o) => o.stage === st);
            const totalStageValue = oppsInStage.reduce((acc, curr) => acc + (curr.amount || 0), 0);

            return (
              <div key={st} className="kanban-column" style={{ border: '1px solid #fed7aa', background: '#fffbeb' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: getStageColor(st),
                      }}
                    ></span>
                    <strong style={{ fontSize: 13, textTransform: 'capitalize', color: '#0f172a' }}>
                      {st.toLowerCase()}
                    </strong>
                    <span className="badge bg-white text-dark border">{oppsInStage.length}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c' }}>
                    {formatINRConcise(totalStageValue)}
                  </span>
                </div>

                <div className="d-flex flex-column gap-2">
                  {oppsInStage.map((opp) => (
                    <div
                      key={opp.id}
                      className="kanban-card shadow-sm"
                      style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: 10, padding: 12 }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                          {opp.opportunityName}
                        </div>
                        <button
                          className="btn btn-sm btn-light p-1 border-0"
                          onClick={() => openEditModal(opp)}
                          title="Edit Deal"
                        >
                          <Edit2 size={13} className="text-muted" />
                        </button>
                      </div>

                      {/* Clickable Customer Link jumping to Customers page */}
                      <div className="d-flex align-items-center gap-1 mb-2">
                        <Building size={12} className="text-muted" />
                        <button
                          className="btn btn-link p-0 text-decoration-none text-truncate text-start"
                          style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', maxWidth: 170 }}
                          onClick={() => onNavigate && onNavigate('customers', { search: opp.customerName })}
                          title={`Click to open ${opp.customerName} in Customers Directory`}
                        >
                          {opp.customerName}
                        </button>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>
                          {formatINR(opp.amount)}
                        </strong>
                        <span className="badge" style={{ background: '#fef3c7', color: '#9a3412', fontSize: 11, fontWeight: 700 }}>
                          {opp.probability}% Prob
                        </span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-2 pt-1 border-top" style={{ fontSize: 11, color: '#64748b' }}>
                        <span>Close: {opp.expectedCloseDate}</span>
                        <div className="d-flex gap-1">
                          {/* 1-Click Jump to Schedule Follow-up for this deal's customer */}
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('followups', {
                                prefillCustomerId: opp.customerId,
                                customerName: opp.customerName,
                                subject: `Follow-up: ${opp.opportunityName}`,
                                openCreate: true,
                              })
                            }
                            title="Schedule Follow-up for this deal"
                          >
                            <CalendarCheck size={12} />
                          </button>
                          {/* 1-Click Jump to Log Activity */}
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('activities', {
                                prefillCustomerId: opp.customerId,
                                customerName: opp.customerName,
                                subject: `Discussed: ${opp.opportunityName}`,
                                openCreate: true,
                              })
                            }
                            title="Log Activity for this deal"
                          >
                            <Activity size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {oppsInStage.length === 0 && (
                    <div className="p-3 text-center text-muted" style={{ fontSize: 12, border: '1px dashed #fed7aa', borderRadius: 8 }}>
                      No deals in {st.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="content-card" style={{ border: '1px solid #fed7aa' }}>
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr style={{ background: '#fffbeb' }}>
                  <th>Opportunity Name</th>
                  <th>Customer Account</th>
                  <th>Deal Value</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Weighted Forecast</th>
                  <th>Close Date</th>
                  <th>Status</th>
                  <th>Assigned Rep</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-muted">
                      Loading opportunities...
                    </td>
                  </tr>
                ) : opportunities.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      <TrendingUp size={32} className="mb-2 opacity-50" />
                      <div>No sales opportunities matching criteria.</div>
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp) => (
                    <tr key={opp.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{opp.opportunityName}</div>
                        {opp.notes && <div style={{ fontSize: 11, color: '#94a3b8' }}>{opp.notes}</div>}
                      </td>
                      <td>
                        {/* Clickable Customer Link jumping straight to Customers page */}
                        <button
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 text-start"
                          style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}
                          onClick={() => onNavigate && onNavigate('customers', { search: opp.customerName })}
                          title={`Click to open ${opp.customerName} in Customer Directory`}
                        >
                          <Building size={13} className="text-muted" />
                          <span>{opp.customerName}</span>
                          <ExternalLink size={10} className="opacity-75" />
                        </button>
                      </td>
                      <td>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>
                          {formatINR(opp.amount)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${getStageColor(opp.stage)}20`,
                            color: getStageColor(opp.stage),
                            border: `1px solid ${getStageColor(opp.stage)}40`,
                            fontWeight: 700,
                          }}
                        >
                          {opp.stage}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6, width: 60 }}>
                            <div
                              className="progress-bar bg-warning"
                              role="progressbar"
                              style={{ width: `${opp.probability}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{opp.probability}%</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: 13 }}>
                          {formatINR(opp.weightedPipeline || (opp.amount * opp.probability) / 100 || 0)}
                        </strong>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: 13 }}>
                          <Calendar size={13} className="text-muted" />
                          {opp.expectedCloseDate}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            opp.status === 'WON'
                              ? 'status-won'
                              : opp.status === 'LOST'
                              ? 'status-lost'
                              : 'status-new'
                          }`}
                        >
                          {opp.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{opp.assignedToName || 'Rohan Verma (Sales)'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('followups', {
                                prefillCustomerId: opp.customerId,
                                customerName: opp.customerName,
                                subject: `Follow-up: ${opp.opportunityName}`,
                                openCreate: true,
                              })
                            }
                            title="Schedule Follow-up"
                          >
                            <CalendarCheck size={14} />
                          </button>
                          <button
                            className="btn btn-sm p-1"
                            style={{ background: '#fef3c7', border: '1px solid #fed7aa', color: '#b45309', borderRadius: 6 }}
                            onClick={() =>
                              onNavigate &&
                              onNavigate('activities', {
                                prefillCustomerId: opp.customerId,
                                customerName: opp.customerName,
                                subject: `Discussion on ${opp.opportunityName}`,
                                openCreate: true,
                              })
                            }
                            title="Log Activity"
                          >
                            <Activity size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border p-1"
                            onClick={() => openEditModal(opp)}
                            title="Edit Opportunity"
                            style={{ borderRadius: 6 }}
                          >
                            <Edit2 size={14} className="text-primary" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border p-1"
                            onClick={() => {
                              setDeleteId(opp.id);
                              setIsConfirmOpen(true);
                            }}
                            title="Delete Opportunity"
                            style={{ borderRadius: 6 }}
                          >
                            <Trash2 size={14} className="text-danger" />
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
      )}

      {/* Create / Edit Opportunity Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom" style={{ maxWidth: 560 }}>
            <div className="modal-header-custom" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ margin: 0, fontWeight: 800, color: '#9a3412', fontSize: 18 }}>
                {isEdit ? 'Edit Sales Opportunity' : 'Create New Sales Deal'}
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
                      Opportunity / Deal Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control-custom ${fieldErrors.opportunityName ? 'is-invalid' : ''}`}
                      value={formData.opportunityName}
                      onChange={(e) => setFormData({ ...formData, opportunityName: e.target.value })}
                      placeholder="e.g. CRM Enterprise Renewal"
                    />
                    {fieldErrors.opportunityName && (
                      <div className="invalid-feedback d-block">{fieldErrors.opportunityName}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">
                      Customer Account <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-control-custom ${fieldErrors.customerId ? 'is-invalid' : ''}`}
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    >
                      <option value="">Select Customer Account...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} ({c.companyName || c.customerCode || 'Client'})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.customerId && (
                      <div className="invalid-feedback d-block">{fieldErrors.customerId}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">
                      Deal Amount (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`form-control-custom ${fieldErrors.amount ? 'is-invalid' : ''}`}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. 6500000"
                    />
                    {fieldErrors.amount && (
                      <div className="invalid-feedback d-block">{fieldErrors.amount}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">
                      Probability (% 0-100) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`form-control-custom ${fieldErrors.probability ? 'is-invalid' : ''}`}
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    />
                    {fieldErrors.probability && (
                      <div className="invalid-feedback d-block">{fieldErrors.probability}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">Pipeline Stage</label>
                    <select
                      className="form-control-custom"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    >
                      {stages.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label-custom">
                      Expected Close Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control-custom ${fieldErrors.expectedCloseDate ? 'is-invalid' : ''}`}
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    />
                    {fieldErrors.expectedCloseDate && (
                      <div className="invalid-feedback d-block">{fieldErrors.expectedCloseDate}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label-custom">Assign Deal Executive</label>
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
                    <label className="form-label-custom">Deal Strategy Notes</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Key requirements, negotiation levers, executive sponsor..."
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
                  {isEdit ? 'Save Changes' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Opportunity"
        message="Are you sure you want to remove this opportunity? It will be removed from pipeline forecast totals."
        confirmText="Yes, Delete Deal"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
