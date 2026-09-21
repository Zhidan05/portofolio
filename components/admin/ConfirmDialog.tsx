"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  description?: string;
  metadata?: Record<string, string>;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title = "[ SYSTEM WARNING // CONFIRM ACTION ]",
  message = "> CONFIRM_ACTION",
  itemName,
  description,
  metadata,
  cancelLabel = "CANCEL",
  confirmLabel = "CONFIRM",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!loading) {
        onCancel();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel, loading]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (loading) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    
    if (!isInDialog) {
      onCancel();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="confirm-dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="confirm-dialog-content panel" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header code" id="confirm-dialog-title">
          <span className={destructive ? "text-danger" : "cyan"}>{title}</span>
        </div>
        
        <div className="confirm-body">
          <p className="code cyan">{message}</p>
          
          {itemName && (
            <div className="confirm-item">
              <span className="muted micro">TARGET:</span>
              <h3 style={{ margin: "0.25rem 0 0.75rem 0", color: "#fff" }}>{itemName}</h3>
            </div>
          )}
          
          {description && (
            <p className="muted" style={{ fontSize: "14px", marginBottom: "1rem" }}>
              {description}
            </p>
          )}

          {metadata && Object.keys(metadata).length > 0 && (
            <div className="confirm-meta code muted">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key}>
                  {key}: <span className={destructive ? "text-danger" : "cyan"}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="code text-danger" role="alert" style={{ marginTop: "1rem" }}>
              {`> OPERATION_FAILED: ${error}`}
            </p>
          )}
        </div>

        <div className="editor-actions" style={{ marginTop: "1.5rem", justifyContent: "flex-end" }}>
          <button 
            type="button"
            className="admin-action-btn"
            onClick={onCancel}
            disabled={loading}
          >
            [ {cancelLabel} ]
          </button>
          <button 
            type="button"
            className={`admin-action-btn ${destructive ? "danger" : "primary"}`}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? `> ${destructive ? 'DELETING' : 'PROCESSING'}...` : `[ ${confirmLabel} ]`}
          </button>
        </div>
      </div>
    </dialog>
  );
}
