export const isString = (value: unknown): value is string => typeof value === 'string'

export const toJsonString = (value: unknown): string => {
    if (isString(value)) {
        return value
    }

    let stringifiedValue: string | undefined = undefined
    try {
        stringifiedValue = JSON.stringify(value)
    } catch {
        stringifiedValue = undefined
    }

    return isString(stringifiedValue) ? stringifiedValue : String(value)
}
