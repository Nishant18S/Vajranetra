import { useContext } from 'react';
import { SystemContext } from '../context/SystemContext.jsx';
export const useSystemStatus = () => useContext(SystemContext);