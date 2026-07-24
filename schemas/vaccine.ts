import * as yup from 'yup';

export const vaccineCatalogSchema = yup.object({
  name: yup.string().required('Nome da vacina é obrigatório'),
  period: yup.number().optional(),
});

export type VaccineCatalogFormData = yup.InferType<typeof vaccineCatalogSchema>;

export const vaccineDoseSchema = yup.object({
  vaccineId: yup.string().required('Vacina é obrigatória'),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .required('Data de aplicação é obrigatória')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  doseNumber: yup.string().required('Dose é obrigatória'),
  batch: yup.string().required('Lote é obrigatório'),
  previousDoseDate: yup
    .string()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  appliedBy: yup.string().required('Aplicado por é obrigatório'),
  notes: yup.string().optional(),
});

export const uploadExamSchema = yup.object({
  patientId: yup.string().required('Paciente é obrigatório'),
  title: yup.string().trim().required('Título do exame é obrigatório'),
  examDate: yup
    .string()
    .required('Data do exame é obrigatória')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  file: yup
    .mixed<File>()
    .required('Arquivo PDF é obrigatório')
    .test('pdf-only', 'Apenas arquivos PDF são aceitos.', (value) => {
      if (!(value instanceof File)) return false;
      return value.type === 'application/pdf';
    }),
});

export type VaccineDoseFormData = yup.InferType<typeof vaccineDoseSchema>;
export type UploadExamFormData = yup.InferType<typeof uploadExamSchema>;
