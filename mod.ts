export type Value = string | number | boolean;
export interface Storage {
    get<T extends Value = Value>(
        key: string,
    ): Promise<T | null>;
    set(key: string, value: Value): Promise<void>;
    remove(key: string): Promise<void>;
    list(prefix?: string): AsyncIterator<string>;
}
