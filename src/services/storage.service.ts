import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { FirebaseManagerService } from './firebase.manager';
import { FirebaseStorage } from '@capacitor-firebase/storage';
import {
    ref,
    uploadBytes,
    uploadString,
    getDownloadURL
} from 'firebase/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private platform = inject(PlatformService);
    private fbMgr = inject(FirebaseManagerService);

    async uploadFile(path: string, file: File) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.storage) throw new Error("Web Storage not initialized");
            const storageRef = ref(this.fbMgr.storage, path);
            const result = await uploadBytes(storageRef, file);
            return await getDownloadURL(result.ref);
        } else {
            // NOTE: For Native file path requires translating a local device URI to bytes, 
            // or directly uploading the uri (if supported by native capacitor plugins)
            // Usually requires read permissions depending on iOS/Android implementation
            throw new Error("uploadFile Native Implementation Requires Base64 or URI Upload Method");
        }
    }

    async uploadBase64(path: string, base64Data: string, contentType: string = 'image/jpeg') {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.storage) throw new Error("Web Storage not initialized");
            const storageRef = ref(this.fbMgr.storage, path);
            const result = await uploadString(storageRef, base64Data, 'base64', { contentType });
            return await getDownloadURL(result.ref);
        } else {
            // Capacitor Storage Upload requires uri or base64. 
            // NOTE: In capawesome/capacitor-firebase, uploadFile is used for local URIs
            // Base64 upload isn't natively supported natively by simple `uploadFile` directly via capacitor-firebase
            // without writing to a temp local file first or providing a valid URL scheme
            throw new Error("Base64 direct upload on native typically requires local file write first. See plugin docs.");
        }
    }

    async getUrl(path: string) {
        if (this.platform.isWeb()) {
            if (!this.fbMgr.storage) throw new Error("Web Storage not initialized");
            const storageRef = ref(this.fbMgr.storage, path);
            return await getDownloadURL(storageRef);
        } else {
            const result = await FirebaseStorage.getDownloadUrl({ path });
            return result.downloadUrl;
        }
    }
}
