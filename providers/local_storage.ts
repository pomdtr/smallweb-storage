import { SmallwebStorage } from "../mod.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";

export class StorageError extends Error {}

export class NotFoundError extends StorageError {
    constructor(key: string) {
        super(`Key not found: ${key}`);
    }
}

export class LocalStorage extends SmallwebStorage {
    get(key: string): Promise<Uint8Array | null> {
        const text = localStorage.getItem(key);
        if (text === null) {
            return Promise.resolve(null);
        }

        const bytes = decodeBase64(text);
        return Promise.resolve(bytes);
    }

    set(key: string, value: Uint8Array): Promise<void> {
        const text = encodeBase64(value);
        localStorage.setItem(key, text);
        return Promise.resolve();
    }

    delete(key: string): Promise<void> {
        localStorage.removeItem(key);
        return Promise.resolve();
    }

    async *list(): AsyncIterable<string> {
        for (const key of Object.keys(localStorage)) {
            yield key;
        }
    }
}
