export interface NotificationPreferences {
  quietHours: {
    start: string
    end: string
  }
  channels: string[]
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  quietHours: {
    start: '22:00',
    end: '07:00'
  },
  channels: ['in-app']
}
