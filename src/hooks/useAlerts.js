import { useContext } from 'react';
import { AlertContext } from '../context/AlertContext.jsx';

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used inside <AlertProvider>');
  return ctx;
};