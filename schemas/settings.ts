import * as yup from 'yup';

import { validateEmail } from '@/utils/validations';

export const inviteCollaboratorSchema = yup.object({
  email: yup
    .string()
    .defined()
    .required('Email é obrigatório')
    .test('valid-email', 'Email inválido', (value) => validateEmail(value ?? '')),
});

export type InviteCollaboratorFormData = yup.InferType<
  typeof inviteCollaboratorSchema
>;
