'use client';

import { Activity, Check, ChevronLeft, ChevronRight, Eye, EyeOff, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthPanel } from '@/app/components/common/auth-panel';
import { PasswordStrength } from '@/app/components/common/password-strength';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { billingService } from '@/services/billing.service';
import type { RegisterPayload } from '@/types/auth';
import type { Plan } from '@/types/billing';
import { formatCEP, formatCNPJ } from '@/utils/masks';
import { validateCEP, validateCNPJ } from '@/utils/validations';

interface RegisterPageFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  planId?: string;
  hospitalName?: string;
  cnpj?: string;
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  responsible?: {
    name?: string;
    crmv?: string;
  };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite_token');
  const isInvite = Boolean(inviteToken);
  const selectedPlanId = searchParams.get('plan_id');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(!isInvite);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterPageFormData>({
    defaultValues: selectedPlanId ? { planId: selectedPlanId } : {},
  });

  const password = watch('password', '');
  const planId = watch('planId');
  const selectedPlan = plans.find((plan) => plan.id === planId);

  useEffect(() => {
    if (isInvite) return;

    void billingService
      .listPlans()
      .then(setPlans)
      .finally(() => setPlansLoading(false));
  }, [isInvite]);

  function validateAccountAndClinic() {
    const data = getValues();
    let hasError = false;
    const requiredFields: Array<[keyof RegisterPageFormData, string]> = [
      ['name', 'Nome é obrigatório'],
      ['email', 'Email é obrigatório'],
      ['password', 'Senha é obrigatória'],
      ['confirmPassword', 'Confirmação de senha é obrigatória'],
    ];

    if (!isInvite) {
      requiredFields.push(
        ['hospitalName', 'Nome da clínica é obrigatório'],
        ['cnpj', 'CNPJ é obrigatório'],
      );
    }

    requiredFields.forEach(([field, message]) => {
      if (!data[field]) {
        setError(field, { message });
        hasError = true;
      }
    });

    if (data.password && data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Senhas não conferem' });
      hasError = true;
    }

    if (!isInvite) {
      if (data.cnpj && !validateCNPJ(data.cnpj)) {
        setError('cnpj', { message: 'CNPJ inválido' });
        hasError = true;
      }
      if (!data.address?.zipCode) {
        setError('address.zipCode', { message: 'CEP é obrigatório' });
        hasError = true;
      } else if (!validateCEP(data.address.zipCode)) {
        setError('address.zipCode', { message: 'CEP inválido' });
        hasError = true;
      }
      if (!data.responsible?.name) {
        setError('responsible.name', { message: 'Responsável é obrigatório' });
        hasError = true;
      }
      if (!data.responsible?.crmv) {
        setError('responsible.crmv', { message: 'CRMV é obrigatório' });
        hasError = true;
      }
      const addressFields: Array<keyof NonNullable<RegisterPageFormData['address']>> = [
        'state', 'city', 'street', 'number', 'neighborhood',
      ];
      addressFields.forEach((field) => {
        if (!data.address?.[field]) {
          setError(`address.${field}`, { message: 'Campo obrigatório' });
          hasError = true;
        }
      });
    }

    return !hasError;
  }

  function nextStep() {
    if (step === 1 && !validateAccountAndClinic()) return;
    if (step === 2 && !planId) {
      setError('planId', { message: 'Escolha um plano' });
      return;
    }
    setStep((current) => current + 1);
  }

  async function submitRegistration() {
    const data = getValues();
    if (!isInvite && (!selectedPlan || !data.hospitalName || !data.cnpj || !data.address || !data.responsible)) return;

    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        ...(inviteToken
          ? { invite_token: inviteToken }
          : {
              plan_id: selectedPlan!.id,
              hospital_name: data.hospitalName!,
              cnpj: data.cnpj!,
              address: {
                zip_code: data.address!.zipCode ?? '',
                street: data.address!.street ?? '',
                number: data.address!.number ?? '',
                neighborhood: data.address!.neighborhood ?? '',
                city: data.address!.city ?? '',
                state: data.address!.state ?? '',
                ...(data.address!.complement ? { complement: data.address!.complement } : {}),
              },
              responsible: {
                name: data.responsible!.name ?? '',
                crmv: data.responsible!.crmv ?? '',
              },
            }),
      };
      await register(payload);
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = isInvite ? 1 : 3;
  const data = getValues();

  return (
    <div className='min-h-screen flex'>
      <AuthPanel
        title={isInvite ? 'Você foi convidado' : 'Cadastre sua clínica'}
        description={isInvite ? 'Crie sua conta para entrar na equipe da clínica.' : 'Organize sua clínica, escolha um plano e finalize com pagamento seguro.'}
        gradient='from-emerald-600 via-teal-700 to-cyan-800'
      />

      <div className='flex-1 bg-white p-6 dark:bg-slate-950 sm:p-8'>
        <div className='mx-auto w-full max-w-3xl'>
          <div className='mb-8 flex items-center gap-2 lg:hidden'>
            <Activity className='text-teal-600' size={28} />
            <span className='text-xl font-bold text-slate-900 dark:text-white'>VetAI</span>
          </div>

          {!isInvite && (
            <div className='mb-8 flex items-center gap-2'>
              {[1, 2, 3].map((number) => (
                <div key={number} className='flex flex-1 items-center gap-2 last:flex-none'>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= number ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {number}
                  </div>
                  {number < 3 && <div className={`h-px flex-1 ${step > number ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit(submitRegistration)} className='space-y-6'>
            {step === 1 && (
              <>
                <div>
                  <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>{isInvite ? 'Criar sua conta' : 'Dados da clínica e acesso'}</h1>
                  <p className='mt-2 text-slate-500 dark:text-slate-400'>{isInvite ? 'Preencha seus dados para aceitar o convite.' : 'Estas informações identificam sua clínica e seu responsável.'}</p>
                </div>

                {!isInvite && (
                  <section className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <InputWithLabel label='Nome da clínica' name='hospitalName' control={control} error={errors.hospitalName?.message} required />
                      <InputWithLabel label='CNPJ' name='cnpj' control={control} error={errors.cnpj?.message} onChange={(event) => setValue('cnpj', formatCNPJ(event.target.value))} autoCapitalize='characters' maxLength={18} required />
                      <InputWithLabel label='Nome do responsável' name='responsible.name' control={control} error={errors.responsible?.name?.message} required />
                      <InputWithLabel label='CRMV do responsável' name='responsible.crmv' control={control} error={errors.responsible?.crmv?.message} required />
                    </div>
                    <div className='grid gap-4 sm:grid-cols-3'>
                      <InputWithLabel label='CEP' name='address.zipCode' control={control} error={errors.address?.zipCode?.message} onChange={(event) => setValue('address.zipCode', formatCEP(event.target.value))} inputMode='numeric' maxLength={9} required />
                      <InputWithLabel label='Estado' name='address.state' control={control} error={errors.address?.state?.message} maxLength={2} required />
                      <InputWithLabel label='Cidade' name='address.city' control={control} error={errors.address?.city?.message} required />
                      <InputWithLabel label='Rua' name='address.street' control={control} error={errors.address?.street?.message} containerClassName='sm:col-span-2' required />
                      <InputWithLabel label='Número' name='address.number' control={control} error={errors.address?.number?.message} required />
                      <InputWithLabel label='Bairro' name='address.neighborhood' control={control} error={errors.address?.neighborhood?.message} required />
                      <InputWithLabel label='Complemento' name='address.complement' control={control} />
                    </div>
                  </section>
                )}

                <section className='space-y-4'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <InputWithLabel label='Nome completo' name='name' control={control} error={errors.name?.message} autoComplete='name' required />
                    <InputWithLabel label='Email' type='email' name='email' control={control} error={errors.email?.message} autoComplete='email' required />
                    <InputWithLabel label='Senha' type={showPassword ? 'text' : 'password'} name='password' control={control} error={errors.password?.message} autoComplete='new-password' required endAdornment={<button type='button' onClick={() => setShowPassword(!showPassword)} className='text-slate-400'>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
                    <InputWithLabel label='Confirmar senha' type={showConfirmPassword ? 'text' : 'password'} name='confirmPassword' control={control} error={errors.confirmPassword?.message} autoComplete='new-password' required endAdornment={<button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='text-slate-400'>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
                  </div>
                  <PasswordStrength password={password} />
                </section>
              </>
            )}

            {!isInvite && step === 2 && (
              <>
                <div><h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Escolha seu plano</h1><p className='mt-2 text-slate-500 dark:text-slate-400'>Todos os limites e recursos abaixo são definidos pelo seu plano.</p></div>
                {plansLoading ? <p className='text-sm text-slate-500'>Carregando planos...</p> : <div className='grid gap-4 md:grid-cols-2'>{plans.map((plan) => <button key={plan.id} type='button' onClick={() => setValue('planId', plan.id)} className={`rounded-2xl border p-5 text-left ${planId === plan.id ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-800'}`}><div className='flex justify-between gap-4'><div><h2 className='font-semibold text-slate-900 dark:text-white'>{plan.name}</h2><p className='mt-1 text-sm text-slate-500'>{plan.description}</p></div>{planId === plan.id && <Check className='text-teal-600' />}</div><p className='mt-4 text-2xl font-bold text-teal-700 dark:text-teal-300'>{formatPrice(plan.monthlyPrice)}<span className='text-sm font-normal'>/mês</span></p><ul className='mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300'><li className='flex gap-2'><Users size={16} />Até {plan.userLimit} {plan.userLimit === 1 ? 'usuário' : 'usuários'}</li><li className='flex gap-2'><Sparkles size={16} />{plan.aiCredits} créditos de IA/mês</li>{plan.features.map((feature) => <li key={feature.key} className='flex gap-2'><Check size={16} className='text-teal-600' />{feature.label}</li>)}</ul></button>)}</div>}
                {errors.planId?.message && <p className='text-xs text-red-500'>{errors.planId.message}</p>}
              </>
            )}

            {!isInvite && step === 3 && selectedPlan && (
              <>
                <div><h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Revise e prossiga para o pagamento</h1><p className='mt-2 text-slate-500 dark:text-slate-400'>Você será direcionado ao ambiente seguro da Stripe para inserir os dados do cartão.</p></div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='rounded-xl border border-slate-200 p-5 dark:border-slate-800'><h2 className='font-semibold text-slate-900 dark:text-white'>Clínica</h2><p className='mt-3 text-sm text-slate-600 dark:text-slate-300'>{data.hospitalName}</p><p className='text-sm text-slate-600 dark:text-slate-300'>{data.cnpj}</p><p className='mt-3 text-sm text-slate-600 dark:text-slate-300'>{data.address?.street}, {data.address?.number} - {data.address?.city}/{data.address?.state}</p></div>
                  <div className='rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900 dark:bg-teal-950/30'><h2 className='font-semibold text-slate-900 dark:text-white'>{selectedPlan.name}</h2><p className='mt-2 text-2xl font-bold text-teal-700 dark:text-teal-300'>{formatPrice(selectedPlan.monthlyPrice)}<span className='text-sm font-normal'>/mês</span></p><p className='mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300'><Users size={16} />Até {selectedPlan.userLimit} usuários</p><p className='mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300'><Sparkles size={16} />{selectedPlan.aiCredits} créditos de IA/mês</p></div>
                </div>
                <div className='flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300'><ShieldCheck className='shrink-0 text-teal-600' size={20} />O pagamento é processado de forma segura pela Stripe. O VetAI não armazena os dados do seu cartão.</div>
              </>
            )}

            <div className='flex justify-between gap-3 pt-2'>
              {step > 1 && !isInvite ? <Button type='button' variant='outline' onClick={() => setStep((current) => current - 1)}><ChevronLeft size={16} />Voltar</Button> : <span />}
              {isInvite ? <Button type='button' onClick={() => { if (validateAccountAndClinic()) void submitRegistration(); }} loading={loading} className='bg-teal-600 text-white hover:bg-teal-700'>Aceitar convite</Button> : step < totalSteps ? <Button type='button' onClick={nextStep} className='bg-teal-600 text-white hover:bg-teal-700'>Continuar<ChevronRight size={16} /></Button> : <Button type='submit' loading={loading} className='bg-teal-600 text-white hover:bg-teal-700'>Ir para pagamento seguro<ChevronRight size={16} /></Button>}
            </div>
          </form>

          <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400'>Já tem uma conta? <Link href='/login' className='font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400'>Entrar</Link></p>
        </div>
      </div>
    </div>
  );
}
