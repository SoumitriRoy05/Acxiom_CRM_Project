import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, ShieldCheck, UserCheck, Briefcase, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export function Login() {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('SALES_EXECUTIVE');

  // Client-side validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least 1 letter and 1 number';
    }

    if (isRegister) {
      if (!name.trim()) errors.name = 'Full name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
        showToast('Account created successfully! Welcome to AcxiomCRM.', 'success');
      } else {
        await login(email, password);
        showToast('Welcome back! Successfully signed in.', 'success');
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Authentication failed';
      setError(msg);
      showToast(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Quick Persona Auto-filler
  const handleQuickLogin = async (demoEmail, demoPassword, label) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      showToast(`Signed in as ${label}`, 'success');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Login failed';
      setError(msg);
      showToast(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, #fffbeb 0%, #fff7ed 50%, #fef3c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 1000, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', background: '#ffffff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.18), 0 0 0 1px #fed7aa' }}>
        
        {/* Left Side: Brand & Quick Demo Switcher */}
        <div style={{ background: 'linear-gradient(145deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)', color: '#ffffff', padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          
          {/* Subtle warm glow circle */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}>
                <Zap size={26} fill="#ea580c" />
              </div>
              <div>
                <h2 style={{ fontSize: 26, margin: 0, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
                  Acxiom<span style={{ color: '#fef08a' }}>CRM</span>
                </h2>
                <div style={{ fontSize: 13, color: '#fed7aa', fontWeight: 500 }}>Enterprise Sales Acceleration</div>
              </div>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#ffedd5', marginBottom: 28 }}>
              Accelerate deal cycles, automate qualified lead transitions, track customer relationships, and monitor weighted sales pipeline forecasts.
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 22 }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Sparkles size={16} color="#fef08a" />
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#fef08a' }}>
                  Instant Persona Sign-In
                </span>
              </div>

              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@acxiom.com', 'Admin@1234', 'Admin (Aarav Sharma)')}
                  disabled={loading}
                  style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(254, 240, 138, 0.3)', color: '#ffffff', padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <ShieldCheck size={20} color="#fef08a" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#ffffff' }}>👑 Aarav Sharma (Admin)</div>
                      <div style={{ fontSize: 11, color: '#fed7aa' }}>Full Access • User Administration • Audit Trail</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#fef08a" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager@acxiom.com', 'Manager@1234', 'Manager (Pooja Verma)')}
                  disabled={loading}
                  style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(254, 240, 138, 0.3)', color: '#ffffff', padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Briefcase size={20} color="#fde047" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#ffffff' }}>💼 Pooja Verma (Manager)</div>
                      <div style={{ fontSize: 11, color: '#fed7aa' }}>Team Visibility • Pipeline Analytics • Reports</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#fde047" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('sales@acxiom.com', 'Sales@1234', 'Sales Executive (Rohan Verma)')}
                  disabled={loading}
                  style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(254, 240, 138, 0.3)', color: '#ffffff', padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <UserCheck size={20} color="#86efac" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#ffffff' }}>🚀 Rohan Verma (Sales Exec)</div>
                      <div style={{ fontSize: 11, color: '#fed7aa' }}>Assigned Leads • Personal Deals & Follow-ups</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#86efac" />
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#ffedd5', marginTop: 24, opacity: 0.85, position: 'relative', zIndex: 1 }}>
            🛡️ BCrypt Secure Hashing • 5-Attempt Lockout Protection • Java 21 & Spring Boot
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
          <div className="mb-4">
            <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700, fontSize: 11, padding: '4px 8px', marginBottom: 8 }}>
              {isRegister ? 'NEW REGISTRATION' : 'SECURE CRM LOGIN'}
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 0', color: '#1c1917' }}>
              {isRegister ? 'Create Your Account' : 'Welcome to AcxiomCRM'}
            </h3>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0 0' }}>
              {isRegister ? 'Join your sales team with role-governed credentials' : 'Enter your email and password to access the portal'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3" style={{ fontSize: 13, borderRadius: 10, background: '#fee2e2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              <AlertCircle size={16} className="flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="mb-3">
                  <label className="form-label-custom">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#a8a29e' }} />
                    <input
                      type="text"
                      className="form-control-custom"
                      style={{ paddingLeft: 38 }}
                      placeholder="e.g. Rohan Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Role Assignment *</label>
                  <select
                    className="form-control-custom"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="SALES_EXECUTIVE">Sales Executive (Own records)</option>
                    <option value="MANAGER">Manager (Team records)</option>
                    <option value="ADMIN">Administrator (Full authority)</option>
                  </select>
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label-custom">Business Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#a8a29e' }} />
                <input
                  type="email"
                  className="form-control-custom"
                  style={{ paddingLeft: 38 }}
                  placeholder="name@acxiom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#a8a29e' }} />
                <input
                  type="password"
                  className="form-control-custom"
                  style={{ paddingLeft: 38 }}
                  placeholder="Min 8 characters (letters & digits)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
              <div style={{ fontSize: 11, color: '#78716c', marginTop: 4 }}>
                Password policy: Min 8 chars, at least 1 letter and 1 digit.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 mt-2"
              style={{ fontWeight: 700, borderRadius: 10, fontSize: 14 }}
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register & Sign In' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="text-center mt-4" style={{ fontSize: 13, color: '#78716c' }}>
            {isRegister ? (
              <span>Already registered? <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 700, cursor: 'pointer' }}>Sign in here</button></span>
            ) : (
              <span>New team member? <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 700, cursor: 'pointer' }}>Create new account</button></span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
