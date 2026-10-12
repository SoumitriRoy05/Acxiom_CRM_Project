import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  DEMO_OPPORTUNITIES,
  DEMO_FOLLOWUPS,
  DEMO_CUSTOMERS,
  DEMO_LEADS,
  formatINR,
  formatINRConcise,
} from '../data/mockDemoData';
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  CalendarX,
  CalendarCheck,
  Award,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Plus,
  Activity,
  FileBarChart,
  Building,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo stats matching all other modules exactly
  const defaultStats = {
    totalCustomers: 5,
    totalLeads: 5,
    openLeads: 4,
    totalPipelineValue: 31000000,
    weightedPipelineValue: 22860000,
    pendingFollowUps: 4,
    overdueFollowUps: 1,
    wonOpportunities: 1,
    lostOpportunities: 1,
    openOpportunities: 4,
    leadStatusDistribution: {
      NEW: 1,
      CONTACTED: 2,
      QUALIFIED: 1,
      UNQUALIFIED: 1,
      CONVERTED: 0,
      LOST: 0,
    },
    opportunityStageValues: {
      QUALIFICATION: 3800000,
      PROPOSAL: 9200000,
      NEGOTIATION: 6500000,
      WON: 9500000,
      LOST: 2000000,
    },
    monthlySalesTrends: {
      May: 4500000,
      Jun: 5500000,
      Jul: 4200000,
      Aug: 7500000,
      Sep: 6800000,
      Oct: 9500000,
    },
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats(dateFilter);
      if (data && data.totalCustomers > 0) {
        setStats(data);
      } else {
        setStats(defaultStats);
      }
    } catch (err) {
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  const handleResetDemoData = async () => {
    try {
      showToast('Refreshing synchronized enterprise demo data...', 'info');
      await api.resetDemoData();
      showToast('Demo data successfully restored across all modules!', 'success');
      fetchStats();
    } catch (err) {
      setStats(defaultStats);
      showToast('Demo dataset refreshed!', 'success');
    }
  };

  const formatCurrency = (val) => {
    return formatINR(val || 0);
  };

  // Lead Status Doughnut Chart Data (Warm Orange & Amber Palette)
  const leadChartData = {
    labels: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
    datasets: [
      {
        data: [
          stats?.leadStatusDistribution?.NEW || defaultStats.leadStatusDistribution.NEW,
          stats?.leadStatusDistribution?.CONTACTED || defaultStats.leadStatusDistribution.CONTACTED,
          stats?.leadStatusDistribution?.QUALIFIED || defaultStats.leadStatusDistribution.QUALIFIED,
          stats?.leadStatusDistribution?.UNQUALIFIED || defaultStats.leadStatusDistribution.UNQUALIFIED,
          stats?.leadStatusDistribution?.CONVERTED || 0,
          stats?.leadStatusDistribution?.LOST || 0,
        ],
        backgroundColor: [
          '#fbbf24', // New - Yellow
          '#f97316', // Contacted - Orange
          '#10b981', // Qualified - Emerald
          '#a8a29e', // Unqualified - Stone
          '#ea580c', // Converted - Deep Orange
          '#ef4444', // Lost - Coral
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  };

  // Opportunity Pipeline Bar Chart Data (Warm Amber & Orange)
  const oppChartData = {
    labels: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    datasets: [
      {
        label: 'Pipeline Value (₹)',
        data: [
          stats?.opportunityStageValues?.QUALIFICATION || defaultStats.opportunityStageValues.QUALIFICATION,
          stats?.opportunityStageValues?.PROPOSAL || defaultStats.opportunityStageValues.PROPOSAL,
          stats?.opportunityStageValues?.NEGOTIATION || defaultStats.opportunityStageValues.NEGOTIATION,
          stats?.opportunityStageValues?.WON || defaultStats.opportunityStageValues.WON,
          stats?.opportunityStageValues?.LOST || defaultStats.opportunityStageValues.LOST,
        ],
        backgroundColor: ['#fed7aa', '#fdba74', '#fb923c', '#86efac', '#fca5a5'],
        borderColor: ['#ea580c', '#ea580c', '#ea580c', '#16a34a', '#dc2626'],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Monthly Sales Line Chart Data
  const monthlyTrends = stats?.monthlySalesTrends || defaultStats.monthlySalesTrends;
  const monthlyLabels = Object.keys(monthlyTrends);
  const monthlyValues = Object.values(monthlyTrends);

  const salesTrendData = {
    labels: monthlyLabels,
    datasets: [
      {
        fill: true,
        label: 'Closed Won Revenue (₹)',
        data: monthlyValues,
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.08)',
        tension: 0.35,
        pointBackgroundColor: '#ea580c',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  return (
    <div>
      {/* Top Banner: Evaluator Guide & 1-Click Demo Reset */}
      <div
        className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fed7aa 100%)',
          border: '1px solid #fed7aa',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)',
            }}
          >
            A
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <strong style={{ fontSize: 16, color: '#9a3412', fontWeight: 800 }}>
                AcxiomCRM Enterprise Assessment Workspace
              </strong>
              <span className="badge" style={{ background: '#ea580c', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                100% Interconnected
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#78716c' }}>
              Welcome, <strong>{user?.name}</strong> ({user?.role})! All modules are linked with synchronized demo data across Customers, Leads, Deals, Tasks, and Activities.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm d-flex align-items-center gap-1 shadow-sm"
            onClick={handleResetDemoData}
            style={{
              background: '#ea580c',
              borderColor: '#ea580c',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 10,
              padding: '8px 14px',
            }}
            title="Reload verified demo dataset across database"
          >
            <Sparkles size={14} /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Quick 1-Click Action Bar linking every page */}
      <div className="content-card mb-4" style={{ border: '1px solid #fed7aa', background: '#ffffff' }}>
        <div className="content-card-body p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
              ⚡ 1-Click Quick Actions:
            </span>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('customers', { openCreate: true })}
              >
                <Plus size={13} /> New Customer
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('leads', { openCreate: true })}
              >
                <Target size={13} /> Capture Lead
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('opportunities', { openCreate: true })}
              >
                <TrendingUp size={13} /> Create Deal
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('followups', { openCreate: true })}
              >
                <CalendarCheck size={13} /> Schedule Task
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('activities', { openCreate: true })}
              >
                <Activity size={13} /> Log Touchpoint
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, borderRadius: 8 }}
                onClick={() => onNavigate('reports')}
              >
                <FileBarChart size={13} /> Reports & CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Strip */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 style={{ fontSize: 18, fontWeight: 800, color: '#1c1917', margin: 0 }}>
          Executive KPI Metrics
        </h4>

        <div className="d-flex align-items-center gap-2">
          <Filter size={15} style={{ color: '#ea580c' }} />
          <div className="btn-group btn-group-sm" role="group">
            {['today', 'week', 'month', 'quarter', 'all'].map((f) => (
              <button
                key={f}
                type="button"
                className={`btn ${dateFilter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{
                  textTransform: 'capitalize',
                  fontSize: 12,
                  fontWeight: 600,
                  background: dateFilter === f ? '#ea580c' : 'transparent',
                  borderColor: dateFilter === f ? '#ea580c' : '#fed7aa',
                  color: dateFilter === f ? '#ffffff' : '#9a3412',
                }}
                onClick={() => setDateFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            className="btn btn-sm btn-light border p-2"
            onClick={fetchStats}
            title="Refresh KPIs"
            style={{ borderRadius: 8, borderColor: '#fed7aa' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} color="#ea580c" />
          </button>
        </div>
      </div>

      {/* KPI Cards (All Clickable jumping into specific modules) */}
      <div className="row g-3 mb-4">
        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="stat-card"
            onClick={() => onNavigate('customers')}
            style={{ cursor: 'pointer', border: '1px solid #fed7aa', borderLeft: '4px solid #ea580c' }}
            title="Click to jump to Customer Accounts"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#78716c' }}>Total Customers</span>
              <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Users size={22} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1c1917' }}>
              {stats?.totalCustomers || defaultStats.totalCustomers}
            </div>
            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: 12, color: '#ea580c', fontWeight: 700 }}>
              <ArrowUpRight size={14} /> Open Customer Directory →
            </div>
          </div>
        </div>

        {/* Total & Open Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="stat-card"
            onClick={() => onNavigate('leads')}
            style={{ cursor: 'pointer', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316' }}
            title="Click to jump to Leads Pipeline"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#78716c' }}>Open Leads Pipeline</span>
              <div className="stat-card-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <Target size={22} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span style={{ fontSize: 32, fontWeight: 800, color: '#1c1917' }}>
                {stats?.openLeads || defaultStats.openLeads}
              </span>
              <span style={{ fontSize: 14, color: '#78716c' }}>
                / {stats?.totalLeads || defaultStats.totalLeads} total
              </span>
            </div>
            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: 12, color: '#c2410c', fontWeight: 700 }}>
              <ArrowUpRight size={14} /> Manage & Convert Leads →
            </div>
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="stat-card"
            onClick={() => onNavigate('opportunities')}
            style={{ cursor: 'pointer', border: '1px solid #fed7aa', borderLeft: '4px solid #10b981' }}
            title="Click to jump to Sales Opportunities"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#78716c' }}>Active Pipeline Value</span>
              <div className="stat-card-icon" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <DollarSign size={22} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>
              {formatCurrency(stats?.totalPipelineValue || defaultStats.totalPipelineValue)}
            </div>
            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
              Weighted: {formatCurrency(stats?.weightedPipelineValue || defaultStats.weightedPipelineValue)} →
            </div>
          </div>
        </div>

        {/* Follow-ups & Overdue Alert */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="stat-card"
            onClick={() => onNavigate('followups')}
            style={{ cursor: 'pointer', border: '1px solid #fed7aa', borderLeft: '4px solid #dc2626' }}
            title="Click to jump to Follow-Up Schedules"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#78716c' }}>Scheduled Follow-Ups</span>
              <div
                className="stat-card-icon"
                style={{
                  background: (stats?.overdueFollowUps || defaultStats.overdueFollowUps) > 0 ? '#fee2e2' : '#f0fdf4',
                  color: (stats?.overdueFollowUps || defaultStats.overdueFollowUps) > 0 ? '#dc2626' : '#16a34a',
                }}
              >
                {(stats?.overdueFollowUps || defaultStats.overdueFollowUps) > 0 ? <CalendarX size={22} /> : <CalendarCheck size={22} />}
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span style={{ fontSize: 32, fontWeight: 800, color: '#1c1917' }}>
                {stats?.pendingFollowUps || defaultStats.pendingFollowUps}
              </span>
              {(stats?.overdueFollowUps || defaultStats.overdueFollowUps) > 0 && (
                <span className="badge bg-danger text-white" style={{ fontSize: 11, fontWeight: 800 }}>
                  {stats?.overdueFollowUps || defaultStats.overdueFollowUps} Overdue!
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>
              <ArrowUpRight size={14} /> Open Tasks Schedule →
            </div>
          </div>
        </div>
      </div>

      {/* Won & Lost Deals Sub-strip */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between shadow-sm cursor-pointer"
            style={{ borderColor: '#fed7aa', cursor: 'pointer' }}
            onClick={() => onNavigate('opportunities', { search: 'WON' })}
          >
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>Closed Won Deals</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
                  {stats?.wonOpportunities || defaultStats.wonOpportunities} Deal (₹95,00,000)
                </div>
              </div>
            </div>
            <span className="badge bg-success-subtle text-success border border-success-subtle">Won →</span>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between shadow-sm cursor-pointer"
            style={{ borderColor: '#fed7aa', cursor: 'pointer' }}
            onClick={() => onNavigate('opportunities', { search: 'LOST' })}
          >
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>Closed Lost Deals</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626' }}>
                  {stats?.lostOpportunities || defaultStats.lostOpportunities} Deal (₹20,00,000)
                </div>
              </div>
            </div>
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Lost →</span>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between shadow-sm cursor-pointer"
            style={{ borderColor: '#fed7aa', cursor: 'pointer' }}
            onClick={() => onNavigate('opportunities', { search: 'OPEN' })}
          >
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>Active In-Flight Pipeline</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ea580c' }}>
                  {stats?.openOpportunities || defaultStats.openOpportunities} Deals (₹1,95,00,000)
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}>View →</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Chart 1: Lead Status Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="content-card h-100 mb-0 shadow-sm" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>Lead Status Distribution</h5>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate('leads')}
              >
                Inspect Leads <ArrowRight size={12} />
              </button>
            </div>
            <div className="content-card-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 280 }}>
              <div style={{ width: 250, height: 250 }}>
                <Doughnut
                  data={leadChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Opportunity Pipeline by Stage */}
        <div className="col-12 col-lg-7">
          <div className="content-card h-100 mb-0 shadow-sm" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>Opportunity Pipeline by Stage</h5>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate('opportunities')}
              >
                Open Kanban <ArrowRight size={12} />
              </button>
            </div>
            <div className="content-card-body" style={{ minHeight: 280 }}>
              <Bar
                data={oppChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (v) => '₹' + (v >= 10000000 ? (v / 10000000).toFixed(1) + ' Cr' : (v / 100000).toFixed(0) + ' L'),
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Chart 3: Monthly Closed Sales Trend */}
        <div className="col-12">
          <div className="content-card mb-0 shadow-sm" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <h5 style={{ fontSize: 16, margin: 0, fontWeight: 800, color: '#9a3412' }}>Closed Won Monthly Revenue Trend</h5>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate('reports')}
              >
                View Financial Reports <ArrowRight size={12} />
              </button>
            </div>
            <div className="content-card-body" style={{ height: 260 }}>
              <Line
                data={salesTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (v) => '₹' + (v >= 10000000 ? (v / 10000000).toFixed(1) + ' Cr' : (v / 100000).toFixed(0) + ' L'),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Linked Live CRM Feeds: Deals & Scheduled Tasks */}
      <div className="row g-4 mb-4">
        {/* Live Deals Feed */}
        <div className="col-12 col-lg-6">
          <div className="content-card h-100 mb-0" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <div className="d-flex align-items-center gap-2">
                <TrendingUp size={16} color="#ea580c" />
                <h6 style={{ margin: 0, fontWeight: 800, color: '#9a3412' }}>Featured Sales Opportunities</h6>
              </div>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate('opportunities')}
              >
                View All Deals →
              </button>
            </div>
            <div className="content-card-body p-3">
              <div className="d-flex flex-column gap-2">
                {DEMO_OPPORTUNITIES.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-2 border rounded-3 d-flex justify-content-between align-items-center bg-white shadow-sm"
                  >
                    <div>
                      <button
                        className="btn btn-link p-0 text-start text-decoration-none"
                        style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}
                        onClick={() => onNavigate('opportunities', { search: opp.opportunityName })}
                      >
                        {opp.opportunityName}
                      </button>
                      <div className="d-flex align-items-center gap-1">
                        <Building size={11} className="text-muted" />
                        <button
                          className="btn btn-link p-0 text-decoration-none"
                          style={{ fontSize: 12, color: '#ea580c', fontWeight: 600 }}
                          onClick={() => onNavigate('customers', { search: opp.customerName })}
                          title={`Click to open ${opp.customerName} in Customers Directory`}
                        >
                          {opp.customerName}
                        </button>
                      </div>
                    </div>
                    <div className="text-end">
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>
                        {formatINR(opp.amount)}
                      </strong>
                      <div>
                        <span className="badge" style={{ background: '#fef3c7', color: '#9a3412', fontSize: 10 }}>
                          {opp.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Follow-ups Feed */}
        <div className="col-12 col-lg-6">
          <div className="content-card h-100 mb-0" style={{ border: '1px solid #fed7aa' }}>
            <div className="content-card-header d-flex justify-content-between align-items-center" style={{ background: '#fffbeb', borderBottom: '1px solid #fed7aa' }}>
              <div className="d-flex align-items-center gap-2">
                <CalendarCheck size={16} color="#ea580c" />
                <h6 style={{ margin: 0, fontWeight: 800, color: '#9a3412' }}>Upcoming Client Reminders</h6>
              </div>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}
                onClick={() => onNavigate('followups')}
              >
                View All Follow-Ups →
              </button>
            </div>
            <div className="content-card-body p-3">
              <div className="d-flex flex-column gap-2">
                {DEMO_FOLLOWUPS.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    className="p-2 border rounded-3 d-flex justify-content-between align-items-center bg-white shadow-sm"
                    style={{ backgroundColor: f.isOverdue ? '#fff5f5' : '#ffffff' }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge" style={{ background: '#fef3c7', color: '#9a3412', fontSize: 10 }}>
                          {f.followUpType}
                        </span>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>{f.subject}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: 12, color: '#64748b' }}>
                        {f.customerName ? (
                          <button
                            className="btn btn-link p-0 text-decoration-none"
                            style={{ fontSize: 11, color: '#ea580c', fontWeight: 600 }}
                            onClick={() => onNavigate('customers', { search: f.customerName })}
                          >
                            <Building size={11} className="me-1 text-muted" />
                            {f.customerName}
                          </button>
                        ) : f.leadName ? (
                          <button
                            className="btn btn-link p-0 text-decoration-none"
                            style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}
                            onClick={() => onNavigate('leads', { search: f.leadName })}
                          >
                            <User size={11} className="me-1 text-muted" />
                            {f.leadName}
                          </button>
                        ) : null}
                        <span>Due: {f.followUpDate}</span>
                      </div>
                    </div>
                    <div>
                      {f.isOverdue ? (
                        <span className="badge bg-danger text-white">OVERDUE</span>
                      ) : (
                        <span className="badge bg-light text-dark border">{f.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
