import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'

import { expect } from 'expect'

import type { WdioElementOrArrayMaybePromise, WdioElements } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import { executeCommand } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe } from './util/formatMessage.js'
import { waitUntil } from './util/waitUntil.js'
import { DEFAULT_OPTIONS } from './constants.js'

const asymmetricMatcher =
    typeof Symbol === 'function' && Symbol.for
        ? Symbol.for('jest.asymmetricMatcher')
        : 0x13_57_a5

export function isAsymmetricMatcher(expected: unknown): expected is WdioAsymmetricMatcher<unknown> {
    return (
        typeof expected === 'object' &&
        expected &&
        '$$typeof' in expected &&
        'asymmetricMatch' in expected &&
        expected.$$typeof === asymmetricMatcher &&
        Boolean(expected.asymmetricMatch)
    ) as boolean
}

function isStringContainingMatcher(expected: unknown): expected is WdioAsymmetricMatcher<unknown> {
    return isAsymmetricMatcher(expected) && ['StringContaining', 'StringNotContaining'].includes(expected.toString())
}

async function executeCommandBe(
    nonAwaitedElements: WdioElementOrArrayMaybePromise | undefined,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions
): ExpectWebdriverIO.AsyncAssertionResult {
    const { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = options

    let awaitedElements: WdioElements | WebdriverIO.Element | undefined
    let allResults: boolean[] = []
    const pass = await waitUntil(
        async () => {
            const  { elementOrArray, success, results } = await executeCommand(
                nonAwaitedElements,
                async (element) => ({ result: await command(element) })
            )

            awaitedElements = elementOrArray
            allResults = results

            return { success, results }
        },
        this.isNot,
        { wait, interval }
    )

    const  { verb = 'be' } = this
    const message = enhanceErrorBe(awaitedElements, allResults, { ...this, verb }, options)

    return {
        pass,
        message: () => message,
    }
}

const compareNumbers = (actual: number, options: ExpectWebdriverIO.NumberOptions = {}): boolean => {
    // Equals case
    if (typeof options.eq === 'number') {
        return actual === options.eq
    }

    // Greater than or equal AND less than or equal case
    if (typeof options.gte === 'number' && typeof options.lte === 'number') {
        return actual >= options.gte && actual <= options.lte
    }

    // Greater than or equal case
    if (typeof options.gte === 'number') {
        return actual >= options.gte
    }

    // Less than or equal case
    if (typeof options.lte === 'number') {
        return actual <= options.lte
    }

    return false
}

export const compareText = (
    actual: string,
    expected: string | RegExp | WdioAsymmetricMatcher<string>,
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false,
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (Array.isArray(replace)) {
        actual = replaceActual(replace, actual)
    }
    if (ignoreCase) {
        actual = actual.toLowerCase()
        if (typeof expected === 'string') {
            expected = expected.toLowerCase()
        } else if (isStringContainingMatcher(expected)) {
            expected = (expected.toString() === 'StringContaining'
                ? expect.stringContaining(expected.sample?.toString().toLowerCase())
                : expect.not.stringContaining(expected.sample?.toString().toLowerCase())) as WdioAsymmetricMatcher<string>
        }
    }

    if (isAsymmetricMatcher(expected)) {
        const result = expected.asymmetricMatch(actual)
        return {
            value: actual,
            result
        }
    }

    if (expected instanceof RegExp) {
        return {
            value: actual,
            result: !!actual.match(expected),
        }
    }
    if (containing) {
        return {
            value: actual,
            result: actual.includes(expected),
        }
    }

    if (atStart) {
        return {
            value: actual,
            result: actual.startsWith(expected),
        }
    }

    if (atEnd) {
        return {
            value: actual,
            result: actual.endsWith(expected),
        }
    }

    if (atIndex) {
        return {
            value: actual,
            result: actual.substring(atIndex, actual.length).startsWith(expected),
        }
    }

    return {
        value: actual,
        result: actual === expected,
    }
}

/**
 * Compare actual text with array of expected texts in a non-strict way
 * if the actual text matches with any of the expected texts, it returns true
 *
 * @param actual
 * @param expectedArray
 * @param param2
 * @returns
 */
export const compareTextWithArray = (
    actual: string,
    expectedArray: Array<string | RegExp | WdioAsymmetricMatcher<string>>,
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false,
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (Array.isArray(replace)) {
        actual = replaceActual(replace, actual)
    }
    if (ignoreCase) {
        actual = actual.toLowerCase()
        expectedArray = expectedArray.map((item) => {
            if (typeof item === 'string') {
                return item.toLowerCase()
            }
            if (isStringContainingMatcher(item)) {
                return (item.toString() === 'StringContaining'
                    ? expect.stringContaining(item.sample?.toString().toLowerCase())
                    : expect.not.stringContaining(item.sample?.toString().toLowerCase())) as WdioAsymmetricMatcher<string>
            }
            return item
        })
    }

    const textInArray = expectedArray.some((expected) => {
        if (expected instanceof RegExp) {
            return !!actual.match(expected)
        }
        if (isAsymmetricMatcher(expected)) {
            return expected.asymmetricMatch(actual)
        }
        if (containing) {
            return actual.includes(expected)
        }
        if (atStart) {
            return actual.startsWith(expected)
        }
        if (atEnd) {
            return actual.endsWith(expected)
        }
        if (atIndex) {
            return actual.substring(atIndex, actual.length).startsWith(expected)
        }
        return actual === expected
    })
    return {
        value: actual,
        result: textInArray,
    }
}

export const compareObject = <T>(actual: T, expected: unknown) => {
    if (typeof actual !== 'object' || Array.isArray(actual)) {
        return {
            value: actual,
            result: false,
        }
    }

    return {
        value: actual,
        result: deepEql(actual, expected),
    }
}

export const compareStyle = async (
    actualEl: WebdriverIO.Element,
    style: { [key: string]: string },
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
) => {
    let result = true
    const actual: Record<string, string | undefined> = {}

    for (const key in style) {
        const css: ParsedCSSValue = await actualEl.getCSSProperty(key)

        let actualVal: string = String(css.value || '')
        let expectedVal: string = style[key]

        if (trim) {
            actualVal = actualVal.trim()
            expectedVal = expectedVal.trim()
        }
        if (ignoreCase) {
            actualVal = actualVal.toLowerCase()
            expectedVal = expectedVal.toLowerCase()
        }

        if (containing) {
            result = actualVal.includes(expectedVal)
            actual[key] = actualVal
        } else if (atStart) {
            result = actualVal.startsWith(expectedVal)
            actual[key] = actualVal
        } else if (atEnd) {
            result = actualVal.endsWith(expectedVal)
            actual[key] = actualVal
        } else if (atIndex) {
            result = actualVal.substring(atIndex, actualVal.length).startsWith(expectedVal)
            actual[key] = actualVal
        } else if (replace){
            const replacedActual = replaceActual(replace, actualVal)
            result = replacedActual === expectedVal
            actual[key] = replacedActual
        } else {
            result = result && actualVal === expectedVal
            actual[key] = css.value
        }
    }

    return {
        value: actual,
        result,
    }
}

export {
    compareNumbers, enhanceError,
    executeCommandBe, waitUntil, wrapExpectedWithArray
}

function replaceActual(
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
