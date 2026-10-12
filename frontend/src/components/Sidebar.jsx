import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  CalendarCheck,
  Activity,
  FileBarChart,
  ShieldAlert,
  UserCheck,
  LogOut,
  Zap,
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin, isManager } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge-role badge-role-admin">Admin</span>;
      case 'MANAGER':
        return <span className="badge-role badge-role-manager">Manager</span>;
      default:
        return <span className="badge-role badge-role-sales">Sales Exec</span>;
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap size={22} />
        </div>
        <div>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Acxiom<span style={{ color: '#fbbf24' }}>CRM</span>
          </div>
          <div style={{ fontSize: '11px', color: '#a8a29e' }}>Enterprise Sales Suite</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="nav-section-title">Overview</div>
        <button
          className={`nav-link-custom ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <div className="nav-section-title">Sales & CRM</div>
        <button
          className={`nav-link-custom ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} />
          <span>Customers</span>
        </button>
        <button
          className={`nav-link-custom ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <Target size={18} />
          <span>Leads</span>
        </button>
        <button
          className={`nav-link-custom ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          <TrendingUp size={18} />
          <span>Opportunities</span>
        </button>
        <button
          className={`nav-link-custom ${activeTab === 'followups' ? 'active' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          <CalendarCheck size={18} />
          <span>Follow-Ups</span>
        </button>
        <button
          className={`nav-link-custom ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Activity size={18} />
          <span>Activities</span>
        </button>

        <div className="nav-section-title">Analytics</div>
        <button
          className={`nav-link-custom ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileBarChart size={18} />
          <span>Reports & Export</span>
        </button>

        {(isAdmin || isManager) && (
          <>
            <div className="nav-section-title">Governance</div>
            {isAdmin && (
              <button
                className={`nav-link-custom ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <UserCheck size={18} />
                <span>User Management</span>
              </button>
            )}
            <button
              className={`nav-link-custom ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <ShieldAlert size={18} />
              <span>Audit Logs</span>
            </button>
          </>
        )}
      </div>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{getRoleBadge(user?.role)}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
