import { printReceived, stringify } from 'jest-matcher-utils'

/**
 * Whether a failure message shows the value that the matcher compared after the actual value: only when the string
 * options changed it, and when both are on one line (Jest shows a multiline value on several lines).
 */
export const isComparedValueShown = (actual: unknown, compared: unknown): compared is string =>
    typeof actual === 'string' && typeof compared === 'string' && compared !== actual && !actual.includes('\n') && !compared.includes('\n')

export const comparedAs = (compared: string): string => ` (compared as ${printReceived(compared)})`

/**
 * The compared value to show for each received string, by its text as Jest prints it (`stringify()`). `actual` and
 * `compared` have the same shape: an array for `$$()`, per-instance values for multi-remote. A received string
 * compared in 2 ways (e.g. with a string and with a RegExp, which has no `ignoreCase` on the value) has `undefined`:
 * its line in the diff cannot tell which one.
 */
const comparedByPrintedValue = (actual: unknown, compared: unknown, found = new Map<string, string | undefined>()) => {
    if (typeof actual === 'string') {
        const printed = stringify(actual)
        const shown = isComparedValueShown(actual, compared) ? compared : undefined
        found.set(printed, found.has(printed) && found.get(printed) !== shown ? undefined : shown)
    } else if (Array.isArray(actual)) {
        actual.forEach((item, index) => comparedByPrintedValue(item, Array.isArray(compared) ? compared[index] : undefined, found))
    } else if (typeof actual === 'object' && actual !== null) {
        const comparedValues: Record<string, unknown> = typeof compared === 'object' && compared !== null ? compared as Record<string, unknown> : {}
        Object.entries(actual).forEach(([name, item]) => comparedByPrintedValue(item, comparedValues[name], found))
    }
    return found
}

/** Whether there is a compared value to show: `compared` is small, while `actual` can be a large property value */
const hasComparedString = (compared: unknown): boolean =>
    typeof compared === 'string'
    || (typeof compared === 'object' && compared !== null && Object.values(compared).some(hasComparedString))

// eslint-disable-next-line no-control-regex -- the color codes of Jest's diff
const COLORS = /\u001b\[[0-9;]*m/g
// A received value in Jest's diff: `+`, the indentation, the value with an optional quoted key, and a comma
const RECEIVED_VALUE_LINE = /^\+ +(.*),$/
const QUOTED_KEY = /^"(?:[^"\\]|\\.)*": /

/**
 * Jest's diff of `$$()` or multi-remote values, with the compared value after each received value that failed, e.g.
 * `+   "  Baz  ", (compared as "baz")`. An element that passed is a common line, and needs no explanation.
 *
 * It reads the text that Jest prints: `test/matchers/comparedAs.test.ts` fails if a Jest upgrade changes that format.
 */
export const withComparedValues = (diff: string, actual: unknown, compared: unknown): string => {
    // A failure message is also built when the assertion passes: do not walk `actual` when there is nothing to show
    if (!hasComparedString(compared)) {
        return diff
    }
    const comparedValues = comparedByPrintedValue(actual, compared)
    if (![...comparedValues.values()].some((value) => value !== undefined)) {
        return diff
    }

    return diff.split('\n').map((line) => {
        const value = RECEIVED_VALUE_LINE.exec(line.replace(COLORS, ''))?.[1]
        if (value === undefined) {
            return line
        }
        const shown = comparedValues.get(value) ?? comparedValues.get(value.replace(QUOTED_KEY, ''))
        return shown === undefined ? line : line + comparedAs(shown)
    }).join('\n')
}
