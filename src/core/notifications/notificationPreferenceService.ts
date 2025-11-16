import { ConfigService } from '../config/service'
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from './types'

export class NotificationPreferenceService {
  private key = 'notifications.preferences'

  constructor(private configService: ConfigService) {}

  getPreferences(): NotificationPreferences {
    return (
      (this.configService.get(this.key) as NotificationPreferences) ??
      DEFAULT_NOTIFICATION_PREFERENCES
    )
  }

  savePreferences(prefs: NotificationPreferences): void {
    this.configService.set(this.key, prefs)
  }
}
