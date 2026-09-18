import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ScanRecord } from './game.service';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private firestore = inject(FirestoreService);

    async pushProfile(uid: string, username: string, points: number) {
        await this.firestore.setDocument('users', uid, {
            points,
            displayName: username,
            role: 'ranger'
        });
    }

    async pushScans(uid: string, scans: ScanRecord[]) {
        if (scans.length === 0) return;
        for (const scan of scans) {
            const snapshot = this.serializeScan(scan);
            await this.firestore.setDocument(`users/${uid}/scans`, scan.id, snapshot);
        }
    }

    async pullProfile(uid: string): Promise<{ points?: number; displayName?: string; role?: string } | null> {
        const data = await this.firestore.getDocument('users', uid);
        return (data as any) || null;
    }

    async pushCommunityScan(scan: ScanRecord, uid: string) {
        await this.firestore.setDocument('community_scans', scan.id, {
            ...this.serializeScan(scan),
            userId: uid
        });
    }

    private serializeScan(scan: ScanRecord) {
        const { imageThumbnail, ...rest } = scan as any;
        const snapshot: any = {
            ...rest,
            timestamp: scan.timestamp ? scan.timestamp.toISOString() : undefined
        };
        this.stripUndefined(snapshot);
        return snapshot;
    }

    private stripUndefined(obj: any) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(obj).forEach((key) => {
            if (obj[key] === undefined) {
                delete obj[key];
            } else if (typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
                this.stripUndefined(obj[key]);
            }
        });
    }
}