import { NotFoundError, StorageError } from "./local_storage.ts";
import { SmallwebStorage } from "../mod.ts";

export type ValtownStorageOptions = {
    token?: string;
    prefix?: string;
    apiUrl?: string;
};

export class ValtownStorage extends SmallwebStorage {
    public token: string;
    public prefix: string;
    public apiUrl: string;

    constructor(options: ValtownStorageOptions = {}) {
        super();
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

    async get(key: string): Promise<Uint8Array | null> {
        const resp = await this.fetch(
            `/v1/blob/${encodeURIComponent(this.fullKey(key))}`,
        );
        if (!resp.ok) {
            if (resp.status == 404) {
                throw new NotFoundError(key);
            }

            throw new StorageError(`Unable to read blob: ${await resp.text()}`);
        }

        return new Uint8Array(await resp.arrayBuffer());
    }

    async set(key: string, value: Uint8Array): Promise<void> {
        const resp = await this.fetch(
            `/v1/blob/${encodeURIComponent(this.fullKey(key))}`,
            {
                method: "POST",
                body: value,
            },
        );

        if (!resp.ok) {
            throw new StorageError(
                `could not create blob: ${await resp.text()}`,
            );
        }
    }

    async delete(key: string): Promise<void> {
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

    async *list(): AsyncIterable<string> {
        const resp = await this.fetch(`/v1/blob`);
        if (!resp.ok) {
            throw new StorageError();
        }

        const entries = await resp.json();
        for (const entry of entries) {
            yield entry.name;
        }
    }
}
