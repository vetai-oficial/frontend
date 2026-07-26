const BR_COUNTRY_CODE = '55';

// wa.me exige o número em formato internacional, só dígitos. Números com 10/11
// dígitos são tratados como brasileiros (DDD + assinante) e recebem o 55.
export function whatsappLink(phone?: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  const international =
    digits.length <= 11 ? `${BR_COUNTRY_CODE}${digits}` : digits;

  return `https://wa.me/${international}`;
}
