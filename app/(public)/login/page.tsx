'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Activity, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthPanel } from '@/app/components/common/auth-panel';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { loginSchema, type LoginFormData } from '@/schemas/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);

    try {
      await login(data.email, data.password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex'>
      <AuthPanel
        title='Bem-vindo de volta'
        description='Acesse sua conta e continue cuidando dos seus pacientes com o poder da inteligncia artificial.'
        gradient='from-teal-600 via-teal-700 to-emerald-800'
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
            Entrar na sua conta
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mb-8'>
            Digite suas credenciais para acessar o painel.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
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
              <div className='flex items-end justify-between gap-4'>
                <div className='flex-1'>
                  <InputWithLabel
                    label='Senha'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Sua senha'
                    name='password'
                    control={control}
                    autoComplete='current-password'
                    className='h-11 pr-10'
                    error={errors.password?.message}
                    endAdornment={
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='text-slate-400 hover:text-slate-600'
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />
                </div>
                <Link
                  href='/forgot-password'
                  className='text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400'
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <Button
              type='submit'
              loading={loading}
              className='w-full h-11 bg-teal-600 hover:bg-teal-700 text-white'
            >
              Entrar
            </Button>
          </form>

          <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400'>
            Não tem uma conta?{' '}
            <Link
              href='/register'
              className='text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium'
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
