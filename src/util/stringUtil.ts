export const isString = (value: unknown): value is string => typeof value === 'string'

export const toJsonString = (value: unknown): string => {
    if (isString(value)) {
        return value
    }
    try {
        return JSON.stringify(value)
    } catch {
        return String(value)
    }
}
