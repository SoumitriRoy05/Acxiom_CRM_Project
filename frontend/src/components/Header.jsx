import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Sparkles, Building, Target, TrendingUp, X } from 'lucide-react';
import { DEMO_CUSTOMERS, DEMO_LEADS, DEMO_OPPORTUNITIES } from '../data/mockDemoData';

export function Header({ title, globalSearch, setGlobalSearch, onQuickSwitchRole, onNavigate }) {
  const { user } = useAuth();
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Quick matches across cohesive demo data
  const searchMatches = (() => {
    if (!globalSearch || globalSearch.trim().length < 2) return null;
    const q = globalSearch.toLowerCase();
    const custs = DEMO_CUSTOMERS.filter((c) => c.customerName.toLowerCase().includes(q)).slice(0, 2);
    const leads = DEMO_LEADS.filter((l) => l.leadName.toLowerCase().includes(q) || (l.companyName && l.companyName.toLowerCase().includes(q))).slice(0, 2);
    const opps = DEMO_OPPORTUNITIES.filter((o) => o.opportunityName.toLowerCase().includes(q)).slice(0, 2);
    return { custs, leads, opps };
  })();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      setShowSearchResults(false);
      if (onNavigate) {
        onNavigate('customers', { search: globalSearch });
      }
    }
  };

  return (
    <header className="app-header">
      <div className="d-flex align-items-center gap-3">
        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#9a3412' }}>
          {title}
        </h1>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Global Search Pattern */}
        <div style={{ position: 'relative', width: 300 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ea580c',
            }}
          />
          <input
            type="text"
            className="form-control-custom"
            placeholder="Search across all CRM modules..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleKeyDown}
            style={{ paddingLeft: 36, paddingRight: globalSearch ? 30 : 12, fontSize: 13, height: 38, borderColor: '#fed7aa' }}
          />

          {globalSearch && (
            <button
              className="btn btn-link p-0 text-muted"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => {
                setGlobalSearch('');
                setShowSearchResults(false);
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Quick Cross-Module Search Dropdown */}
          {showSearchResults && searchMatches && (searchMatches.custs.length > 0 || searchMatches.leads.length > 0 || searchMatches.opps.length > 0) && (
            <div
              className="position-absolute bg-white shadow-lg rounded-3 border p-2 mt-1"
              style={{
                width: '100%',
                zIndex: 1050,
                borderColor: '#fed7aa',
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', padding: '4px 8px' }}>
                Quick Matches:
              </div>

              {searchMatches.custs.map((c) => (
                <button
                  key={c.id}
                  className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-2 text-start"
                  onClick={() => {
                    setShowSearchResults(false);
                    onNavigate && onNavigate('customers', { search: c.customerName });
                  }}
                >
                  <Building size={14} className="text-primary" />
                  <div className="text-truncate">
                    <strong style={{ fontSize: 13 }}>{c.customerName}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Customer • {c.companyName}</div>
                  </div>
                </button>
              ))}

              {searchMatches.leads.map((l) => (
                <button
                  key={l.id}
                  className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-2 text-start"
                  onClick={() => {
                    setShowSearchResults(false);
                    onNavigate && onNavigate('leads', { search: l.leadName });
                  }}
                >
                  <Target size={14} className="text-warning" />
                  <div className="text-truncate">
                    <strong style={{ fontSize: 13 }}>{l.leadName}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Lead • {l.companyName}</div>
                  </div>
                </button>
              ))}

              {searchMatches.opps.map((o) => (
                <button
                  key={o.id}
                  className="dropdown-item d-flex align-items-center gap-2 p-2 rounded-2 text-start"
                  onClick={() => {
                    setShowSearchResults(false);
                    onNavigate && onNavigate('opportunities', { search: o.opportunityName });
                  }}
                >
                  <TrendingUp size={14} className="text-success" />
                  <div className="text-truncate">
                    <strong style={{ fontSize: 13 }}>{o.opportunityName}</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Deal • ₹{(o.amount || 0).toLocaleString('en-IN')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Role Switcher Shortcut */}
        <div className="dropdown">
          <button
            className="btn btn-sm d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ borderRadius: 10, height: 40, fontSize: 13, fontWeight: 700, background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c' }}
          >
            <Sparkles size={16} color="#f59e0b" />
            <span>Switch Persona</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-lg" style={{ minWidth: 260, borderRadius: 14, border: '1px solid #fed7aa', padding: 8 }}>
            <li><h6 className="dropdown-header text-uppercase" style={{ fontSize: 11, fontWeight: 800, color: '#ea580c' }}>Role Experience Mode</h6></li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center justify-content-between py-2 rounded-2"
                onClick={() => onQuickSwitchRole('admin@acxiom.com', 'Admin@1234')}
              >
                <span style={{ fontWeight: 600 }}>👑 Admin (Aarav Sharma)</span>
                {user?.role === 'ADMIN' && <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Active</span>}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center justify-content-between py-2 rounded-2"
                onClick={() => onQuickSwitchRole('manager@acxiom.com', 'Manager@1234')}
              >
                <span style={{ fontWeight: 600 }}>💼 Manager (Pooja Verma)</span>
                {user?.role === 'MANAGER' && <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Active</span>}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center justify-content-between py-2 rounded-2"
                onClick={() => onQuickSwitchRole('sales@acxiom.com', 'Sales@1234')}
              >
                <span style={{ fontWeight: 600 }}>🚀 Sales Exec (Rohan Verma)</span>
                {user?.role === 'SALES_EXECUTIVE' && <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Active</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Notifications Icon */}
        <button
          className="btn btn-light d-flex align-items-center justify-content-center position-relative"
          style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #fed7aa', background: '#fffbeb' }}
          title="Notifications"
          onClick={() => onNavigate && onNavigate('followups')}
        >
          <Bell size={17} style={{ color: '#ea580c' }} />
          <span
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ width: 8, height: 8 }}
          ></span>
        </button>
      </div>
    </header>
  );
}
