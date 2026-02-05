import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import './Toast.css';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txDigest?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  txDigest,
  duration = 5000,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      case 'info':
        return <AlertCircle size={24} />;
    }
  };

  const copyTxDigest = () => {
    if (txDigest) {
      navigator.clipboard.writeText(txDigest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
        {txDigest && (
          <div className="toast-actions">
            <button
              className="toast-action-btn"
              onClick={copyTxDigest}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy TX'}
            </button>
            <a
              href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toast-action-btn"
            >
              <ExternalLink size={14} />
              View Explorer
            </a>
          </div>
        )}
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

// Toast Manager
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txDigest?: string;
  duration?: number;
}

class ToastManager {
  private static toasts: ToastData[] = [];
  private static listeners: ((toasts: ToastData[]) => void)[] = [];

  static show(toast: Omit<ToastData, 'id'>) {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    
    // Auto-remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => this.remove(id), toast.duration || 5000);
    }
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  static subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    listener(this.toasts);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    return ToastManager.subscribe(setToasts);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => ToastManager.remove(toast.id)}
        />
      ))}
    </div>
  );
};

export const showToast = (toast: Omit<ToastData, 'id'>) => {
  ToastManager.show(toast);
};
