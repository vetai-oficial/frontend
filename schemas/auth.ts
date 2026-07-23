import * as yup from 'yup';

import { isPasswordStrong } from '@/app/components/common/password-strength';
import { validateEmail } from '@/utils/validations';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email é obrigatório')
    .test('valid-email', 'Email inválido', (value) =>
      validateEmail(value ?? ''),
    ),
  password: yup.string().required('Senha é obrigatória'),
});

export const registerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .test('valid-email', 'Email inválido', (value) =>
      validateEmail(value ?? ''),
    ),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .test(
      'strong-password',
      'A senha não atende todos os requisitos.',
      (value) => isPasswordStrong(value ?? ''),
    ),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'Senhas não conferem'),
  planId: yup.string().optional(),
  hospitalName: yup.string().optional(),
  cnpj: yup.string().optional(),
  address: yup.object({
    zipCode: yup.string().optional(),
    street: yup.string().optional(),
    number: yup.string().optional(),
    complement: yup.string().optional(),
    neighborhood: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
  }),
  responsible: yup.object({
    name: yup.string().optional(),
    crmv: yup.string().optional(),
  }),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Email é obrigatório')
    .test('valid-email', 'Email inválido', (value) =>
      validateEmail(value ?? ''),
    ),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
