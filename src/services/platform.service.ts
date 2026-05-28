import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    isNative(): boolean {
        return Capacitor.isNativePlatform();
    }

    isWeb(): boolean {
        return !this.isNative();
    }

    getPlatform(): string {
        return Capacitor.getPlatform();
    }
}
