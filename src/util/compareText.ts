import { expect } from 'expect'

import type { CompareResult } from './executeCommand.js'
import { MatcherUsageError } from './matcherUsageError.js'
import {
    getStringAsymmetricMatcherValue, isAsymmetricMatcher, isInversedStringContainingMatcher, isInversedStringMatchingMatcher,
    isStringContainingMatcherLike, isStringMatchingMatcherLike,
} from './asymmetricMatcherUtil.js'
import type { StringOptions } from '../publicTypes/options.js'
import type { JasmineAsymmetricMatcher, JasmineStringAsymmetricMatcher, WdioAsymmetricMatcher } from '../publicTypes/expectWebdriverIO.js'

/**
 * One position option only: `containing`, `atStart`, `atEnd` or `atIndex`. Before, `containing` won over the others with
 * no message. A wrong use of the matcher, so a `MatcherUsageError`, which `waitUntil()` throws at once.
 */
export const assertOnePositionOption = ({ containing, atStart, atEnd, atIndex }: StringOptions = {}): void => {
    const positions = Object.entries({ containing, atStart, atEnd, atIndex: atIndex !== undefined }).flatMap(([name, isSet]) => isSet ? [name] : [])
    if (positions.length > 1) {
        const names = `${positions.slice(0, -1).join(', ')} and ${positions.at(-1)}`
        throw new MatcherUsageError(`The string options ${names} cannot be used together: use only one of containing, atStart, atEnd and atIndex`)
    }
}

export const compareText = (
    actual: string,
    expected: string | RegExp | WdioAsymmetricMatcher<string> | JasmineAsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything | null | undefined,
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: StringOptions
): CompareResult<string> => {
    assertOnePositionOption({ containing, atStart, atEnd, atIndex })

    if (typeof actual !== 'string' || expected === null || expected === undefined) {
        return {
            actual,
            success: false,
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (Array.isArray(replace)) {
        actual = replaceActual(replace, actual)
    }

    // a RegExp expected value (bare or wrapped in stringMatching) expresses case-insensitivity via
    // its own `i` flag (added below), so `actual` is left in its original case for it - lowercasing
    // first can corrupt characters with special casing (e.g. Turkish İ expands to two code points
    // via toLowerCase()), silently breaking otherwise-correct matches.
    if (ignoreCase) {
        if (typeof expected === 'string') {
            actual = actual.toLowerCase()
            expected = expected.toLowerCase()
        } else if (expected instanceof RegExp) {
            expected = withIgnoreCaseFlag(expected)
        } else if (isStringContainingMatcherLike(expected)) {
            actual = actual.toLowerCase()
            const sample = getStringAsymmetricMatcherValue(expected).toString().toLocaleLowerCase()
            expected = (isInversedStringContainingMatcher(expected)
                ? expect.not.stringContaining(sample)
                : expect.stringContaining(sample)) as WdioAsymmetricMatcher<string>
        } else if (isStringMatchingMatcherLike(expected)) {
            // stringMatching's sample is regex source regardless of whether it was given as a
            // string or a RegExp instance, so lowercasing it as if it were literal text would
            // corrupt regex escapes (e.g. `\D` -> `\d` flips "non-digit" to "digit"). Build/extend
            // a RegExp and add the `i` flag instead - `actual` stays in its original case, same as
            // the bare RegExp branch above.
            const sample = getStringAsymmetricMatcherValue(expected as WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>)
            const caseInsensitiveSample = withIgnoreCaseFlag(sample instanceof RegExp ? sample : new RegExp(sample))
            expected = (isInversedStringMatchingMatcher(expected)
                ? expect.not.stringMatching(caseInsensitiveSample)
                : expect.stringMatching(caseInsensitiveSample)) as WdioAsymmetricMatcher<string>
        } else {
            actual = actual.toLowerCase()
        }
    }

    if (isAsymmetricMatcher(expected)) {
        const result = expected.asymmetricMatch(actual)
        return {
            actual,
            success: result
        }
    }

    if (expected instanceof RegExp) {
        return {
            actual,
            success: !!actual.match(expected),
        }
    }
    if (containing) {
        return {
            actual,
            success: actual.includes(expected),
        }
    }

    if (atStart) {
        return {
            actual,
            success: actual.startsWith(expected),
        }
    }

    if (atEnd) {
        return {
            actual,
            success: actual.endsWith(expected),
        }
    }

    if (atIndex !== undefined) {
        return {
            actual,
            success: actual.substring(atIndex, actual.length).startsWith(expected),
        }
    }

    return {
        actual,
        success: actual === expected,
    }
}

/**
 * Return an equivalent RegExp carrying the `i` (ignore case) flag.
 *
 * The actual value being compared is generally left untouched when it's matched against a RegExp
 * (see the callers), since a RegExp pattern can't be lowercased without corrupting it (character
 * classes, escapes, etc.) - the case-insensitivity has to be expressed on the pattern itself.
 *
 * Always returns a clone, even when `i` is already set, so matching never mutates a `lastIndex`
 * the caller still holds a reference to. The clone's `lastIndex` is copied from the source - for a
 * sticky (`y`) pattern this is the position the match is anchored to, and `String.prototype.match`
 * honors it, so losing it (it would otherwise reset to 0 on the new instance) silently changes
 * where the match is attempted.
 */
function withIgnoreCaseFlag(expected: RegExp): RegExp {
    const cloned = expected.ignoreCase
        ? new RegExp(expected.source, expected.flags)
        : new RegExp(expected.source, `${expected.flags}i`)
    cloned.lastIndex = expected.lastIndex
    return cloned
}

export function replaceActual(
    replace: [string | RegExp, string | Function] | Array<[string | RegExp, string | Function]>,
    actual: string
) {
    const hasMultipleReplacers = (replace as [string | RegExp, string | Function][]).every((r) =>
        Array.isArray(r)
    )
    const replacers = hasMultipleReplacers
        ? (replace as [string | RegExp, string | Function][])
        : [replace as [string | RegExp, string | Function]]

    if (replacers.some((r) => Array.isArray(r) && r.length !== 2)) {
        throw new Error('Replacers need to have a searchValue and a replaceValue')
    }

    for (const replacer of replacers) {
        const [searchValue, replaceValue] = replacer
        actual = actual.replace(searchValue, replaceValue as string)
    }

    return actual
}
