# Vet AI Frontend - System Description & Rules

## System Overview

Vet AI is a SaaS platform designed for veterinarians to manage patient (animal) records.
Key features include:

- **Patient Registration**: Veterinarians can register animals.
- **Medical Records**: Upload images and medical reports.
- **AI Analysis**: An AI module analyzes the uploaded images and reports to provide risk assessments, observations, and insights.

## Development Rules

### Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Forms**: react-hook-form + `@hookform/resolvers` + yup
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **Icons**: lucide-react
- **Toast/Sonner**: sonner
- **Charts**: chart.js + react-chartjs-2
- **Real-time**: socket.io-client
- **AI**: @google/generative-ai
- **Package Manager**: bun
- **TypeScript**: strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`

### Naming Conventions

- **Components**: PascalCase (e.g., `InputWithLabel`, `TutorModal`)
- **Files**: kebab-case for utils, schemas, services (e.g., `patient.service.ts`)
- **Schemas**: camelCase with Schema suffix (e.g., `tutorSchema`, `loginSchema`)
- **Types**: `NomeData` inferred via `yup.InferType` (e.g., `TutorFormData`)
- **Route Groups**: `(public)` for unauthenticated, `(private)` for authenticated, `/admin` for admin section

### Form Patterns

All forms **must** follow these conventions:

1. **Schema**: Define yup schemas in `schemas/` files, one per domain:

   ```ts
   export const tutorSchema = yup.object({
     name: yup.string().required('Nome é obrigatório'),
     cpf: yup
       .string()
       .test('cpf-valid', 'CPF inválido', (v) => {
         if (!v) return false;
         return validateCPF(v);
       })
       .required('CPF é obrigatório'),
     phone: yup
       .string()
       .test('phone-valid', 'Telefone inválido', (v) => {
         if (!v) return false;
         return validatePhone(v);
       })
       .required('Telefone é obrigatório'),
   });
   export type TutorFormData = yup.InferType<typeof tutorSchema>;
   ```

2. **Validators**: Use `@/utils/validations` for CPF, phone, email, date, and password schemas. Reuse pre-built schemas from that file when possible: `cpfSchema`, `phoneSchema`, `emailSchema`, `dateSchema`, `passwordSchema`.

3. **Masks**: Always format inputs using `@/utils/masks` (`formatCPF`, `formatCNPJ`, `formatPhone`, `formatCEP`). Apply in the `onChange` of `<Controller>`:

   ```tsx
   <Controller
     name='cpf'
     control={control}
     render={({ field }) => (
       <InputWithLabel
         label='CPF'
         value={field.value}
         onChange={(e) => field.onChange(formatCPF(e.target.value))}
         error={errors.cpf?.message}
       />
     )}
   />
   ```

4. **Resolver**: Wire the schema using `yupResolver`:

   ```tsx
   const { control, handleSubmit } = useForm<TutorFormData>({
     resolver: yupResolver(tutorSchema),
   });
   ```

5. **Service calls**: On submit, call the corresponding service method (e.g., `tutorsService.create(data)`) and handle success/error with toast notifications.

### Component Structure

- `components/ui/` — shadcn/ui primitives (button, input, label, switch, tooltip, carousel, progress)
- `app/components/layout/` — Sidebar, Header, AuthGuard
- `app/components/common/` — Modal, Badge, Card, Reveal, Counter, ConfirmModal, PasswordStrength, Switch
- `app/components/forms/` — InputWithLabel, SelectInput, SearchSelect, DateInput, TimeInput, FormTextarea, FileDropzone, FieldShell
- `app/components/data/` — DataTable, SectionCard, StatCard
- `app/components/business/` — Domain components (PatientModal, TutorModal, UploadExamModal, ConsultationHistory, etc.)

### Services & API

- Each domain has a service file in `services/` with CRUD methods: `.list()`, `.get()`, `.create()`, `.update()`, `.delete()`
- Use the generic `httpClient<T>(endpoint, options)` from `@/infra/http-client`
- Use `buildQuery(params)` for paginated query parameters
- Services return `Promise<T | undefined>` — `undefined` for 204 responses

### State Management

- **React Context**: AuthContext (`@/infra/auth-context`) for authentication state, ThemeContext (`@/contexts/theme-context`) for theme
- **Custom Hooks**: `usePaginatedResource` for paginated lists, `useConsultation` for real-time chat, `useReveal` for scroll animations
- **Local State**: `useState`/`useCallback` for page-level state

### Workflow Rules

- **Final Verification**: Always run `bun run lint` and `bun run build` at the end of any process to ensure code quality and build stability.
- **No console.log** in production (ESLint rule set to `warn`).

### General Rules

- **Comments**: Avoid adding comments to the code.
- Follow the ESLint flat config: 2-space indent, single quotes, semicolons, trailing commas in multiline, import ordering (builtin → external → internal → parent/sibling/index).
