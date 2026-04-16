import { httpClient } from '@/infra/http-client';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardData {
  total_patients: number;
  total_studies: number;
  total_consultations: number;
  total_consultations_today: number;
  patients_by_specie: ChartData;
  studies_status: ChartData;
  consultations_status: ChartData;
  growth_overtime: ChartData;
  latest_patients: Patient[];
  latest_studies: Study[];
}

/**
 * Maps the snake_case properties from the backend API (background_color, border_color) 
 * to camelCase (backgroundColor, borderColor) required by Chart.js.
 */
function mapChartData(data: any): ChartData {
  if (!data || !data.datasets) return data;

  return {
    ...data,
    datasets: data.datasets.map((ds: any) => ({
      ...ds,
      backgroundColor: ds.background_color,
      borderColor: ds.border_color,
      // Remove snake_case keys if needed, but not strictly necessary for Chart.js
    })),
  };
}

export const analyticsService = {
  getDashboard: async (params?: { start_date?: string; end_date?: string }): Promise<DashboardData> => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    
    const data = await httpClient<any>(`analytics/reports/dashboard${query}`);
    
    return {
      total_patients: data.total_patients,
      total_studies: data.total_studies,
      total_consultations: data.total_consultations,
      total_consultations_today: data.total_consultations_today,
      patients_by_specie: mapChartData(data.patients_by_specie),
      studies_status: mapChartData(data.studies_status),
      consultations_status: mapChartData(data.consultations_status),
      growth_overtime: mapChartData(data.growth_overtime),
      latest_patients: data.latest_patients,
      latest_studies: data.latest_studies.map((s: any) => ({
        ...s,
        patient: s.patientId, // Map populated patientId to patient for frontend compatibility
      })),
    };
  },
};
