import * as yup from 'yup';

/**
 * CPF Validation - Full algorithm with checksum
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove non-digit characters
  const digits = cpf.replace(/\D/g, '');

  // Must have exactly 11 digits
  if (digits.length !== 11) return false;

  // All digits equal is invalid
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Convert to array for safer access
  const digitArray = digits.split('');

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const d = digitArray[i];
    sum += (d ? parseInt(d, 10) : 0) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  const [d9] = digitArray.slice(9);
  if (digit1 !== (d9 ? parseInt(d9, 10) : 0)) return false;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const d = digitArray[i];
    sum += (d ? parseInt(d, 10) : 0) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  const [d10] = digitArray.slice(10);
  return digit2 === (d10 ? parseInt(d10, 10) : 0);
};

/**
 * Format CPF to Brazilian format (XXX.XXX.XXX-XX)
 */
export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

/**
 * Phone Validation - Brazilian format
 * Accepts: (11) 99999-9999 or (11) 9999-9999
 */
export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');

  // Must have 10 or 11 digits
  if (digits.length !== 10 && digits.length !== 11) return false;

  // Area code must start with 2-9
  const firstDigit = digits.charAt(0);
  if (parseInt(firstDigit || '0', 10) < 2) return false;

  return true;
};

/**
 * Format phone to Brazilian format ((XX) XXXXX-XXXX)
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // For 11 digits (mobile)
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Email validation function
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Enhanced email validation schema
 */
export const emailSchema = yup
  .string()
  .email('Email inválido')
  .required('Email é obrigatório');

/**
 * CPF schema with full validation
 */
export const cpfSchema = yup
  .string()
  .test('cpf-valid', 'CPF inválido', (value) => {
    if (!value) return false;
    return validateCPF(value);
  })
  .required('CPF é obrigatório');

/**
 * Phone schema with Brazilian validation
 */
export const phoneSchema = yup
  .string()
  .test('phone-valid', 'Telefone inválido', (value) => {
    if (!value) return false;
    return validatePhone(value);
  })
  .required('Telefone é obrigatório');

/**
 * Date validation schema (YYYY-MM-DD format)
 */
export const dateSchema = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .test('valid-date', 'Data inválida', (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  });

/**
 * Password schema (basic validation, strength check is separate)
 */
export const passwordSchema = yup
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .required('Senha é obrigatória');
