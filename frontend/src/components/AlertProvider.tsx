import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Stack } from '@mui/material';

interface AlertItem {
  id: number;
  message: string;
  severity: AlertColor;
}

interface AlertContextValue {
  notify: (message: string, severity?: AlertColor) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

let nextId = 1;

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    const id = nextId++;
    setAlerts((prev) => [...prev, { id, message, severity }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Stack
        spacing={1}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: (t) => t.zIndex.snackbar }}
      >
        {alerts.map((alert) => (
          <Snackbar
            key={alert.id}
            open
            autoHideDuration={5000}
            onClose={() => dismiss(alert.id)}
            sx={{ position: 'static' }}
          >
            <Alert
              onClose={() => dismiss(alert.id)}
              severity={alert.severity}
              variant="filled"
              sx={{ borderRadius: 2, minWidth: 280 }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </AlertContext.Provider>
  );
}

export function useAlerts(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}
