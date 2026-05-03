export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id?: string;
  permissions: string[];
  crmv?: string;
  hospital_id?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  message?: string;
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
  invite_token?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
