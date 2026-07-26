import * as yup from 'yup';

import { formatCPF, formatPhone } from '@/utils/masks';

export { formatCPF, formatPhone };

export const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10]);
};

export const validateCNPJ = (cnpj: string): boolean => {
  const characters = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (characters.length !== 14 || /^(.)\1{13}$/.test(characters)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    let weight = length - 7;
    for (let index = 0; index < length; index++) {
      const character = characters[index];
      if (!character) return -1;
      const value = /\d/.test(character)
        ? Number(character)
        : character.charCodeAt(0) - 48;
      sum += value * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    calculateDigit(12) === Number(characters[12]) &&
    calculateDigit(13) === Number(characters[13])
  );
};

export const validateCEP = (cep: string): boolean => /^\d{8}$/.test(cep.replace(/\D/g, ''));

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return (digits.length === 10 || digits.length === 11) && Number(digits[0]) >= 2;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const emailSchema = yup
  .string()
  .email('Email inválido')
  .required('Email é obrigatório');

export const cpfSchema = yup
  .string()
  .test('cpf-valid', 'CPF inválido', (value) => Boolean(value && validateCPF(value)))
  .required('CPF é obrigatório');

export const phoneSchema = yup
  .string()
  .test('phone-valid', 'Telefone inválido', (value) => Boolean(value && validatePhone(value)))
  .required('Telefone é obrigatório');

export const dateSchema = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .test('valid-date', 'Data inválida', (value) => Boolean(value && !isNaN(new Date(value).getTime())));

export const passwordSchema = yup
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .required('Senha é obrigatória');
