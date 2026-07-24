export const PERMISSION_CATEGORIES = [
  {
    key: 'patients',
    label: 'Pacientes',
    permissions: ['patients:view', 'patients:edit'],
  },
  {
    key: 'tutors',
    label: 'Tutores',
    permissions: ['tutors:view', 'tutors:edit'],
  },
  { key: 'exams', label: 'Exames', permissions: ['exams:view', 'exams:edit'] },
  {
    key: 'vaccines',
    label: 'Vacinas',
    permissions: ['vaccines:view', 'vaccines:edit'],
  },
  {
    key: 'schedule',
    label: 'Agenda',
    permissions: ['schedule:view', 'schedule:edit'],
  },
  {
    key: 'monitoring',
    label: 'Monitoramento',
    permissions: ['monitoring:view', 'monitoring:edit'],
  },
  {
    key: 'consultation',
    label: 'Consulta',
    permissions: ['consultation:view', 'consultation:edit'],
  },
  {
    key: 'collaborators',
    label: 'Colaboradores',
    permissions: ['collaborators:view', 'collaborators:edit'],
  },
  { key: 'roles', label: 'Roles', permissions: ['roles:view', 'roles:edit'] },
  {
    key: 'settings',
    label: 'Configurações',
    permissions: ['settings:view', 'settings:edit'],
  },
  {
    key: 'billing',
    label: 'Faturamento',
    permissions: ['billing:view', 'billing:pay'],
  },
] as const;

export const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(
  (category) => category.permissions,
);

export function expandPermissions(permissions: string[] = []): string[] {
  const expanded = new Set(permissions);
  for (const permission of permissions) {
    if (permission.endsWith(':edit')) {
      expanded.add(permission.replace(':edit', ':view'));
    }
  }
  return Array.from(expanded);
}
