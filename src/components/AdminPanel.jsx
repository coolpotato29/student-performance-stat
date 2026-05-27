import { useState } from 'react';
import { Lock, Upload, Trash2, X, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import CSVUploader from './CSVUploader';
import './AdminPanel.css';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPanel({ onDataLoaded, onClear, hasData, fileName }) {
  const [open, setOpen]         = useState(false);   // modal open
  const [authed, setAuthed]     = useState(false);   // logged in
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [uploaded, setUploaded] = useState(false);

  function openModal() { setOpen(true); setError(''); setPassword(''); setUploaded(false); }
  function closeModal() { setOpen(false); setAuthed(false); setPassword(''); setError(''); }

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  }

  function handleDataLoaded(rows, fields, name) {
    onDataLoaded(rows, fields, name);
    setUploaded(true);
  }

  function handleClear() {
    onClear();
    setUploaded(false);
  }

  return (
    <>
      {/* ── Trigger: small lock icon in footer ── */}
      <button className="admin-trigger" onClick={openModal} title="Admin Login" aria-label="Admin Login">
        <Lock size={13} />
        Admin
      </button>

      {/* ── Modal ── */}
      {open && (
        <div className="admin-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal">
            {/* Header */}
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <ShieldCheck size={18} />
                {authed ? 'Admin Panel' : 'Admin Login'}
              </div>
              <button className="admin-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>

            {/* Body */}
            <div className="admin-modal-body">
              {!authed ? (
                /* ── Login form ── */
                <form onSubmit={handleLogin} className="admin-login-form">
                  <p className="admin-login-hint">Enter the admin password to manage dashboard data.</p>
                  <div className="admin-pw-wrap">
                    <input
                      id="admin-password"
                      type={showPw ? 'text' : 'password'}
                      className="admin-pw-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="admin-pw-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {error && <p className="admin-error">{error}</p>}
                  <button type="submit" className="btn btn-primary admin-login-btn">
                    <Lock size={14} /> Unlock
                  </button>
                </form>
              ) : (
                /* ── Admin panel ── */
                <div className="admin-panel-body">
                  {/* Current data status */}
                  <div className="admin-status-card">
                    <div className="admin-status-label">Current Data</div>
                    {hasData ? (
                      <div className="admin-status-value admin-status-value--loaded">
                        <CheckCircle size={14} /> {fileName}
                      </div>
                    ) : (
                      <div className="admin-status-value admin-status-value--empty">
                        No data loaded
                      </div>
                    )}
                  </div>

                  {/* Upload success banner */}
                  {uploaded && (
                    <div className="admin-success-banner">
                      <CheckCircle size={15} /> Data uploaded and saved successfully.
                    </div>
                  )}

                  {/* Uploader */}
                  <div className="admin-uploader-wrap">
                    <p className="admin-section-label">
                      <Upload size={13} /> Upload CSV
                    </p>
                    <CSVUploader onDataLoaded={handleDataLoaded} compact />
                  </div>

                  {/* Clear button */}
                  {hasData && (
                    <button className="admin-clear-btn" onClick={handleClear}>
                      <Trash2 size={14} /> Clear Data
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
