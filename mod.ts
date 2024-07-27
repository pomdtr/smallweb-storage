export type JsonObject = { [key: string]: JsonValue };

export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | JsonObject;

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

    setJSON(key: string, value: JsonValue): Promise<void> {
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
