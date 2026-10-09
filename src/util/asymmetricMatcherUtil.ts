// Leaf module: it must not import other modules of `src/`, so that every module can import it without a cycle

export function isJasmineStringAsymmetricMatcher<T>(expected: unknown): expected is JasmineAsymmetricMatcher<T> {
    return isAsymmetricMatcher(expected) && !('toAsymmetricMatcher' in expected) && 'jasmineToString' in expected && typeof expected.jasmineToString === 'function'
}

export function isAsymmetricMatcher<T>(expected: unknown): expected is WdioAsymmetricMatcher<T> | JasmineAsymmetricMatcher<T> | ExpectWebdriverIO.PartialMatcherAnything {
    return (
        typeof expected === 'object' &&
        !!expected &&
        'asymmetricMatch' in expected &&
        !!expected.asymmetricMatch
    )
}

/** Identify collection subset matchers by their public Jest/Jasmine display protocol. */
export function isArrayContainingMatcher(expected: unknown): expected is AsymmetricMatcher<unknown[]> {
    if (!isAsymmetricMatcher(expected) || typeof expected.asymmetricMatch !== 'function') {
        return false
    }
    if (typeof expected.toString === 'function' && /^Array(Not)?Containing$/.test(expected.toString())) {
        return true
    }
    if ('jasmineToString' in expected && typeof expected.jasmineToString === 'function') {
        // Jasmine's formatter accepts a pretty-printer argument; its contents are irrelevant here.
        const description = expected.jasmineToString(() => '')
        return description === '<jasmine.arrayContaining()>'
    }
    return false
}

/**
 * Whether the expected value is a matcher for a whole list, not for one value: `arrayContaining` (also with `.not`, and
 * Jasmine's), Jasmine's `arrayWithExactContents` and `expect.arrayOf` (also with `.not`).
 * On `$$()`, the matchers that support it compare the values of all the elements with it at once.
 */
export function isListMatcher(expected: unknown): expected is AsymmetricMatcher<unknown[]> {
    if (isArrayContainingMatcher(expected)) {
        return true
    }
    if (!isAsymmetricMatcher(expected) || typeof expected.asymmetricMatch !== 'function') {
        return false
    }
    if (typeof expected.toString === 'function' && /^(Not)?ArrayOf$/.test(expected.toString())) {
        return true
    }
    if ('jasmineToString' in expected && typeof expected.jasmineToString === 'function') {
        // Jasmine's formatter accepts a pretty-printer argument; its contents are irrelevant here.
        return expected.jasmineToString(() => '') === '<jasmine.arrayWithExactContents()>'
    }
    return false
}

export function isStringContainingMatcherLike(expected: unknown): expected is WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string> {
    return !!expected && expected.constructor.name === 'StringContaining'
}

/**
 * Detect `not.stringContaining` matcher. Jasmine does not have an inverse stringContaining matcher.
 */
export function isInversedStringContainingMatcher(expected: unknown): expected is WdioAsymmetricMatcher<string> {
    return isStringContainingMatcherLike(expected) && (expected as WdioAsymmetricMatcher<string>).inverse === true
}

export function isStringMatchingMatcherLike(expected: unknown): expected is WdioAsymmetricMatcher<string | RegExp> | JasmineStringMatchingAsymmetricMatcher<string | RegExp> {
    return !!expected && expected.constructor.name === 'StringMatching'
}

/**
 * Detect `not.stringMatching` matcher. Jasmine does not have an inverse stringMatching matcher.
 */
export function isInversedStringMatchingMatcher(expected: unknown): expected is WdioAsymmetricMatcher<string | RegExp> {
    return isStringMatchingMatcherLike(expected) && (expected as WdioAsymmetricMatcher<string | RegExp>).inverse === true
}

export function getStringAsymmetricMatcherValue(
    expected: WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>
): string | RegExp {
    if ('expected' in expected) {
        return expected.expected // Jasmine string containing asymmetric matcher
    } else if ('regexp' in expected) {
        return expected.regexp // Jasmine string matching asymmetric matcher
    } else if ('sample' in expected) {
        return expected.sample // WdioAsymmetricMatcher
    }
    throw new Error(`Could not extract value from asymmetric matcher: ${expected}. Please report this issue to the expect-webdriverio maintainers.`)
}

export function getAsymmetricMatcherValue<T>(
    expected: AsymmetricMatcher<T> | ExpectWebdriverIO.PartialMatcherAnything | JasmineAsymmetricMatcher<T>
): string | RegExp | T | undefined {
    if ('expected' in expected) {
        return expected.expected // Jasmine string containing asymmetric matcher
    } else if ('expectedObject' in expected) {
        return expected.expectedObject // Jasmine any asymmetric matcher
    } else if ('regexp' in expected) {
        return expected.regexp // Jasmine string matching asymmetric matcher
    } else if ('sample' in expected) {
        return expected.sample // WdioAsymmetricMatcher
    }

    // Jasmine anything, truthy, falsy, empty, notEmpty asymmetric matchers do not have a sample or expected value. So cannot throw an error here. Return undefined to indicate that there is no value to extract.
    return undefined
}
