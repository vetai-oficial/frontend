import type { Sex, Specie } from '@/types/patient';

export const SPECIE_LABELS: Record<Specie, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
  BIRD: 'Ave',
  REPTILE: 'Réptil',
  HORSE: 'Cavalo',
  OTHER: 'Outro',
};

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};
