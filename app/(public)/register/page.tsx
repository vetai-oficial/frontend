'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Activity, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthPanel } from '@/app/components/common/auth-panel';
import { PasswordStrength } from '@/app/components/common/password-strength';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { registerSchema, type RegisterFormData } from '@/schemas/auth';

export default function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const password = watch('password', '');

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);

    try {
      const inviteToken = new URLSearchParams(window.location.search).get(
        'invite_token',
      );
      await register(data.name, data.email, data.password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex'>
      <AuthPanel
        title='Comece sua jornada'
        description='Crie sua conta gratuita e descubra como a inteligência artificial pode revolucionar sua prática veterinária.'
        gradient='from-emerald-600 via-teal-700 to-cyan-800'
      />

      <div className='flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950'>
        <div className='w-full max-w-md'>
          <div className='lg:hidden flex items-center gap-2 mb-8'>
            <Activity className='text-teal-600' size={28} />
            <span className='font-bold text-xl text-slate-900 dark:text-white'>
              VetAI
            </span>
          </div>

          <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
            Criar sua conta
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mb-8'>
            Preencha os dados abaixo para começar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <InputWithLabel
                label='Nome completo'
                type='text'
                placeholder='Dr(a). João Silva'
                name='name'
                control={control}
                autoComplete='name'
                className='h-11'
                error={errors.name?.message}
              />
            </div>

            <div className='space-y-2'>
              <InputWithLabel
                label='Email'
                type='email'
                placeholder='seu@email.com'
                name='email'
                control={control}
                autoComplete='email'
                className='h-11'
                error={errors.email?.message}
              />
            </div>

            <div className='space-y-2'>
              <InputWithLabel
                label='Senha'
                type={showPassword ? 'text' : 'password'}
                placeholder='Crie uma senha forte'
                name='password'
                control={control}
                autoComplete='new-password'
                className='h-11 pr-10'
                error={errors.password?.message}
                endAdornment={
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-slate-400 hover:text-slate-600'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <div className='space-y-2'>
              <InputWithLabel
                label='Confirmar senha'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirme sua senha'
                name='confirmPassword'
                control={control}
                autoComplete='new-password'
                className='h-11 pr-10'
                error={errors.confirmPassword?.message}
                endAdornment={
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='text-slate-400 hover:text-slate-600'
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />
            </div>

            <PasswordStrength password={password} />

            <Button
              type='submit'
              loading={loading}
              className='w-full h-11 bg-teal-600 hover:bg-teal-700 text-white'
            >
              Criar conta
            </Button>
          </form>

          <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400'>
            Já tem uma conta?{' '}
            <Link
              href='/login'
              className='text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium'
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
