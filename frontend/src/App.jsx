import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CrossModuleNav } from './components/CrossModuleNav';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Leads } from './pages/Leads';
import { Opportunities } from './pages/Opportunities';
import { FollowUps } from './pages/FollowUps';
import { Activities } from './pages/Activities';
import { Reports } from './pages/Reports';
import { UsersAdmin } from './pages/UsersAdmin';
import { AuditLogs } from './pages/AuditLogs';

export function App() {
  const { user, loading, login, isAdmin, isManager } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [navParam, setNavParam] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fffbeb',
          color: '#9a3412',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div className="spinner-border text-warning mb-3" role="status"></div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Loading AcxiomCRM Workspace...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    setNavParam(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSwitchRole = async (email, password) => {
    try {
      await login(email, password);
      showToast(`Switched persona to ${email}!`, 'success');
    } catch (err) {
      showToast('Could not switch persona', 'danger');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Sales Performance Dashboard';
      case 'customers': return 'Customer Directory & Accounts';
      case 'leads': return 'Lead Capture & Qualification';
      case 'opportunities': return 'Sales Pipeline & Forecasting';
      case 'followups': return 'Follow-Up Reminders & Schedules';
      case 'activities': return 'Customer Touchpoint Log';
      case 'reports': return 'Analytics & Reporting Hub';
      case 'users': return 'User & Role Administration';
      case 'audit': return 'Compliance & Audit Log Trail';
      default: return 'AcxiomCRM';
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigate} />

      {/* Main View Area */}
      <div className="app-main">
        <Header
          title={getPageTitle()}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onQuickSwitchRole={handleQuickSwitchRole}
          onNavigate={handleNavigate}
        />

        <main className="app-content">
          {/* Quick Cross-Module Hub Ribbon: Links Every Page to Every Page */}
          <CrossModuleNav activeTab={activeTab} onNavigate={handleNavigate} />

          {activeTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'customers' && <Customers onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'leads' && <Leads onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'opportunities' && <Opportunities onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'followups' && <FollowUps onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'activities' && <Activities onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'reports' && <Reports onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'users' && isAdmin && <UsersAdmin onNavigate={handleNavigate} navParam={navParam} />}
          {activeTab === 'audit' && (isAdmin || isManager) && <AuditLogs onNavigate={handleNavigate} navParam={navParam} />}
        </main>
      </div>
    </div>
  );
}
