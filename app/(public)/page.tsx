'use client';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  FileText,
  Heart,
  Microscope,
  Shield,
  Sparkles,
  Star,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Counter } from '@/app/components/counter';
import { Reveal } from '@/app/components/reveal';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Brain,
    title: 'Diagnóstico com IA',
    description:
      'Inteligência artificial avançada que auxilia na análise e diagnóstico veterinário com precisão.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Microscope,
    title: 'Análise de Exames',
    description:
      'Envie exames laboratoriais e obtenha interpretações automáticas e detalhadas em segundos.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
  },
  {
    icon: BarChart3,
    title: 'Monitoramento em Tempo Real',
    description:
      'Acompanhe a evolução dos pacientes com gráficos e alertas inteligentes.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: FileText,
    title: 'Prontuário Digital',
    description:
      'Histórico completo do paciente, com registros de peso, medicações e exames em um só lugar.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description:
      'Seus dados e dos seus pacientes protegidos com criptografia de ponta a ponta.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: Upload,
    title: 'Upload Inteligente',
    description:
      'Envie exames em diversos formatos e deixe a IA extrair automaticamente os dados relevantes.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Grátis',
    period: '',
    description: 'Perfeito para começar a experimentar.',
    features: [
      'Até 10 pacientes',
      '5 análises de exame/mês',
      'Prontuário digital básico',
      'Suporte por email',
    ],
    cta: 'Começar Grátis',
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para clínicas que buscam eficiência.',
    features: [
      'Pacientes ilimitados',
      '100 análises de exame/mês',
      'Prontuário digital completo',
      'Monitoramento em tempo real',
      'Diagnóstico assistido por IA',
      'Suporte prioritário',
    ],
    cta: 'Começar Agora',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 297',
    period: '/mês',
    description: 'Para hospitais e redes veterinárias.',
    features: [
      'Tudo do Profissional',
      'Análises ilimitadas',
      'Multi-unidades',
      'API de integração',
      'Relatórios avançados',
      'Suporte dedicado 24/7',
      'Treinamento personalizado',
    ],
    cta: 'Falar com Vendas',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Dra. Ana Paula',
    role: 'Clínica VetCare',
    text: 'O VetAI revolucionou como faço diagnósticos. A análise automática de exames me economiza horas de trabalho.',
    avatar: 'AP',
  },
  {
    name: 'Dr. Carlos Mendes',
    role: 'Hospital Animal',
    text: 'A precisão da IA é impressionante. Já identifiquei condições que poderiam ter passado despercebidas.',
    avatar: 'CM',
  },
  {
    name: 'Dra. Mariana Costa',
    role: 'PetCenter',
    text: 'O monitoramento em tempo real mudou completamente o cuidado pós-operatório dos meus pacientes.',
    avatar: 'MC',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="text-teal-600" size={28} />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              VetAI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors">
              Planos
            </a>
            <a href="#testimonials" className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors">
              Depoimentos
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white text-sm">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Plataforma de IA para veterinários
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
              Diagnósticos veterinários com{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-emerald-500">
                inteligência artificial
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transforme a forma como você cuida dos seus pacientes. Análise
              automática de exames, diagnósticos assistidos por IA e
              monitoramento em tempo real.
            </p>
          </Reveal>

          <Reveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-12 text-base"
                >
                  Começar Gratuitamente
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 h-12 text-base"
                >
                  Ver Funcionalidades
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal direction="up" delay={400}>
            <div className="mt-16 relative max-w-5xl mx-auto">
              <div className="absolute -inset-4 bg-linear-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-2xl" />
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-slate-400">
                    vetai.app/dashboard
                  </span>
                </div>
                <div className="p-6 md:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Pacientes', value: '1.234' },
                      { label: 'Exames Analisados', value: '5.678' },
                      { label: 'Precisão IA', value: '98,5%' },
                      { label: 'Tempo Economizado', value: '340h' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                      >
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 md:h-48 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <div className="text-center">
                      <Activity
                        size={40}
                        className="text-teal-500 mx-auto mb-2"
                      />
                      <p className="text-sm text-slate-400">
                        Dashboard Preview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: 2500,
                suffix: '+',
                label: 'Veterinários ativos',
                icon: Users,
              },
              {
                value: 50000,
                suffix: '+',
                label: 'Exames analisados',
                icon: Microscope,
              },
              {
                value: 98,
                suffix: '%',
                label: 'Precisão da IA',
                icon: Zap,
              },
              {
                value: 15000,
                suffix: '+',
                label: 'Pacientes monitorados',
                icon: Heart,
              },
            ].map((stat, i) => (
              <Reveal key={stat.label} direction="up" delay={i * 100}>
                <div className="flex flex-col items-center">
                  <stat.icon
                    size={28}
                    className="text-teal-600 dark:text-teal-400 mb-3"
                  />
                  <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                Funcionalidades
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Ferramentas poderosas pensadas para o dia a dia do veterinário
                moderno.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} direction="up" delay={i * 80}>
                <div className="group relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:shadow-lg hover:shadow-teal-500/5">
                  <div
                    className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4`}
                  >
                    <feature.icon size={24} className={feature.color} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                Como funciona?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Simples, rápido e preciso
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Três passos para transformar a forma como você diagnostica.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 lg:gap-0 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Envie o Exame',
                description:
                  'Faça upload do exame laboratorial em PDF, imagem ou qualquer formato suportado.',
                icon: Upload,
                color: 'from-teal-500 to-emerald-500',
                shadow: 'shadow-teal-500/20',
              },
              {
                step: '02',
                title: 'IA Analisa',
                description:
                  'Nossa inteligência artificial processa e extrai todos os dados relevantes automaticamente.',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                shadow: 'shadow-purple-500/20',
              },
              {
                step: '03',
                title: 'Receba o Diagnóstico',
                description:
                  'Obtenha resultados interpretados com sugestões de diagnóstico e próximos passos.',
                icon: FileText,
                color: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
              },
            ].flatMap((item, i, arr) => {
              const card = (
                <Reveal key={item.step} direction="up" delay={i * 150}>
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 text-center h-full">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadow} mb-5`}>
                      <item.icon size={24} className="text-white" />
                    </div>
                    <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 dark:text-slate-600">
                      PASSO {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );

              if (i < arr.length - 1) {
                return [
                  card,
                  <div key={`arrow-${i}`} className="hidden md:flex items-center justify-center px-2 lg:px-4 shrink-0">
                    <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600">
                      <div className="w-6 lg:w-10 h-px bg-slate-300 dark:bg-slate-700" />
                      <ChevronRight size={16} />
                    </div>
                  </div>,
                ];
              }
              return [card];
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                Planos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Escolha o plano ideal para você
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Comece gratuitamente e escale conforme sua necessidade.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} direction="up" delay={i * 100}>
                <div
                  className={`relative rounded-2xl p-8 flex flex-col h-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-b from-teal-600/90 to-emerald-700/90 backdrop-blur-xl text-white shadow-2xl shadow-teal-500/25 scale-105 border border-white/20 ring-1 ring-teal-400/30'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-400/20 dark:text-teal-200 text-xs font-bold uppercase tracking-wide border border-teal-200 dark:border-teal-400/30 shadow-sm">
                      Mais Popular
                    </div>
                  )}
                  <h3
                    className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${plan.highlighted ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-6 mb-8">
                    <span
                      className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-sm ${plan.highlighted ? 'text-teal-200' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          size={18}
                          className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-teal-200' : 'text-teal-600 dark:text-teal-400'}`}
                        />
                        <span
                          className={`text-sm ${plan.highlighted ? 'text-teal-50' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-white text-teal-700 hover:bg-teal-50'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                      <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="py-20 bg-slate-50 dark:bg-slate-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                Depoimentos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                O que nossos clientes dizem
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <Reveal key={testimonial.name} direction="up" delay={i * 100}>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-teal-950 to-slate-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
                  <Sparkles size={14} />
                  Comece gratuitamente
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
                  Pronto para transformar{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-emerald-400">
                    sua clínica?
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-8">
                  Junte-se a milhares de veterinários que já usam inteligência
                  artificial para diagnósticos mais rápidos e precisos.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-teal-500 hover:bg-teal-400 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-teal-500/25"
                    >
                      Criar Conta Gratuita
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-slate-300 hover:text-white hover:bg-white/10 px-8 h-12 text-base"
                    >
                      Já tenho conta
                      <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { value: 2500, suffix: '+', label: 'Veterinários', icon: Users },
                  { value: 50000, suffix: '+', label: 'Exames', icon: Microscope },
                  { value: 98, suffix: '%', label: 'Precisão IA', icon: Zap },
                  { value: 15000, suffix: '+', label: 'Pacientes', icon: Heart },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-center"
                  >
                    <stat.icon size={20} className="text-teal-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Activity className="text-teal-600" size={24} />
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                VetAI
              </span>
            </div>
            <div className="flex items-center justify-center gap-6 w-full">
              <p className="text-sm text-slate-400 dark:text-slate-500">
              &copy; 2026 VetAI. Todos os direitos reservados.
              </p>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
