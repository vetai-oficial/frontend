import * as yup from 'yup';

import { validateCPF, validatePhone } from '@/utils/validations';

export const tutorSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('cpf-valid', 'CPF inválido', (value) => {
      if (!value) return false;
      return validateCPF(value);
    }),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .test('phone-valid', 'Telefone inválido', (value) => {
      if (!value) return false;
      return validatePhone(value);
    }),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  address: yup.string().optional(),
});

export type TutorFormData = yup.InferType<typeof tutorSchema>;
