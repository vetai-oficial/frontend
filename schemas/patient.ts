import * as yup from 'yup';

export const patientSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  specie: yup.string().required('Espécie é obrigatória'),
  breed: yup.string().nullable().optional(),
  birthDate: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  sex: yup.string().nullable().optional(),
  castrationDate: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  deathDate: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  microchip: yup.string().nullable().optional(),
  tutorId: yup.string().required('Tutor é obrigatório'),
});

export interface PatientFormData {
  name: string;
  specie: string;
  breed: string;
  birthDate: string;
  sex: string;
  castrationDate: string;
  deathDate: string;
  microchip: string;
  tutorId: string;
}
