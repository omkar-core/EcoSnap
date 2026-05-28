import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { FirebaseManagerService } from './firebase.manager';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private platform = inject(PlatformService);
    private fbMgr = inject(FirebaseManagerService);

    async logEvent(name: string, params?: Record<string, any>) {
        if (this.platform.isWeb()) {
            if (this.fbMgr.analytics) {
                logEvent(this.fbMgr.analytics, name, params);
            }
        } else {
            await FirebaseAnalytics.logEvent({
                name,
                params
            });
        }
    }

    async setUserId(userId: string) {
        if (this.platform.isWeb()) {
            if (this.fbMgr.analytics) {
                setUserId(this.fbMgr.analytics, userId);
            }
        } else {
            await FirebaseAnalytics.setUserId({ userId });
        }
    }

    async setUserProperties(properties: Record<string, any>) {
        if (this.platform.isWeb()) {
            if (this.fbMgr.analytics) {
                setUserProperties(this.fbMgr.analytics, properties);
            }
        } else {
            // FirebaseAnalytics native plugin might require setting properties in string formats
            for (const key of Object.keys(properties)) {
                await FirebaseAnalytics.setUserProperty({
                    name: key,
                    value: properties[key]?.toString() || ''
                });
            }
        }
    }
}
