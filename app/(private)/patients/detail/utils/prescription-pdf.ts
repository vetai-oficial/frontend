import { SPECIE_LABELS } from '@/constants';
import type { User } from '@/types/auth';
import type { PrescriptionMedication, PrescriptionMetadata } from '@/types/health-record';
import type { HealthRecord } from '@/types/health-record';
import type { Patient } from '@/types/patient';
import type { Tutor } from '@/types/tutor';

function calcAgeStr(birthDate?: string): string {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  return parts.join(' e ') || 'menos de 1 mês';
}

function fmtDateTimeBr(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByUsage(medications: PrescriptionMedication[]): Map<string, PrescriptionMedication[]> {
  const map = new Map<string, PrescriptionMedication[]>();
  for (const med of medications) {
    const key = med.usage ?? 'Uso Veterinário';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(med);
  }
  return map;
}

function renderMedicationGroups(medications: PrescriptionMedication[]): string {
  const groups = groupByUsage(medications);
  let html = '';
  for (const [usage, meds] of groups) {
    html += `
      <div style="margin-bottom:18px;">
        <p style="font-size:11px;font-weight:bold;text-decoration:underline;text-transform:uppercase;margin:0 0 8px 0;">${usage}</p>
        ${meds.map((med) => `
          <div style="margin-bottom:12px;">
            <div style="display:flex;align-items:baseline;gap:4px;">
              <span style="font-size:12px;">${med.drug}${med.form ? ` ${med.form}` : ''}${med.quantity ? ` ${med.quantity}` : ''}</span>
              <span style="flex:1;border-bottom:1px dotted #555;min-width:40px;display:inline-block;margin:0 6px;"></span>
              <span style="font-size:11px;white-space:nowrap;">${med.form ?? ''}</span>
            </div>
            <p style="font-size:11px;margin:4px 0 0 14px;color:#333;">${med.posology}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  return html;
}

function buildAddressLine(user: User): string {
  const a = user.address;
  if (!a) return '';
  const parts: string[] = [];
  if (a.street) parts.push(a.street);
  if (a.number) parts.push(a.number);
  if (a.neighborhood) parts.push(a.neighborhood);
  if (a.city && a.uf) parts.push(`${a.city} - ${a.uf}`);
  else if (a.city) parts.push(a.city);
  if (a.cep) parts.push(`CEP ${a.cep}`);
  return parts.join(', ');
}

export function buildPrescriptionHtml(
  record: HealthRecord,
  patient: Patient,
  tutor: Tutor | null,
  user: User,
  latestWeight?: number,
  logoUrl?: string,
): string {
  const meta = record.metadata as unknown as PrescriptionMetadata;
  const prescDateTime = meta.include_date ? fmtDateTimeBr(record.date) : '';
  const specieLabel = SPECIE_LABELS[patient.specie] ?? patient.specie;
  const ageStr = calcAgeStr(patient.birth_date);
  const addressLine = buildAddressLine(user);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Receituário</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #525659; min-height: 100vh; padding: 32px 16px; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 20mm 20mm; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.35); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 2px solid #1a8070; }
    .brand-name { font-size: 24px; font-weight: bold; color: #1a8070; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 10px; color: #666; margin-top: 2px; }
    .vet-info { text-align: center; }
    .vet-info h2 { font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .vet-info p { font-size: 11px; margin: 2px 0; color: #333; }
    .section-title { font-size: 11px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 12px 0 7px; }
    .patient-row { display: flex; flex-wrap: wrap; gap: 3px 14px; font-size: 11px; margin-bottom: 3px; }
    .label { font-weight: bold; }
    .prescription-area { margin-top: 14px; }
    .date-line { text-align: right; font-size: 11px; margin-bottom: 10px; color: #555; }
    @media print {
      body { background: #fff; padding: 0; }
      .page { width: 100%; min-height: unset; padding: 16mm 20mm 20mm; box-shadow: none; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      ${logoUrl
    ? `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;"><img src="${logoUrl}" style="height:32px;width:auto;display:block;" alt="vetai" /><div style="font-size:9px;color:#666;margin-top:4px;">gerenciamento completo e diagnósticos eficientes<br/>para clínicas veterinárias</div></div>`
    : '<div class="brand-name">vetai</div><div class="brand-tagline">gerenciamento de clínicas veterinárias</div>'
}
    </div>
    <div class="vet-info">
      <h2>Receituário</h2>
      <p style="font-weight:bold;;">${user.name}</p>
      ${user.crmv ? `<p style="font-weight:bold;text-transform:uppercase;">CRMV-${user.crmv}</p>` : ''}
      ${addressLine ? `<p style="font-weight:bold;text-transform:uppercase;">${addressLine}</p>` : ''}
      ${user.phone ? `<p style="font-weight:bold;text-transform:uppercase;">${user.phone}</p>` : ''}
    </div>
  </div>

  <div class="section-title">Identificação do animal e proprietário</div>
  <div class="patient-row">
    <span><span class="label">Animal:</span> ${patient.name}</span>
    <span><span class="label">Espécie:</span> ${specieLabel}</span>
    ${patient.breed ? `<span><span class="label">Raça:</span> ${patient.breed}</span>` : ''}
    ${ageStr ? `<span><span class="label">Idade:</span> ${ageStr}</span>` : ''}
    ${latestWeight != null ? `<span><span class="label">Peso:</span> ${latestWeight} kg</span>` : ''}
    ${patient.sex ? `<span><span class="label">Sexo:</span> ${patient.sex === 'MALE' ? 'Macho' : 'Fêmea'}</span>` : ''}
  </div>
  ${tutor ? `
  <div class="patient-row" style="margin-top:4px;">
    <span><span class="label">Proprietário:</span> ${tutor.name}</span>
    ${tutor.phone ? `<span><span class="label">Tel.:</span> ${tutor.phone}</span>` : ''}
  </div>
  ` : ''}

  <div class="prescription-area">
    <div class="section-title">Prescrição</div>
    ${prescDateTime ? `<div class="date-line">${prescDateTime}</div>` : ''}
    ${renderMedicationGroups(meta.medications ?? [])}
  </div>
</div>
</body>
</html>`;
}

export function createPrescriptionBlobUrl(html: string): string {
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

export async function downloadPrescriptionAsPdf(html: string, fileName: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;';
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    iframe.src = blobUrl;
  });

  await new Promise<void>((resolve) => setTimeout(resolve, 400));

  const pageEl = iframe.contentDocument!.querySelector<HTMLElement>('.page') ?? iframe.contentDocument!.body;

  const canvas = await html2canvas(pageEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(iframe);
  URL.revokeObjectURL(blobUrl);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
