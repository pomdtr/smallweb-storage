// fix: Type instantiation is excessively deep and possibly infinite error
// ref: https://github.com/supabase/supabase-js/issues/808#issuecomment-2143815626
export type JsonValue<D extends number = 9, DA extends any[] = []> =
    | string
    | number
    | boolean
    | null
    | (D extends DA["length"] ? any
        : { [key: string]: JsonValue<D, [0, ...DA]> | undefined })
    | (D extends DA["length"] ? any : JsonValue<D, [0, ...DA]>[]);

export abstract class SmallwebStorage {
    abstract get(
        key: string,
    ): Promise<Uint8Array | null>;
    abstract set(key: string, value: Uint8Array): Promise<void>;
    abstract delete(key: string): Promise<void>;
    abstract list(): AsyncIterable<string>;

    keys(): Promise<string[]> {
        return Array.fromAsync(this.list());
    }

    async copy(oldKey: string, newKey: string): Promise<void> {
        const bytes = await this.get(oldKey);
        if (!bytes) {
            throw new Error(`Key not found: ${oldKey}`);
        }
        await this.set(newKey, bytes);
    }

    async rename(oldKey: string, newKey: string): Promise<void> {
        await this.copy(oldKey, newKey);
        await this.delete(oldKey);
    }

    async getJson<T extends JsonValue = JsonValue>(
        key: string,
    ): Promise<T | null> {
        const bytes = await this.get(key);
        if (!bytes) {
            return null;
        }
        const text = new TextDecoder().decode(bytes);
        return JSON.parse(text);
    }

    setJson(key: string, value: JsonValue): Promise<void> {
        const text = JSON.stringify(value);
        const bytes = new TextEncoder().encode(text);
        return this.set(key, bytes);
    }

    async getText(key: string): Promise<string | null> {
        const bytes = await this.get(key);
        if (!bytes) {
            return null;
        }
        return new TextDecoder().decode(bytes);
    }

    setText(key: string, value: string): Promise<void> {
        const bytes = new TextEncoder().encode(value);
        return this.set(key, bytes);
    }
}
