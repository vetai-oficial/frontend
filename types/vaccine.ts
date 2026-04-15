export interface Vaccine {
  id: string;
  name: string;
  code: string;
  revaccination_period_days?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVaccinePayload {
  name: string;
  revaccination_period_days?: number;
}

export interface UpdateVaccinePayload {
  name?: string;
  revaccination_period_days?: number;
}
