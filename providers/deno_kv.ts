import type { Storage, Value } from "../mod.ts";

const kv = await Deno.openKv();

export type KvStorageOptions = {
    prefix?: string[];
};

export class KvStorage implements Storage {
    public prefix: string[];

    constructor(options: KvStorageOptions = {}) {
        this.prefix = options.prefix || [];
    }

    fullKey(key: string): string[] {
        return [...this.prefix, key];
    }

    async get<T extends Value = Value>(
        key: string,
    ): Promise<T | null> {
        const res = await kv.get<T>(this.fullKey(key));
        return res.value;
    }

    async set(key: string, value: Value): Promise<void> {
        await kv.set(this.fullKey(key), value);
    }

    async remove(key: string): Promise<void> {
        await kv.delete(this.fullKey(key));
    }

    async *list(prefix?: string): AsyncIterator<string> {
        for await (
            const entry of kv.list({
                prefix: this.prefix,
            })
        ) {
            if (entry.key.length !== this.prefix.length + 1) {
                continue;
            }

            const key = entry.key[entry.key.length - 1] as string;
            if (prefix && !key.startsWith(prefix)) {
                continue;
            }

            yield key;
        }
    }
}
