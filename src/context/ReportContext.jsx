import React, { createContext, useContext, useState } from 'react';

// Crear el contexto
const ReportContext = createContext();

// Provider simplificado
export const ReportProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);

  const createReport = async (reportData) => {
    setLoading(true);
    try {
      // Simular envío de reporte
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Agregar a myReports
      const newReport = {
        id: Date.now(),
        ...reportData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setMyReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    myReports,
    createReport
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

// Hook para usar el contexto
export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

export default ReportContext;
