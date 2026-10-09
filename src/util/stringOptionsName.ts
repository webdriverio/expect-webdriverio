/**
 * The name of the non-default string options in a failure message, in camel case: the position option (as `compareText`
 * checks them, only one applies), then the modifiers. E.g. `containingIgnoringCase`, `matchingAtIndex<2>Untrimmed`.
 * It is '' with the default options only, so the expected value is printed as is.
 * - `forRegExp`: for a RegExp expected value, the position options do not apply, and `ignoreCase` is the `i` flag of the
 *   RegExp, so only `trim: false` and `replace` are named.
 * - `asString` is not named: it converts the actual value, it does not change how it is compared.
 */
export const stringOptionsName = (options: ExpectWebdriverIO.StringOptions, { forRegExp = false } = {}): string => {
    const words: string[] = []
    if (!forRegExp) {
        if (options.containing) {
            words.push('containing')
        } else if (options.atStart) {
            words.push('startingWith')
        } else if (options.atEnd) {
            words.push('endingWith')
        } else if (typeof options.atIndex === 'number') {
            words.push(`matchingAtIndex<${options.atIndex}>`)
        }
    }
    if (options.trim === false) {
        words.push('untrimmed')
    }
    if (options.ignoreCase && !forRegExp) {
        words.push('ignoringCase')
    }
    // The replacements are not listed: they can be functions
    if (Array.isArray(options.replace) && options.replace.length > 0) {
        words.push('replacing')
    }
    return words.map((word, index) => index === 0 ? word : word[0].toUpperCase() + word.slice(1)).join('')
}
