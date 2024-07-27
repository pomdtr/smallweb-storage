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

    getJson<T = any>(key: string): Promise<T | null> {
        const text = localStorage.getItem(key);
        if (text === null) {
            return Promise.resolve(null);
        }

        return Promise.resolve(JSON.parse(text));
    }

    setJSON(key: string, value: any): Promise<void> {
        const text = JSON.stringify(value);
        localStorage.setItem(key, text);
        return Promise.resolve();
    }

    getText(key: string): Promise<string | null> {
        const text = localStorage.getItem(key);
        if (text === null) {
            return Promise.resolve(null);
        }

        return Promise.resolve(text);
    }

    setText(key: string, value: string): Promise<void> {
        localStorage.setItem(key, value);
        return Promise.resolve();
    }

    async *list(): AsyncIterable<string> {
        for (const key of Object.keys(localStorage)) {
            yield key;
        }
    }
}
