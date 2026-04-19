export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crmv?: string;
  hospital_id?: string;
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
