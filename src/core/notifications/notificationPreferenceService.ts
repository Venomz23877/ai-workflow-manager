import { ConfigService } from '../config/service'

export interface NotificationPreferences {
  quietHours: {
    start: string
    end: string
  }
  channels: string[]
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  quietHours: {
    start: '22:00',
    end: '07:00'
  },
  channels: ['in-app']
}

export class NotificationPreferenceService {
  private key = 'notifications.preferences'

  constructor(private configService: ConfigService) {}

  getPreferences(): NotificationPreferences {
    return (this.configService.get(this.key) as NotificationPreferences) ?? DEFAULT_PREFERENCES
  }

  savePreferences(prefs: NotificationPreferences): void {
    this.configService.set(this.key, prefs)
  }
}

