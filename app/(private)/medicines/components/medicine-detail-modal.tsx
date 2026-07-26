'use client';

import {
  AlertTriangle,
  Archive,
  BookOpen,
  Calculator,
  Clock,
  FlaskConical,
  Info,
  Layers,
  MessageSquare,
  Pill,
  Route,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/app/components/common/modal';
import type { DoseEntry, Medicine } from '@/types/medicine';

interface MedicineDetailModalProps {
  medicine: Medicine;
  onClose: () => void;
}

const TABS = [
  { key: 'sobre', label: 'Sobre' },
  { key: 'indicacoes', label: 'IndicaÃ§Ãµes e ContraindicaÃ§Ãµes' },
  { key: 'administracao', label: 'AdministraÃ§Ã£o e Doses' },
  { key: 'apresentacoes', label: 'ApresentaÃ§Ãµes e ConcentraÃ§Ãµes' },
] as const;

type Tab = (typeof TABS)[number]['key'];
type SpeciesKey = 'dogs' | 'cats' | 'cattle' | 'horses';

const SPECIES_OPTIONS: { key: SpeciesKey; label: string }[] = [
  { key: 'dogs', label: 'CÃ£o' },
  { key: 'cats', label: 'Gato' },
  { key: 'cattle', label: 'Bovino' },
  { key: 'horses', label: 'Equino' },
];

function parseDoseRange(entry: DoseEntry | undefined): { min: number; max: number } | null {
  if (!entry?.dose || !entry?.unit) return null;
  if (!entry.unit.toLowerCase().includes('/kg')) return null;
  const match = entry.dose.match(/(\d+(?:[.,]\d+)?)\s*(?:a\s*(\d+(?:[.,]\d+)?))?/);
  if (!match) return null;
  const min = parseFloat(match[1]!.replace(',', '.'));
  const max = match[2] ? parseFloat(match[2].replace(',', '.')) : min;
  if (isNaN(min)) return null;
  return { min, max };
}

function formatDose(mg: number): string {
  return mg >= 1000
    ? `${(mg / 1000).toFixed(2).replace(/\.?0+$/, '')} g`
    : `${mg % 1 === 0 ? mg : mg.toFixed(2)} mg`;
}

function ListSection({
  icon: Icon,
  label,
  items,
  iconColor,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  items: string[];
  iconColor: string;
  bgColor: string;
}) {
  if (!items.length) return null;
  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {value || <span className="text-slate-400 dark:text-slate-500 font-normal">â€”</span>}
      </p>
    </div>
  );
}

