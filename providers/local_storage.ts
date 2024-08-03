import type { Storage, Value } from "../mod.ts";

export class LocalStorage implements Storage {
    get<T extends Value = Value>(key: string): Promise<T | null> {
        const text = localStorage.getItem(key);
        if (text === null) {
            return Promise.resolve(null);
        }

        return Promise.resolve(JSON.parse(text) as T);
    }

    set(key: string, value: Value): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value));
        return Promise.resolve();
    }

    remove(key: string): Promise<void> {
        localStorage.removeItem(key);
        return Promise.resolve();
    }

    async *list(prefix?: string): AsyncIterator<string> {
        for (const key of Object.keys(localStorage)) {
            if (prefix && !key.startsWith(prefix)) {
                continue;
            }
            yield key;
        }
    }
}
