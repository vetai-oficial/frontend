export interface UserAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  uf: string;
  cep: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id?: string;
  permissions: string[];
  crmv?: string;
  phone?: string;
  address?: UserAddress;
  hospital_id?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  crmv?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  message?: string;
  checkout_url?: string | null;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  crmv?: string;
  invite_token?: string;
  plan_id?: string;
  hospital_name?: string;
  cnpj?: string;
  address?: {
    zip_code: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  responsible?: {
    name: string;
    crmv: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
