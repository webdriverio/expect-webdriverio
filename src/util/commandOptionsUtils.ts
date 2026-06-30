const STRING_OPTIONS_ALLOWED_KEY_LIST = new Set([
    // StringOptions
    'ignoreCase',
    'trim',
    'containing',
    'atStart',
    'atEnd',
    'atIndex',
    'replace',
    'asString',
    // CommandOptions
    'message',
    // DefaultOptions
    'wait',
    'interval',
    'beforeAssertion',
    'afterAssertion'
])

export function isStringOptions(obj: unknown): obj is ExpectWebdriverIO.StringOptions {
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

    // Condition A: It is a completely empty object -> {}
    if (objKeys.length === 0) {
        return true
    }

    return objKeys.every(key => STRING_OPTIONS_ALLOWED_KEY_LIST.has(key))
}
