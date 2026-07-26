const COMMAND_OPTIONS_ALLOWED_KEY_LIST = new Set([
    // CommandOptions
    'message',
    // DefaultOptions
    'wait',
    'interval',
    'beforeAssertion',
    'afterAssertion',
    'featureFlags',
])

export const isStrictlyCommandOptions = (obj: unknown): obj is ExpectWebdriverIO.CommandOptions => {
    if (obj === null ||
        obj === undefined ||
        typeof obj !== 'object' ||
        obj instanceof RegExp ||
        Array.isArray(obj) ||
        'asymmetricMatch' in obj ||
        Object.prototype.toString.call(obj) !== '[object Object]' // This instantly filters out null, primitives, Arrays, Dates, RegExps, Maps, Sets, etc.
    ) {
        return false
    }

    const objKeys = Object.keys(obj)

    if (objKeys.length === 0) {
        return false
    }

    return objKeys.every(key => COMMAND_OPTIONS_ALLOWED_KEY_LIST.has(key))
}

export const isDefinedObject = (obj: unknown): obj is object => {
    if (typeof obj === 'object' && obj !== null) {
        return true
    }
    return false
}
