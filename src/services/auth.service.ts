import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { FirebaseManagerService } from './firebase.manager';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signOut,
    deleteUser
} from 'firebase/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private platform = inject(PlatformService);
    private fbMgr = inject(FirebaseManagerService);

    async loginWithEmail(email: string, pass: string) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.auth) throw new Error("Web Auth not initialized");
            const cred = await signInWithEmailAndPassword(this.fbMgr.auth, email, pass);
            return cred.user;
        } else {
            const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password: pass });
            return result.user;
        }
    }

    async signUpWithEmail(email: string, pass: string) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.auth) throw new Error("Web Auth not initialized");
            const cred = await createUserWithEmailAndPassword(this.fbMgr.auth, email, pass);
            return cred.user;
        } else {
            const result = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password: pass });
            return result.user;
        }
    }

    async loginWithGoogle() {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.auth) throw new Error("Web Auth not initialized");
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(this.fbMgr.auth, provider);
            return cred.user;
        } else {
            const result = await FirebaseAuthentication.signInWithGoogle();
            return result.user;
        }
    }

    async logout() {
        if (this.platform.isWeb()) {
            if (this.fbMgr.auth) await signOut(this.fbMgr.auth);
        } else {
            await FirebaseAuthentication.signOut();
        }
    }

    async getCurrentUser() {
        if (this.platform.isWeb()) {
            return this.fbMgr.auth?.currentUser || null;
        } else {
            const result = await FirebaseAuthentication.getCurrentUser();
            return result.user || null;
        }
    }

    async deleteAccount() {
        const user = await this.getCurrentUser();
        if (!user) throw new Error("No user is signed in");
        
        if (this.platform.isWeb()) {
            if (this.fbMgr.auth && this.fbMgr.auth.currentUser) {
                await deleteUser(this.fbMgr.auth.currentUser);
            }
        } else {
            await FirebaseAuthentication.deleteUser();
        }
    }
}
