import * as yup from 'yup';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const hospitalizeSchema = yup.object({
  patient_id: yup.string().required('Paciente é obrigatório'),
  status: yup
    .mixed<'TRIAGE' | 'HOSPITALIZED'>()
    .oneOf(['TRIAGE', 'HOSPITALIZED'], 'Situação inválida')
    .required('Situação é obrigatória'),
  risk: yup
    .mixed<'LOW' | 'MEDIUM' | 'HIGH'>()
    .oneOf(['LOW', 'MEDIUM', 'HIGH'], 'Risco inválido')
    .required('Risco é obrigatório'),
  veterinarian_id: yup.string().required('Veterinário é obrigatório'),
  box_id: yup.string().optional(),
  expected_discharge_date: yup
    .string()
    .optional()
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return true;
      return dateRegex.test(value);
    }),
  complaint: yup.string().optional(),
  diagnosis: yup.string().optional(),
  prognosis: yup.string().optional(),
  accessories: yup.string().optional(),
  observations: yup.string().optional(),
});

export type HospitalizeFormData = yup.InferType<typeof hospitalizeSchema>;

export const prescriptionFormSchema = yup.object({
  type: yup
    .mixed<'MEDICATION' | 'PROCEDURE' | 'FLUID'>()
    .oneOf(['MEDICATION', 'PROCEDURE', 'FLUID'], 'Tipo inválido')
    .required('Tipo é obrigatório'),
  name: yup.string().trim().required('Nome é obrigatório'),
  dose_value: yup
    .string()
    .optional()
    .test('positive', 'Dose inválida', (value) => {
      if (!value) return true;
      return Number(value.replace(',', '.')) > 0;
    }),
  dose_unit: yup.string().optional(),
  frequency: yup
    .mixed<'RECURRING' | 'ONCE' | 'AS_NEEDED'>()
    .oneOf(['RECURRING', 'ONCE', 'AS_NEEDED'], 'Frequência inválida')
    .required('Frequência é obrigatória'),
  interval_hours: yup.string().when('frequency', {
    is: 'RECURRING',
    then: (schema) =>
      schema
        .required('Intervalo é obrigatório')
        .test('positive', 'Intervalo inválido', (value) => Number(value) > 0),
    otherwise: (schema) => schema.optional(),
  }),
  duration_days: yup.string().when('frequency', {
    is: 'RECURRING',
    then: (schema) =>
      schema
        .required('Duração é obrigatória')
        .test('positive', 'Duração inválida', (value) => Number(value) > 0),
    otherwise: (schema) => schema.optional(),
  }),
  start_date: yup.string().when('frequency', {
    is: (value: string) => value !== 'AS_NEEDED',
    then: (schema) =>
      schema
        .required('Data de início é obrigatória')
        .matches(dateRegex, 'Data inválida'),
    otherwise: (schema) => schema.optional(),
  }),
  start_time: yup.string().when('frequency', {
    is: (value: string) => value !== 'AS_NEEDED',
    then: (schema) =>
      schema
        .required('Hora de início é obrigatória')
        .matches(timeRegex, 'Hora inválida'),
    otherwise: (schema) => schema.optional(),
  }),
  notes: yup.string().optional(),
});

export type PrescriptionFormData = yup.InferType<typeof prescriptionFormSchema>;

export const executeSchema = yup.object({
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(dateRegex, 'Data inválida'),
  time: yup
    .string()
    .required('Hora é obrigatória')
    .matches(timeRegex, 'Hora inválida'),
  notes: yup.string().optional(),
});

export type ExecuteFormData = yup.InferType<typeof executeSchema>;

export const occurrenceSchema = yup.object({
  title: yup.string().trim().required('Resumo é obrigatório'),
  description: yup.string().optional(),
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(dateRegex, 'Data inválida'),
  time: yup
    .string()
    .required('Hora é obrigatória')
    .matches(timeRegex, 'Hora inválida'),
});

export type OccurrenceFormData = yup.InferType<typeof occurrenceSchema>;

export const monitoringWeightSchema = yup.object({
  value: yup
    .string()
    .required('Peso é obrigatório')
    .test('positive', 'Peso inválido', (value) => {
      if (!value) return false;
      return Number(value.replace(',', '.')) > 0;
    }),
  unit: yup
    .mixed<'KG' | 'G'>()
    .oneOf(['KG', 'G'], 'Unidade inválida')
    .required('Unidade é obrigatória'),
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(dateRegex, 'Data inválida'),
  time: yup
    .string()
    .required('Hora é obrigatória')
    .matches(timeRegex, 'Hora inválida'),
  notes: yup.string().optional(),
});

export type MonitoringWeightFormData = yup.InferType<
  typeof monitoringWeightSchema
>;

export const dischargeSchema = yup.object({
  date: yup
    .string()
    .required('Data é obrigatória')
    .matches(dateRegex, 'Data inválida'),
  time: yup
    .string()
    .required('Hora é obrigatória')
    .matches(timeRegex, 'Hora inválida'),
  notes: yup.string().optional(),
});

export type DischargeFormData = yup.InferType<typeof dischargeSchema>;

export const boxSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  description: yup.string().optional(),
});

export type BoxFormData = yup.InferType<typeof boxSchema>;

export const clinicalParameterSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  unit: yup.string().optional(),
});

export type ClinicalParameterFormData = yup.InferType<
  typeof clinicalParameterSchema
>;

export const templateInfoSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  description: yup.string().optional(),
});

export type TemplateInfoFormData = yup.InferType<typeof templateInfoSchema>;
