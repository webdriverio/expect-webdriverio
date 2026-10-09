/**
 * The name of the string options in a failure message, in camel case: the position option (as `compareText` checks them,
 * only one applies), then the options that alter the actual value before the comparison: `trimmed`, `ignoringCase` and
 * `replacing`. E.g. `containingTrimmedIgnoringCase`. It is '' when no option applies, so the expected value is printed as is.
 * - `trimmed`: `trim` is on by default, so it is named only when it changed the actual value (`trimmed: true`), not when
 *   the value has no spaces at the start or the end, or when the value is not known.
 * - `forRegExp`: for a RegExp expected value, the position options do not apply, and `ignoreCase` is the `i` flag of the
 *   RegExp, so only `trimmed` and `replacing` are named.
 * - `asString` is not named: it converts the actual value, it does not change how it is compared.
 */
export const stringOptionsName = (options: ExpectWebdriverIO.StringOptions, { forRegExp = false, trimmed = false } = {}): string => {
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
    if (trimmed && options.trim !== false) {
        words.push('trimmed')
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

/** Whether the default `trim` changes this actual value */
export const isTrimmedByOptions = (actual: unknown, options: ExpectWebdriverIO.StringOptions): boolean =>
    options.trim !== false && typeof actual === 'string' && actual.trim() !== actual
