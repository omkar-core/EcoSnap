import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { environment } from '../environments/environment';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

@Injectable({
    providedIn: 'root'
})
export class FirebaseManagerService {
    private platform = inject(PlatformService);

    public app: FirebaseApp | null = null;
    public analytics: Analytics | null = null;
    public auth: Auth | null = null;
    public firestore: Firestore | null = null;
    public storage: FirebaseStorage | null = null;

    constructor() {
        this.init();
    }

    private init() {
        if (this.platform.isWeb()) {
            try {
                // Initialize Firebase Web SDK ONLY for the Web platform
                this.app = initializeApp(environment.firebase);
                this.auth = getAuth(this.app);
                this.firestore = getFirestore(this.app);
                this.storage = getStorage(this.app);

                // Analytics can throw if blocked by ad-blockers, so safety wrap
                try {
                    this.analytics = getAnalytics(this.app);
                } catch (e) {
                    console.warn("Firebase Analytics could not be initialized on the web", e);
                }

                console.log('[FirebaseManager] Web SDK initialized.');
            } catch (error) {
                console.error('[FirebaseManager] Error initializing Web SDK', error);
            }
        } else {
            console.log(`[FirebaseManager] Skipping Web SDK config. Using Native Capacitor bridges for ${this.platform.getPlatform()}`);
        }
    }
}
