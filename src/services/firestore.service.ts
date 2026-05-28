import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { FirebaseManagerService } from './firebase.manager';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private platform = inject(PlatformService);
    private fbMgr = inject(FirebaseManagerService);

    async setDocument(path: string, id: string, data: any) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.firestore) throw new Error("Web Firestore not initialized");
            const ref = doc(this.fbMgr.firestore, path, id);
            await setDoc(ref, data);
        } else {
            await FirebaseFirestore.setDocument({
                reference: `${path}/${id}`,
                data: data
            });
        }
    }

    async getDocument(path: string, id: string) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.firestore) throw new Error("Web Firestore not initialized");
            const ref = doc(this.fbMgr.firestore, path, id);
            const snap = await getDoc(ref);
            return snap.exists() ? snap.data() : null;
        } else {
            const snap = await FirebaseFirestore.getDocument({
                reference: `${path}/${id}`
            });
            return snap.snapshot.data;
        }
    }

    async updateDocument(path: string, id: string, data: any) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.firestore) throw new Error("Web Firestore not initialized");
            const ref = doc(this.fbMgr.firestore, path, id);
            await updateDoc(ref, data);
        } else {
            await FirebaseFirestore.updateDocument({
                reference: `${path}/${id}`,
                data: data
            });
        }
    }

    async deleteDocument(path: string, id: string) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.firestore) throw new Error("Web Firestore not initialized");
            const ref = doc(this.fbMgr.firestore, path, id);
            await deleteDoc(ref);
        } else {
            await FirebaseFirestore.deleteDocument({
                reference: `${path}/${id}`
            });
        }
    }
}
