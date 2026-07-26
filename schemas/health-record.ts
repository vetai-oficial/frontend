import * as yup from 'yup';

export const healthRecordSchema = yup.object({
  patientId: yup.string().required('Paciente é obrigatório'),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .required('Data é obrigatória')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  type: yup.string().required('Tipo é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
  notes: yup.string().optional(),
});

export type HealthRecordFormData = yup.InferType<typeof healthRecordSchema>;

export const weightRecordSchema = yup.object({
  value: yup
    .string()
    .required('Peso é obrigatório')
    .test('positive-number', 'Peso inválido', (value) => {
      if (!value) return false;
      return Number(value) > 0;
    }),
  unit: yup
    .mixed<'KG' | 'G'>()
    .oneOf(['KG', 'G'], 'Unidade inválida')
    .required('Unidade é obrigatória'),
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  notes: yup.string().optional(),
});

export const clinicalNoteSchema = yup.object({
  title: yup.string().trim().required('Título é obrigatório'),
  description: yup.string().trim().required('Descrição é obrigatória'),
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
});

export const patientNoteSchema = yup.object({
  text: yup.string().trim().required('Nota é obrigatória'),
});

export const prescriptionSchema = yup.object({
  date: yup
    .string()
    .required('Data da receita é obrigatória')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  includeDate: yup.boolean().required(),
  medications: yup
    .array(
      yup.object({
        drug: yup.string().trim().required('Medicamento é obrigatório'),
        form: yup.string().optional(),
        quantity: yup.string().optional(),
        usage: yup.string().optional(),
        posology: yup.string().trim().required('Posologia é obrigatória'),
      }),
    )
    .required('Adicione ao menos um medicamento com nome e posologia.')
    .min(1, 'Adicione ao menos um medicamento com nome e posologia.'),
});

export type WeightRecordFormData = yup.InferType<typeof weightRecordSchema>;
export type ClinicalNoteFormData = yup.InferType<typeof clinicalNoteSchema>;
export type PatientNoteFormData = yup.InferType<typeof patientNoteSchema>;
export type PrescriptionFormData = yup.InferType<typeof prescriptionSchema>;
