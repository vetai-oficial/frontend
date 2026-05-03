'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Activity, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/schemas/auth';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    setEmail(data.email);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className='min-h-screen flex'>
      <div className='hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-700 to-slate-900 relative overflow-hidden'>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tOCA4di0ySDI0djJoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className='relative z-10 flex flex-col justify-center px-16'>
          <Link href='/' className='flex items-center gap-3 mb-12'>
            <Activity className='text-teal-400' size={36} />
            <span className='text-3xl font-bold text-white tracking-tight'>
              VetAI
            </span>
          </Link>
          <h2 className='text-4xl font-bold text-white leading-tight mb-4'>
            Recupere seu acesso
          </h2>
          <p className='text-slate-300 text-lg leading-relaxed max-w-md'>
            Não se preocupe, enviaremos instruções para redefinir sua senha por
            email.
          </p>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950'>
        <div className='w-full max-w-md'>
          <div className='lg:hidden flex items-center gap-2 mb-8'>
            <Activity className='text-teal-600' size={28} />
            <span className='font-bold text-xl text-slate-900 dark:text-white'>
              VetAI
            </span>
          </div>

          {sent ? (
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 mb-6'>
                <Mail size={28} className='text-teal-600 dark:text-teal-400' />
              </div>
              <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                Email enviado!
              </h1>
              <p className='text-slate-500 dark:text-slate-400 mb-8'>
                Enviamos um link de redefinição de senha para{' '}
                <strong className='text-slate-700 dark:text-slate-300'>
                  {email}
                </strong>
                . Verifique sua caixa de entrada.
              </p>
              <Link href='/login'>
                <Button variant='outline' className='gap-2'>
                  <ArrowLeft size={16} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href='/login'
                className='inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 mb-8 transition-colors'
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>

              <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                Esqueceu sua senha?
              </h1>
              <p className='text-slate-500 dark:text-slate-400 mb-8'>
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <div className='space-y-2'>
                  <InputWithLabel
                    label='Email'
                    type='email'
                    placeholder='seu@email.com'
                    {...register('email')}
                    autoComplete='email'
                    className='h-11'
                    error={errors.email?.message}
                  />
                </div>

                <Button
                  type='submit'
                  loading={loading}
                  className='w-full h-11 bg-teal-600 hover:bg-teal-700 text-white'
                >
                  Enviando...
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
