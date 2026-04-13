export interface Tutor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTutorPayload {
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateTutorPayload {
  name?: string;
  phone?: string;
  email?: string;
}
