// hooks/useApi.js
import { useAuth } from '../context';
import ApiService from '../services/ApiService';
import { useMemo } from 'react';

export function useApi() {
  const { setUser, getUserToken } = useAuth();
  
  // Usar useMemo para evitar crear una nueva instancia en cada render
  const apiService = useMemo(() => {
    return new ApiService(setUser, getUserToken);
  }, [setUser, getUserToken]);
  
  return apiService;
}