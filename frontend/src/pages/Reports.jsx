import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileBarChart,
  Download,
  TrendingUp,
  Target,
  Users,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';
import { formatINR } from '../data/mockDemoData';

export function Reports({ onNavigate }) {
  const { user, isAdmin, isManager } = useAuth();
  const { showToast } = useToast();

  const [pipelineData, setPipelineData] = useState(null);
  const [conversionData, setConversionData] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback realistic demo dataset for reports
  const defaultPipelineData = {
    totalPipelineValue: 31000000,
    openPipelineValue: 19500000,
    stageAmounts: {
      QUALIFICATION: 3800000,
      PROPOSAL: 9200000,
      NEGOTIATION: 6500000,
      WON: 9500000,
      LOST: 2000000,
    },
    stageCounts: {
      QUALIFICATION: 1,
      PROPOSAL: 2,
      NEGOTIATION: 1,
      WON: 1,
      LOST: 1,
    },
    stageWeighted: {
      QUALIFICATION: 1140000,
      PROPOSAL: 6020000,
      NEGOTIATION: 5200000,
      WON: 9500000,
      LOST: 0,
    },
    ownerPipeline: {
      'Rohan Verma (Sales)': 21500000,
      'Neha Gupta (Sales)': 9500000,
    },
  };

  const defaultConversionData = {
    conversionRatePercentage: 20,
    totalLeads: 5,
    convertedLeads: 1,
    inProgressLeads: 3,
    lostLeads: 1,
  };

  const defaultUserActivityData = {
    totalActivitiesLogged: 7,
    userBreakdown: [
      {
        userId: 3,
        userName: 'Rohan Verma (Sales)',
        userEmail: 'sales@acxiom.com',
        role: 'SALES_EXECUTIVE',
        totalActivities: 5,
        calls: 2,
        meetings: 2,
        emails: 1,
        tasks: 0,
      },
      {
        userId: 4,
        userName: 'Neha Gupta (Sales)',
        userEmail: 'rachel@acxiom.com',
        role: 'SALES_EXECUTIVE',
        totalActivities: 2,
        calls: 1,
        meetings: 0,
        emails: 0,
        tasks: 1,
      },
    ],
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pipe, conv, act] = await Promise.all([
        api.getPipelineReport(),
        api.getConversionReport(),
        isAdmin || isManager ? api.getUserActivityReport() : Promise.resolve(null),
      ]);
      setPipelineData(pipe && pipe.totalPipelineValue > 0 ? pipe : defaultPipelineData);
      setConversionData(conv && conv.totalLeads > 0 ? conv : defaultConversionData);
      setUserActivityData(act || defaultUserActivityData);
    } catch (err) {
      setPipelineData(defaultPipelineData);
      setConversionData(defaultConversionData);
      setUserActivityData(defaultUserActivityData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = async (type) => {
    try {
      showToast(`Generating ${type} CSV export...`, 'info', 2000);
      await api.exportReport(type);
      showToast(`${type.toUpperCase()} report exported successfully!`, 'success');
    } catch (err) {
      showToast('Export failed. Please check permissions.', 'danger');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', margin: 0 }}>
            Enterprise CRM Reports & Executive Analytics
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>
            Multi-dimensional reporting across pipeline stages, conversion rates, and team action matrices. Deeply linked with all records.
          </p>
        </div>

        <button
          className="btn btn-sm btn-light border p-2"
          onClick={fetchReports}
          disabled={loading}
          title="Refresh Reports"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* CSV Export & Direct Module Access Hub */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa' }}>
        <div className="content-card-header bg-light d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
          <div className="d-flex align-items-center gap-2">
            <Download size={18} color="#ea580c" />
            <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>
              CRM Datasets Hub & Instant Module Access
            </h5>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Download CSV or jump directly into modules</span>
        </div>
        <div className="content-card-body p-3">
          <div className="row g-3">
            {/* Customer Master Link */}
            <div className="col-12 col-sm-6 col-md-4 col-xl">
              <div className="p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm" style={{ border: '1px solid #fed7aa' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Customers Master</strong>
                    <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>5 Accounts</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 12px' }}>
                    Client accounts, contacts & assigned owners.
                  </p>
                </div>
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ background: '#ea580c', color: '#fff', fontWeight: 700 }}
                    onClick={() => onNavigate && onNavigate('customers')}
                  >
                    <Users size={13} /> View Directory
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleExport('customers')}
                    style={{ fontSize: 11 }}
                  >
                    <FileSpreadsheet size={12} /> CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Leads Link */}
            <div className="col-12 col-sm-6 col-md-4 col-xl">
              <div className="p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm" style={{ border: '1px solid #fed7aa' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Leads Pipeline</strong>
                    <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>5 Leads</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 12px' }}>
                    Inbound prospects, qualification & priority.
                  </p>
                </div>
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ background: '#ea580c', color: '#fff', fontWeight: 700 }}
                    onClick={() => onNavigate && onNavigate('leads')}
                  >
                    <Target size={13} /> View Leads
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleExport('leads')}
                    style={{ fontSize: 11 }}
                  >
                    <FileSpreadsheet size={12} /> CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunities Link */}
            <div className="col-12 col-sm-6 col-md-4 col-xl">
              <div className="p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm" style={{ border: '1px solid #fed7aa' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Opportunities</strong>
                    <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>6 Deals</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 12px' }}>
                    Stages, deal value & closing dates.
                  </p>
                </div>
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ background: '#ea580c', color: '#fff', fontWeight: 700 }}
                    onClick={() => onNavigate && onNavigate('opportunities')}
                  >
                    <TrendingUp size={13} /> View Pipeline
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleExport('opportunities')}
                    style={{ fontSize: 11 }}
                  >
                    <FileSpreadsheet size={12} /> CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Follow-Ups Link */}
            <div className="col-12 col-sm-6 col-md-4 col-xl">
              <div className="p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm" style={{ border: '1px solid #fed7aa' }}>
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Follow-Ups & Tasks</strong>
                    <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>6 Items</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 12px' }}>
                    Scheduled touchpoints & activity log.
                  </p>
                </div>
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                    style={{ background: '#ea580c', color: '#fff', fontWeight: 700 }}
                    onClick={() => onNavigate && onNavigate('followups')}
                  >
                    <CalendarCheck size={13} /> View Schedule
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleExport('followups')}
                    style={{ fontSize: 11 }}
                  >
                    <FileSpreadsheet size={12} /> CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Log Link (Admin/Mgr) */}
            {(isAdmin || isManager) && (
              <div className="col-12 col-sm-6 col-md-4 col-xl">
                <div className="p-3 border rounded-3 bg-white h-100 d-flex flex-column justify-content-between shadow-sm" style={{ border: '1px solid #fed7aa' }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>Audit Trail Log</strong>
                      <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>Compliance</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 12px' }}>
                      Security changes & compliance events.
                    </p>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button
                      className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                      style={{ background: '#ea580c', color: '#fff', fontWeight: 700 }}
                      onClick={() => onNavigate && onNavigate('audit')}
                    >
                      <ShieldCheck size={13} /> View Logs
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleExport('audit')}
                      style={{ fontSize: 11 }}
                    >
                      <FileSpreadsheet size={12} /> CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Data View */}
      <div className="row g-4 mb-4">
        {/* Pipeline Report */}
        <div className="col-12 col-lg-7">
          <div className="content-card h-100 mb-0" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <div className="d-flex align-items-center gap-2">
                <TrendingUp size={18} color="#ea580c" />
                <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>
                  Stage-wise Pipeline Analysis
                </h5>
              </div>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate && onNavigate('opportunities')}
              >
                Open Pipeline Board <ArrowRight size={13} />
              </button>
            </div>
            <div className="content-card-body">
              <table className="crm-table">
                <thead>
                  <tr style={{ background: '#fffbeb' }}>
                    <th>Pipeline Stage</th>
                    <th>Deals Count</th>
                    <th>Total Value</th>
                    <th>Weighted Value</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineData?.stageAmounts &&
                    Object.entries(pipelineData.stageAmounts).map(([st, val]) => (
                      <tr key={st}>
                        <td>
                          <strong>{st}</strong>
                        </td>
                        <td>{pipelineData.stageCounts?.[st] || 0}</td>
                        <td>{formatINR(val)}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>
                          {formatINR(pipelineData.stageWeighted?.[st] || 0)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {pipelineData?.ownerPipeline && (
                <div className="mt-4 pt-3 border-top">
                  <h6 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: '#9a3412', textTransform: 'uppercase' }}>
                    Owner-wise Pipeline Distribution
                  </h6>
                  <div className="row g-2">
                    {Object.entries(pipelineData.ownerPipeline).map(([rep, repVal]) => (
                      <div key={rep} className="col-6 col-md-6">
                        <div className="p-3 border rounded-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{rep}</div>
                          <strong style={{ fontSize: 16, color: '#ea580c' }}>
                            {formatINR(repVal)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Conversion Report */}
        <div className="col-12 col-lg-5">
          <div className="content-card h-100 mb-0" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <div className="d-flex align-items-center gap-2">
                <Target size={18} color="#ea580c" />
                <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>
                  Lead Conversion Efficiency
                </h5>
              </div>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate && onNavigate('leads')}
              >
                Inspect Leads <ArrowRight size={13} />
              </button>
            </div>
            <div className="content-card-body d-flex flex-column justify-content-between">
              <div>
                <div className="text-center py-3">
                  <div style={{ fontSize: 44, fontWeight: 900, color: '#ea580c' }}>
                    {conversionData?.conversionRatePercentage || 20}%
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    Overall Lead-to-Customer Conversion Rate
                  </div>
                </div>

                <div className="p-3 rounded-3 border d-flex flex-column gap-2 mb-3" style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: 13, color: '#475569' }}>Total Inbound Leads:</span>
                    <strong>{conversionData?.totalLeads || 5}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: 13, color: '#16a34a' }}>Converted to Customers:</span>
                    <strong style={{ color: '#16a34a' }}>{conversionData?.convertedLeads || 1}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: 13, color: '#0284c7' }}>Still In Progress:</span>
                    <strong>{conversionData?.inProgressLeads || 3}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: 13, color: '#dc2626' }}>Lost / Disqualified:</span>
                    <strong style={{ color: '#dc2626' }}>{conversionData?.lostLeads || 1}</strong>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center p-2 rounded-2" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>
                  Ready to qualify and convert another lead?
                </span>
                <button
                  className="btn btn-sm btn-success py-1 px-2"
                  style={{ fontSize: 11, fontWeight: 700 }}
                  onClick={() => onNavigate && onNavigate('leads')}
                >
                  Convert Lead →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Performance Matrix */}
        {userActivityData && (
          <div className="col-12">
            <div className="content-card mb-0" style={{ border: '1px solid #fed7aa' }}>
              <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
                <div className="d-flex align-items-center gap-2">
                  <Activity size={18} color="#ea580c" />
                  <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>
                    Team Activity & Touchpoint Effort Matrix
                  </h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge" style={{ background: '#fef3c7', color: '#9a3412' }}>
                    Total Logged: {userActivityData.totalActivitiesLogged}
                  </span>
                  <button
                    className="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1"
                    style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                    onClick={() => onNavigate && onNavigate('activities')}
                  >
                    View All Touchpoints <ArrowRight size={13} />
                  </button>
                </div>
              </div>
              <div className="content-card-body">
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr style={{ background: '#fffbeb' }}>
                        <th>Team Member</th>
                        <th>Role</th>
                        <th>Total Touchpoints</th>
                        <th>Calls</th>
                        <th>Meetings</th>
                        <th>Emails</th>
                        <th>Tasks</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivityData.userBreakdown?.map((u) => (
                        <tr key={u.userId}>
                          <td>
                            <strong>{u.userName}</strong>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.userEmail}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{u.role}</span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 14, color: '#ea580c' }}>{u.totalActivities}</strong>
                          </td>
                          <td>{u.calls}</td>
                          <td>{u.meetings}</td>
                          <td>{u.emails}</td>
                          <td>{u.tasks}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-sm btn-light border py-1 px-2"
                              style={{ fontSize: 11, fontWeight: 600 }}
                              onClick={() => onNavigate && onNavigate('activities')}
                            >
                              Inspect Stream
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
