import type { Storage, Value } from "../mod.ts";

export type ValtownStorageOptions = {
    token?: string;
    prefix?: string;
    apiUrl?: string;
};

export class StorageError extends Error {}

export class ValtownStorage implements Storage {
    public token: string;
    public prefix: string;
    public apiUrl: string;

    constructor(options: ValtownStorageOptions = {}) {
        this.token = options.token || Deno.env.get("valtown") || "";
        this.apiUrl = options.apiUrl || "https://api.val.town/";
        this.prefix = options.prefix || "";
    }

    fetch(path: string, init?: RequestInit): Promise<Response> {
        if (!this.token) {
            throw new StorageError("token not set");
        }

        return fetch(`${this.apiUrl}${path}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            ...init,
        });
    }

    fullKey(key: string): string {
        if (!this.prefix) {
            return key;
        }
        return `${this.prefix}${key}`;
    }

    async get<T extends Value = Value>(key: string): Promise<T | null> {
        const resp = await this.fetch(
            `/v1/blob/${encodeURIComponent(this.fullKey(key))}`,
        );
        if (!resp.ok) {
            if (resp.status == 404) {
                return null;
            }

            throw new StorageError(`Unable to read blob: ${await resp.text()}`);
        }

        return await resp.json() as T;
    }

    async set(key: string, value: Value): Promise<void> {
        const resp = await this.fetch(
            `/v1/blob/${encodeURIComponent(this.fullKey(key))}`,
            {
                method: "POST",
                body: JSON.stringify(value),
            },
        );

        if (!resp.ok) {
            throw new StorageError(
                `could not create blob: ${await resp.text()}`,
            );
        }
    }

    async remove(key: string): Promise<void> {
        const resp = await this.fetch(
            `/v1/blob/${encodeURIComponent(this.fullKey(key))}`,
            {
                method: "DELETE",
            },
        );

        if (!resp.ok) {
            throw new StorageError(
                `Unable to delete blob: ${await resp.text()}`,
            );
        }
    }

    async *list(prefix?: string): AsyncIterator<string> {
        const resp = await this.fetch(
            `/v1/blob?prefix=${encodeURIComponent(this.prefix)}`,
        );
        if (!resp.ok) {
            throw new StorageError();
        }

        const entries = await resp.json();
        for (const entry of entries) {
            if (prefix && !entry.name.startsWith(prefix)) {
                continue;
            }
            yield entry.name;
        }
    }
}
