import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`toast ${toast.show ? 'show' : ''} ${
          toast.type === 'erro' ? 'toast-erro' : toast.type === 'sucesso' ? 'toast-sucesso' : ''
        }`}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
