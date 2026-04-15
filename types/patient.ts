export type Specie = 'DOG' | 'CAT' | 'BIRD' | 'REPTILE' | 'HORSE' | 'OTHER';
export type Sex = 'MALE' | 'FEMALE';

export interface Patient {
  id: string;
  name: string;
  specie: Specie;
  breed?: string;
  birth_date?: string;
  sex?: Sex;
  castration_date?: string;
  death_date?: string;
  microchip?: string;
  tutor_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPayload {
  name: string;
  specie: Specie;
  breed?: string;
  birth_date?: string;
  sex?: Sex;
  castration_date?: string;
  death_date?: string;
  microchip?: string;
  tutor_id: string;
}

export interface UpdatePatientPayload {
  name?: string;
  specie?: Specie;
  breed?: string;
  birth_date?: string;
  sex?: Sex;
  castration_date?: string;
  death_date?: string;
  microchip?: string;
  tutor_id?: string;
}
