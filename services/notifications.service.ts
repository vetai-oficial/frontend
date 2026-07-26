import { buildQuery, httpClient } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { AppNotification } from '@/types/notification';

interface NotificationListParams extends QueryParams {
  unread?: boolean;
}

export const notificationsService = {
  list: (params?: NotificationListParams) => {
    const query = buildQuery(params);
    const sep = query ? '&' : '?';
    const suffix = params?.unread ? `${sep}unread=true` : '';
    return httpClient<PaginatedResponse<AppNotification>>(
      `notifications${query}${suffix}`,
    );
  },

  unreadCount: () =>
    httpClient<{ count: number }>('notifications/unread-count'),

  markRead: (id: string) =>
    httpClient<AppNotification>(`notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllRead: () =>
    httpClient<{ success: boolean }>('notifications/read-all', {
      method: 'PATCH',
    }),
};
