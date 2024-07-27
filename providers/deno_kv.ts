import { SmallwebStorage } from "../mod.ts";

const kv = await Deno.openKv();

export type KvStorageOptions = {
    prefix?: string[];
};

export class KvStorage extends SmallwebStorage {
    public prefix: string[];
    constructor(options: KvStorageOptions = {}) {
        super();
        this.prefix = options.prefix || [];
    }

    fullKey(key: string): string[] {
        return [...this.prefix, key];
    }

    async get(key: string): Promise<Uint8Array | null> {
        const res = await kv.get<Uint8Array>(this.fullKey(key));
        return res.value;
    }

    async set(key: string, value: Uint8Array): Promise<void> {
        await kv.set(this.fullKey(key), value);
    }

    async delete(key: string): Promise<void> {
        await kv.delete(this.fullKey(key));
    }

    async setJSON(key: string, value: any): Promise<void> {
        await kv.set(this.fullKey(key), value);
    }

    async getJson<T = any>(
        key: string,
    ): Promise<T | null> {
        const res = await kv.get<T>(this.fullKey(key));
        return res.value;
    }

    async setText(key: string, value: string): Promise<void> {
        await kv.set(this.fullKey(key), value);
    }

    async getText(key: string): Promise<string | null> {
        const res = await kv.get<string>(this.fullKey(key));
        return res.value;
    }

    async *list(): AsyncIterable<string> {
        for await (
            const entry of kv.list({
                prefix: this.prefix,
            })
        ) {
            if (entry.key.length === 1) {
                yield entry.key[0].toString();
            }

            if (entry.key.length === 2) {
                yield entry.key[1].toString();
            }

            throw new Error("Unexpected key length");
        }
    }
}
