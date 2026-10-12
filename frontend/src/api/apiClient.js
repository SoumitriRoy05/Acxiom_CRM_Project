// API Client for AcxiomCRM REST API

const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('acxiom_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('acxiom_token');
    localStorage.removeItem('acxiom_user');
    window.dispatchEvent(new Event('auth-logout'));
  }

  // Handle file/blob downloads
  if (options.responseType === 'blob') {
    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Export failed');
    }
    return response.blob();
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),

  // Dashboard
  getDashboardStats: (dateFilter = 'all') => apiRequest(`/dashboard/stats?dateFilter=${dateFilter}`),
  resetDemoData: () => apiRequest('/dashboard/reset-demo-data', { method: 'POST' }),

  // Customers
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/customers${q ? `?${q}` : ''}`);
  },
  getCustomer: (id) => apiRequest(`/customers/${id}`),
  createCustomer: (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/leads${q ? `?${q}` : ''}`);
  },
  getLead: (id) => apiRequest(`/leads/${id}`),
  createLead: (data) => apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => apiRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  convertLead: (id, data) => apiRequest(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),

  // Opportunities
  getOpportunities: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/opportunities${q ? `?${q}` : ''}`);
  },
  getOpportunity: (id) => apiRequest(`/opportunities/${id}`),
  createOpportunity: (data) => apiRequest('/opportunities', { method: 'POST', body: JSON.stringify(data) }),
  updateOpportunity: (id, data) => apiRequest(`/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOpportunity: (id) => apiRequest(`/opportunities/${id}`, { method: 'DELETE' }),

  // Follow-ups
  getFollowUps: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/followups${q ? `?${q}` : ''}`);
  },
  getFollowUp: (id) => apiRequest(`/followups/${id}`),
  createFollowUp: (data) => apiRequest('/followups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowUp: (id, data) => apiRequest(`/followups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFollowUp: (id) => apiRequest(`/followups/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/activities${q ? `?${q}` : ''}`);
  },
  createActivity: (data) => apiRequest('/activities', { method: 'POST', body: JSON.stringify(data) }),
  deleteActivity: (id) => apiRequest(`/activities/${id}`, { method: 'DELETE' }),

  // Users (Admin)
  getUsers: (search = '') => apiRequest(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUser: (id) => apiRequest(`/users/${id}`),
  createUser: (data) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  unlockUser: (id) => apiRequest(`/users/${id}/unlock`, { method: 'POST' }),
  resetPassword: (id, newPassword) => apiRequest(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/audit-logs${q ? `?${q}` : ''}`);
  },

  // Reports
  getPipelineReport: () => apiRequest('/reports/pipeline'),
  getConversionReport: () => apiRequest('/reports/conversion'),
  getUserActivityReport: () => apiRequest('/reports/user-activity'),
  exportReport: async (type) => {
    const blob = await apiRequest(`/reports/export?type=${type}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acxiom_crm_${type}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
