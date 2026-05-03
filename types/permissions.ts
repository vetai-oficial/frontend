export const PERMISSIONS = [
  'patients:view',
  'patients:edit',
  'tutors:view',
  'tutors:edit',
  'exams:view',
  'exams:edit',
  'vaccines:view',
  'vaccines:edit',
  'schedule:view',
  'schedule:edit',
  'monitoring:view',
  'monitoring:edit',
  'consultation:view',
  'consultation:edit',
  'collaborators:view',
  'collaborators:edit',
  'roles:view',
  'roles:edit',
  'settings:view',
  'settings:edit',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
