import { buildQuery, httpClient } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { ScheduleEvent } from '@/types/schedule';

type ScheduleEventPayload = Omit<ScheduleEvent, 'id'>;

export interface ScheduleListParams extends QueryParams {
  patientName?: string;
  tutorName?: string;
  date?: string;
}

export const scheduleService = {
  async list(params?: ScheduleListParams): Promise<ScheduleEvent[]> {
    const response = await httpClient<PaginatedResponse<ScheduleEvent>>(
      `schedule/events${buildQuery(params)}`,
    );
    return response.data;
  },

  async listByDate(date: string): Promise<ScheduleEvent[]> {
    return this.list({ date, size: 500, sort: 'startTime', direction: 'asc' });
  },

  async listByPatient(patientName: string, fromDate?: string): Promise<ScheduleEvent[]> {
    const params: ScheduleListParams = {
      patientName,
      size: 500,
      sort: 'date',
      direction: 'asc',
    };
    if (fromDate) {
      params.date = fromDate;
    }
    return this.list(params);
  },

  get(id: string) {
    return httpClient<ScheduleEvent>(`schedule/events/${id}`);
  },

  create(data: ScheduleEventPayload) {
    return httpClient<ScheduleEvent>('schedule/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<ScheduleEventPayload>) {
    return httpClient<ScheduleEvent>(`schedule/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return httpClient<void>(`schedule/events/${id}`, { method: 'DELETE' });
  },
};
