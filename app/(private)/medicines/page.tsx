'use client';

import { Loader2, Pill, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { MedicineDetailModal } from './components/medicine-detail-modal';

import { Card } from '@/app/components/card';
import { Header } from '@/app/components/header';
import { SelectInput } from '@/app/components/select-input';
import { Input } from '@/components/ui/input';
import { medicinesService } from '@/services/medicines.service';
import type { Medicine } from '@/types/medicine';

const MEDICINE_TYPES = [
  'Aditivos Promotores de Crescimento', 'Adrenolíticos', 'Adulticidas', 'Agentes Alquilantes',
  'Alcalinizantes Sistêmicos', 'Aminoglicosídeos', 'Analgésicos', 'Anestésicos dissociativos',
  'Anestésicos gerais', 'Anestésicos Gerais Intravenosos', 'Anestésicos inalatórios', 'Anestésicos locais',
  'Anfenicóis', 'Ansiolíticos', 'Antagonistas Alfa-2', 'Antagonistas Benzodiazepínicos',
  'Antagonistas H2', 'Antagonistas Opioides', 'Antiagregantes', 'Antiagregantes plaquetários',
  'Antiarrítmicos', 'Antiarrítmicos classe I', 'Antiarrítmicos classe III', 'Antibióticos',
  'Anticoccidianos', 'Anticoccidianos Bovinos', 'Anticolinesterásicos', 'Anticolinesterásicos de Curta Duração',
  'Anticonvulsivantes', 'Antidepressivos', 'Antidiabéticos', 'Antidiarreicos', 'Antidiuréticos',
  'Antídotos', 'Antídotos Especiais', 'Antieméticos', 'Antiespasmódicos', 'Antifibrinolíticos',
  'Antifúngicos', 'Antiglaucomatosos', 'Anti-hipertensivos', 'Anti-histamínicos', 'Anti-inflamatórios',
  'Anti-inflamatórios intestinais', 'Anti-inflamatórios Naturais', 'Antimicrobianos', 'Antineoplásicos',
  'Antineoplásicos adjuvantes', 'Antioxidantes', 'Antiparasitários', 'Antiprogestágenos',
  'Antiprotozoários', 'Antiprotozoários sanguíneos', 'Antipruriginosos', 'Antissépticos Urinários',
  'Antitérmicos', 'Antitireoidianos', 'Antitussígenos', 'Antivirais', 'Antiácidos', 'Babesicidas',
  'Barbitúricos', 'Betabloqueadores', 'Bloqueadores de Canal de Cálcio', 'Bloqueadores dos Receptores de Angiotensina',
  'Bloqueadores Neuromusculares', 'Broncodilatadores', 'Broncodilatadores inalatórios', 'Cardiotônicos',
  'Cardiotônicos de Emergência', 'Catecolaminas', 'Cefalosporinas', 'Cefalosporinas de 4ª Geração',
  'Coagulantes', 'Coccidiostáticos', 'Coleréticos', 'Condroprotetores', 'Corticosteroides', 'Coxibes',
  'Diagnóstico', 'Diuréticos', 'Diuréticos Tiazídicos', 'Ectoparasiticidas', 'Emergência', 'Endectocidas',
  'Endócrinos', 'Enzimas Digestivas', 'Estimuladores hematopoiéticos', 'Estimulantes de apetite',
  'Fenotiazínicos', 'Fluoroquinolonas', 'Galactagogos', 'Hemostáticos', 'Heparinas Baixo Peso',
  'Hepatoprotetores', 'Hormônios', 'Hormônios Reprodutivos', 'Imunomoduladores', 'Imunossupressores',
  'Inibidores Adrenais', 'Inibidores da ECA', 'Inibidores da MAO', 'Inibidores de prolactina',
  'Inibidores de quitina', 'Inibidores de Tirosina Quinase', 'Inodilatadores', 'Inotrópicos Positivos',
  'Isoxazolinas', 'Laxantes', 'Laxantes Osmóticos', 'Lincosamidas', 'Macrolídeos', 'Midriáticos',
  'Milbemicinas', 'Mineralocorticoides', 'Modificadores de Comportamento', 'Mucolíticos',
  'Neonicotinoides', 'Neurológicos', 'Neuromoduladores', 'Nutracêuticos', 'Oftálmicos', 'Opioides',
  'Polipeptídeos', 'Prostaglandinas', 'Protetores biliares', 'Protetores Gástricos', 'Pró-cinéticos',
  'Pró-cinéticos GI fortes', 'Quelantes', 'Quimioterapia', 'Reativadores de Colinesterase',
  'Redutores de amônia', 'Relaxantes Anestésicos', 'Relaxantes musculares', 'Relaxantes Musculares Centrais',
  'Repelentes', 'Reversores Neuromusculares', 'Rifamicinas', 'Sedativos', 'Simpatomiméticos', 'Sulfonamidas',
  'Suplementos', 'Suplementos Minerais Injetáveis', 'Tenicidas', 'Tetraciclinas', 'Tireoidianos',
  'Tranquilizantes', 'Vasodilatadores', 'Vasopressores', 'Vermífugos', 'Vermífugos Pró-drogas', 'Vitaminas',
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  ...MEDICINE_TYPES.map((t) => ({ value: t, label: t })),
];

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Medicine | null>(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicinesService.list({
        search: search || undefined,
        type: typeFilter || undefined,
        page,
        size: 18,
      });
      setMedicines(res.data);
      setTotalPages(res.meta.total_pages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => { void fetchMedicines(); }, [fetchMedicines]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const isEmpty = !loading && medicines.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Medicações" showStorage={false} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="w-full sm:w-56">
            <SelectInput
              value={typeFilter}
              onChange={handleTypeFilter}
              options={TYPE_OPTIONS}
              placeholder="Todos os tipos"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-teal-600" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Pill size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search || typeFilter ? 'Nenhum medicamento encontrado.' : 'Nenhum medicamento cadastrado ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onClick={() => setSelected(medicine)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <MedicineDetailModal medicine={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function MedicineCard({
  medicine,
  onClick,
}: {
  medicine: Medicine;
  onClick: () => void;
}) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
          <Pill size={16} className="text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
            {medicine.name}
          </h3>
          {medicine.activeIngredients && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {medicine.activeIngredients}
            </p>
          )}
        </div>
      </div>

      {/* Classification + routes */}
      <div className="flex flex-wrap gap-1 mt-3">
        {medicine.classification && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {medicine.classification}
          </span>
        )}
        {medicine.administrationRoutes?.slice(0, 2).map((r) => (
          <span
            key={r}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            {r}
          </span>
        ))}
      </div>

      {/* Indications snippet */}
      {medicine.fullIndications && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {medicine.fullIndications}
        </p>
      )}
    </Card>
  );
}
