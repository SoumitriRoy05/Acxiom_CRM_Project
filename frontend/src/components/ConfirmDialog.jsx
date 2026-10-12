import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirm', onConfirm, onCancel, isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom" style={{ maxWidth: 440 }}>
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isDanger ? '#fee2e2' : '#e0e7ff',
                color: isDanger ? '#dc2626' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h5 style={{ margin: 0, fontSize: 16 }}>{title}</h5>
          </div>
        </div>
        <div className="modal-body-custom">
          <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer-custom">
          <button
            type="button"
            className="btn btn-sm btn-light border"
            onClick={onCancel}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
