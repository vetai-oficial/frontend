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
  user: User;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  crmv: string;
}
