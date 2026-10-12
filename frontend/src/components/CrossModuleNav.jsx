import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  CalendarCheck,
  Activity,
  FileBarChart,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CrossModuleNav({ activeTab, onNavigate }) {
  const { isAdmin, isManager } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: '5' },
    { id: 'leads', label: 'Leads', icon: Target, badge: '5' },
    { id: 'opportunities', label: 'Pipeline Deals', icon: TrendingUp, badge: '₹3.1 Cr' },
    { id: 'followups', label: 'Follow-Ups', icon: CalendarCheck, badge: '4' },
    { id: 'activities', label: 'Activities', icon: Activity, badge: '7' },
    { id: 'reports', label: 'Reports & CSV', icon: FileBarChart },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: UserCheck }] : []),
    ...(isAdmin || isManager ? [{ id: 'audit', label: 'Audit Trail', icon: ShieldCheck }] : []),
  ];

  return (
    <div
      className="d-flex align-items-center gap-2 mb-4 p-2 rounded-3 shadow-sm flex-wrap"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #fed7aa',
        background: 'linear-gradient(90deg, #fffbeb 0%, #ffffff 100%)',
      }}
    >
      <div className="d-flex align-items-center gap-1 px-2 py-1 text-uppercase" style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', letterSpacing: '0.05em' }}>
        <span>🔗 Quick Jump:</span>
      </div>

      <div className="d-flex align-items-center gap-1 flex-wrap flex-grow-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="btn btn-sm d-flex align-items-center gap-1 px-3 py-1"
              style={{
                borderRadius: 20,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? '#ea580c' : '#fef3c7',
                color: isActive ? '#ffffff' : '#9a3412',
                border: isActive ? '1px solid #c2410c' : '1px solid #fde68a',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className="badge ms-1"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#ea580c',
                    color: '#ffffff',
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 10,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
