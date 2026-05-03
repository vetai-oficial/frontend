import * as yup from 'yup';

export const examSchema = yup.object({
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
  result: yup.string().optional(),
  notes: yup.string().optional(),
});

export type ExamFormData = yup.InferType<typeof examSchema>;
