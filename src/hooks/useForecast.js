import { useContext } from 'react';
import { ForecastContext } from '../context/ForecastContext.jsx';

export const useForecast = () => {
  const ctx = useContext(ForecastContext);
  if (!ctx) throw new Error('useForecast must be used inside <ForecastProvider>');
  return ctx;
};