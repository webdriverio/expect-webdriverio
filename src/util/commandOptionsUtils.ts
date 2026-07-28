export const isDefinedPlainObject = (obj: unknown): obj is object => {
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return true
    }
    return false
}