function TextBlock({
  icon: Icon,
  label,
  value,
  iconColor,
  borderColor,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
  iconColor: string;
  borderColor: string;
  bgColor: string;
}) {
  if (!value) return null;
  return (
    <div className={`rounded-xl border p-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
    </div>
  );
}

export function MedicineDetailModal({ medicine, onClose }: MedicineDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sobre');
  const [calcSpecies, setCalcSpecies] = useState<SpeciesKey>('dogs');
  const [weight, setWeight] = useState('');

  const activeEntry =
    medicine.referenceDose?.[calcSpecies] ?? medicine.referenceDose?.general;
  const parsedDose = parseDoseRange(activeEntry);
  const weightKg = parseFloat(weight);
  const calculatedResult =
    parsedDose && weightKg > 0
      ? {
        min: parsedDose.min * weightKg,
        max: parsedDose.max * weightKg,
        isRange: parsedDose.min !== parsedDose.max,
      }
      : null;

  return (
    <Modal title={medicine.name} maxWidth="2xl" onClose={onClose}>
      <div className="flex flex-col gap-0 -mx-5 -mt-5">
        {/* Classification + active ingredients header */}
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          {medicine.classification && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {medicine.classification}
            </span>
          )}
          {medicine.activeIngredients && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {medicine.activeIngredients}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all text-center leading-snug ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 py-5 space-y-4">

          {/* â”€â”€ INDICAÃ‡Ã•ES E CONTRAINDICAÃ‡Ã•ES â”€â”€ */}
          {activeTab === 'indicacoes' && (
            <>
              <TextBlock
                icon={BookOpen}
                label="IndicaÃ§Ãµes"
                value={medicine.fullIndications}
                iconColor="text-teal-500"
                borderColor="border-teal-200 dark:border-teal-800"
                bgColor="bg-teal-50/50 dark:bg-teal-900/20"
              />

              <ListSection
                icon={AlertTriangle}
                label="ContraindicaÃ§Ãµes e PrecauÃ§Ãµes"
                items={medicine.contraindicationsPrecautions ?? []}
                iconColor="text-red-500"
                bgColor="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10"
              />

              <ListSection
                icon={Zap}
                label="Efeitos Adversos"
                items={medicine.adverseEffects ?? []}
                iconColor="text-slate-400 dark:text-slate-500"
                bgColor="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              />

              <TextBlock
                icon={ShieldAlert}
                label="Superdosagem"
                value={medicine.overdose}
                iconColor="text-slate-400 dark:text-slate-500"
                borderColor="border-slate-200 dark:border-slate-700"
                bgColor="bg-slate-50 dark:bg-slate-800/50"
              />

              <TextBlock
                icon={Info}
                label="ReproduÃ§Ã£o, GestaÃ§Ã£o e LactaÃ§Ã£o"
                value={medicine.reproductionPregnancyLactation}
                iconColor="text-slate-400 dark:text-slate-500"
                borderColor="border-slate-200 dark:border-slate-700"
                bgColor="bg-slate-50 dark:bg-slate-800/50"
              />

              {!medicine.fullIndications &&
                !medicine.contraindicationsPrecautions?.length &&
                !medicine.adverseEffects?.length &&
                !medicine.overdose &&
                !medicine.reproductionPregnancyLactation && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center">
                  <AlertTriangle size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                      Nenhuma informaÃ§Ã£o disponÃ­vel.
                  </p>
                </div>
              )}
            </>
          )}

          {/* â”€â”€ ADMINISTRAÃ‡ÃƒO E DOSES â”€â”€ */}
          {activeTab === 'administracao' && (
            <>
              {/* Routes */}
              {(medicine.administrationRoutes?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Route size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Vias de AdministraÃ§Ã£o
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {medicine.administrationRoutes!.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency + duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Clock}
                  label="FrequÃªncia de Uso"
                  value={medicine.usageFrequency}
                  iconColor="text-blue-500"
                />
                <InfoCard
                  icon={Clock}
                  label="DuraÃ§Ã£o do Tratamento"
                  value={medicine.treatmentDuration}
                  iconColor="text-indigo-500"
                />
              </div>

              {/* Doses per species */}
              {medicine.referenceDose && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill size={14} className="text-violet-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Doses de ReferÃªncia
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SPECIES_OPTIONS.map(({ key, label }) => {
                      const entry = medicine.referenceDose?.[key];
                      return (
                        <div
                          key={key}
                          className="flex flex-col gap-1 p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {label}
                          </span>
                          {entry?.dose ? (
                            <>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {entry.dose}
                              </p>
                              {entry.unit && (
                                <p className="text-xs text-slate-400 dark:text-slate-500">{entry.unit}</p>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">â€”</span>
                          )}
                        </div>
                      );
                    })}
                    {medicine.referenceDose.general && (
                      <div className="col-span-2 sm:col-span-4 flex flex-col gap-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Geral (todas as espÃ©cies)
                        </span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {medicine.referenceDose.general.dose}
                          {medicine.referenceDose.general.unit && (
                            <span className="text-xs font-normal text-slate-400 ml-1.5">
                              {medicine.referenceDose.general.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dosage notes */}
              <TextBlock
                icon={Info}
                label="ObservaÃ§Ãµes de Dosagem"
                value={medicine.dosageNotes}
                iconColor="text-blue-400"
                borderColor="border-blue-200 dark:border-blue-800/50"
                bgColor="bg-blue-50/50 dark:bg-blue-900/10"
              />

              {/* Dose calculator */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <Calculator size={14} className="text-teal-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Calculadora de Dose
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">EspÃ©cie</p>
                    <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden w-fit">
                      {SPECIES_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setCalcSpecies(opt.key)}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            calcSpecies === opt.key
                              ? 'bg-teal-500 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex-1 max-w-[180px]">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Peso do animal
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Ex: 12"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                          kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {weight && weightKg > 0 && (
                    <>
                      {calculatedResult ? (
                        <div className="rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-3 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-0.5">
                              Dose calculada para {weightKg} kg
                            </p>
                            <p className="text-base font-bold text-teal-700 dark:text-teal-300">
                              {calculatedResult.isRange
                                ? `${formatDose(calculatedResult.min)} â€“ ${formatDose(calculatedResult.max)}`
                                : formatDose(calculatedResult.min)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            {activeEntry
                              ? 'Dose disponÃ­vel mas nÃ£o calculÃ¡vel automaticamente. Consulte a bula.'
                              : 'Dose nÃ£o informada para esta espÃ©cie. Consulte a bula.'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* â”€â”€ APRESENTAÃ‡Ã•ES E CONCENTRAÃ‡Ã•ES â”€â”€ */}
          {activeTab === 'apresentacoes' && (
            <>
              {(medicine.presentationsConcentrations?.length ?? 0) > 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={15} className="text-teal-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ApresentaÃ§Ãµes e ConcentraÃ§Ãµes
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {medicine.presentationsConcentrations!.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center">
                  <FlaskConical size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Nenhuma apresentaÃ§Ã£o disponÃ­vel.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Thermometer}
                  label="Armazenamento"
                  value={medicine.storage}
                  iconColor="text-sky-500"
                />
                <InfoCard
                  icon={Stethoscope}
                  label="Monitoramento"
                  value={medicine.monitoring}
                  iconColor="text-violet-500"
                />
              </div>

              <TextBlock
                icon={MessageSquare}
                label="InformaÃ§Ãµes ao Cliente"
                value={medicine.clientInformation}
                iconColor="text-slate-400 dark:text-slate-500"
                borderColor="border-slate-200 dark:border-slate-700"
                bgColor="bg-slate-50 dark:bg-slate-800/50"
              />
            </>
          )}

          {/* â”€â”€ SOBRE â”€â”€ */}
          {activeTab === 'sobre' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={Pill}
                  label="PrincÃ­pios Ativos"
                  value={medicine.activeIngredients}
                  iconColor="text-teal-500"
                />
                <InfoCard
                  icon={Archive}
                  label="ClassificaÃ§Ã£o"
                  value={medicine.classification}
                  iconColor="text-indigo-500"
                />
              </div>

              {(medicine.recommendedSpecies?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      EspÃ©cies Recomendadas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {medicine.recommendedSpecies!.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!medicine.activeIngredients &&
                !medicine.classification &&
                !medicine.recommendedSpecies?.length && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center">
                  <FlaskConical size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                      Nenhuma informaÃ§Ã£o disponÃ­vel.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </Modal>
  );
}
