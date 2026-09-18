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
            // For native, convert the device URI to a blob via fetch and reuse uploadBase64
            const response = await fetch(file.path || file.webkitRelativePath, { headers: { Range: "bytes=0-" } });
            const blob = await response.blob();
            return await this.uploadBase64(path, await this.blobToBase64(blob), file.type);
        }
    }

    async uploadUri(path: string, fileUri: string, contentType: string = 'image/jpeg') {
        if (this.platform.isWeb()) {
            // On web a URI is usually an object URL or blob URL
            const response = await fetch(fileUri);
            const blob = await response.blob();
            return await this.uploadBase64(path, await this.blobToBase64(blob), contentType);
        } else {
            const result = await FirebaseStorage.uploadFile({ path, fileUri, contentType });
            return result.downloadUrl;
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

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const comma = result.indexOf(',');
                resolve(comma >= 0 ? result.slice(comma + 1) : result);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }
}
