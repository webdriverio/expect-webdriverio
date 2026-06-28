export function isStringOptions(obj: unknown): obj is ExpectWebdriverIO.StringOptions {
    if (obj === null ||
        obj === undefined ||
        typeof obj !== 'object' ||
        obj instanceof RegExp ||
        Array.isArray(obj) ||
        'asymmetricMatch' in obj
    ) {
        return false
    }

    // 3. Extract object keys
    const objKeys = Object.keys(obj)

    // Condition A: It is a completely empty object -> {}
    if (objKeys.length === 0) {
        return true
    }

    // 4. Combined whitelist of all optional properties from the interfaces
    const allowedKeys = new Set([
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

    // Condition B: At least one key in the object exists in our whitelist
    return objKeys.some(key => allowedKeys.has(key))
}
