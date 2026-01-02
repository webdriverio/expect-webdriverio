import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'
import { expect } from 'expect'
import { DEFAULT_OPTIONS } from './constants.js'
import type { WdioElementMaybePromise } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import { executeCommand } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe, numberError } from './util/formatMessage.js'
import { toArray } from './util/multiRemoteUtil.js'

export type CompareResult<A = unknown, E = unknown> = {
    value: A // actual but sometimes modified (e.g. trimmed, lowercased, etc)
    actual: A // actual value as is
    expected: E
    result: boolean // true when actual matches expected
    pass?: boolean // true when condition is met (actual matches expected and isNot=false OR actual does not match expected and isNot=true)
    instance?: string // multiremote instance name if applicable
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

/**
 * Wait for condition to succeed
 * For multiple remotes, all conditions must be met
 * When using negated condition (isNot=true), we wait for all conditions to be true first, then we negate the real value if it takes time to show up.
 * TODO multi-remote support: replace waitUntil in other matchers with this function
 *
 * @param condition function to that should return true when condition is met
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
const waitUntilResult = async <A = unknown, E = unknown>(
    condition: (() => Promise<CompareResult<A, E> | CompareResult<A, E>[]>) | (() => Promise<CompareResult<A, E>>)[],
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {},
): Promise<{ pass: boolean, results: CompareResult<A, E>[] }> => {
    /**
     * Using array algorithm to handle both single and multiple conditions uniformly
     * Technically, this is an o(n3) operation, but practically, we process either a single promise with Array or an Array of promises. Review later if we can simplify and only have an array of promises
     */
    const conditions = toArray(condition)
    // single attempt
    if (wait === 0) {
        const allResults = await Promise.all(conditions.map((condition) => condition().then((results) => toArray(results).map((result) => {
            result.pass = result.result === !isNot
            return result
        }))))

        const flatResults = allResults.flat()
        const pass = flatResults.every(({ pass }) => pass)

        return { pass, results: flatResults }
    }

    const start = Date.now()
    let error: Error | undefined
    const allConditionsResults = conditions.map((condition) : { condition: () => Promise<CompareResult<A, E> | CompareResult<A, E>[]>, results: CompareResult<A, E>[] } => ({
        condition,
        results: [{ value: null as A, actual: null as A, expected: null as E, result: false }],
    }))

    while (Date.now() - start <= wait) {
        try {
            const pendingConditions = allConditionsResults.filter(({ results }) => !results.every((result) => result.result))

            // TODO multi-remote support: handle errors per remote more gracefully, so we report failures and throws if all remotes are in errors (and therefore still throw when not multi-remote)
            await Promise.all(
                pendingConditions.map(async (pendingResult) => {
                    const results = toArray(await pendingResult.condition())
                    pendingResult.results = results
                }),
            )

            error = undefined
            if (allConditionsResults.every(({ results }) => results.every((results) => results.result))) {
                break
            }
        } catch (err) {
            error = err instanceof Error ? err : new Error(String(err))
        }
        await sleep(interval)
    }

    if (error) {
        throw error
    }

    const allResults = allConditionsResults.map(({ condition: _condition, ...rest }) => rest.results).flat().map((result) => {
        result.pass = result.result === !isNot
        return result
    })
    const pass = allResults.every(({ pass }) => pass)

    return { pass, results: allResults }
}

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/expect#thisisnot
 * @param options   wait, interval, etc
 */
const waitUntil = async (
    condition: () => Promise<boolean>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {}
): Promise<boolean> => {
    // single attempt
    if (wait === 0) {
        return await condition()
    }

    let error: Error | undefined

    // wait for condition to be truthy
    try {
        const start = Date.now()
        while (true) {
            if (Date.now() - start > wait) {
                throw new Error('timeout')
            }

            try {
                const result = isNot !== (await condition())
                error = undefined
                if (result) {
                    break
                }
                await sleep(interval)
            } catch (err) {
                error = err
                await sleep(interval)
            }
        }

        if (error) {
            throw error
        }

        return !isNot
    } catch {
        if (error) {
            throw error
        }

        return isNot
    }
}

async function executeCommandBe(
    received: WdioElementMaybePromise,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions
): ExpectWebdriverIO.AsyncAssertionResult {
    const { isNot, expectation, verb = 'be' } = this

    let el = await received?.getElement()
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(
                this,
                el,
                async (element) => ({ result: await command(element as WebdriverIO.Element) }),
                options
            )
            el = result.el as WebdriverIO.Element
            return result.success
        },
        isNot,
        options
    )

    const message = enhanceErrorBe(el, pass, this, verb, expectation, options)

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
): CompareResult<string, string | RegExp | WdioAsymmetricMatcher<string>> => {
    const compareResult: CompareResult<string, string | RegExp | WdioAsymmetricMatcher<string>> = { value: actual, actual, expected, result: false }
    let value = actual
    let expectedValue = expected

    if (typeof actual !== 'string') {
        return compareResult
    }

    if (trim) {
        value = value.trim()
    }
    if (Array.isArray(replace)) {
        value = replaceActual(replace, value)
    }
    if (ignoreCase) {
        value = value.toLowerCase()
        if (typeof expectedValue === 'string') {
            expectedValue = expectedValue.toLowerCase()
        } else if (isStringContainingMatcher(expectedValue)) {
            expectedValue = (
                expectedValue.toString() === 'StringContaining'
                    ? expect.stringContaining(expectedValue.sample?.toString().toLowerCase())
                    : expect.not.stringContaining(expectedValue.sample?.toString().toLowerCase())
            ) as WdioAsymmetricMatcher<string>
        }
    }

    if (isAsymmetricMatcher(expectedValue)) {
        const result = expectedValue.asymmetricMatch(value)
        return {
            ...compareResult,
            value,
            result,
        }
    }

    if (expectedValue instanceof RegExp) {
        return {
            ...compareResult,
            value,
            result: !!value.match(expectedValue),
        }
    }
    if (containing) {
        return {
            ...compareResult,
            value,
            result: value.includes(expectedValue),
        }
    }

    if (atStart) {
        return {
            ...compareResult,
            value: value,
            result: value.startsWith(expectedValue),
        }
    }

    if (atEnd) {
        return {
            ...compareResult,
            value,
            result: value.endsWith(expectedValue),
        }
    }

    if (atIndex) {
        return {
            ...compareResult,
            value,
            result: value.substring(atIndex, value.length).startsWith(expectedValue),
        }
    }

    return {
        ...compareResult,
        value,
        result: value === expectedValue,
    }
}

export const compareTextWithArray = (
    actual: string,
    expectedArray: Array<string | RegExp | WdioAsymmetricMatcher<string>>,
    {
        ignoreCase = false,
        trim = false,
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
                return (
                    item.toString() === 'StringContaining'
                        ? expect.stringContaining(item.sample?.toString().toLowerCase())
                        : expect.not.stringContaining(item.sample?.toString().toLowerCase())
                ) as WdioAsymmetricMatcher<string>
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

export const compareObject = (actual: object | number, expected: string | number | object) => {
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
        } else if (replace) {
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

function aliasFn(
    fn: (...args: unknown[]) => void,
    { verb, expectation }: ExpectWebdriverIO.MatcherContext = {},
    ...args: unknown[]
): unknown {
    this.verb = verb
    this.expectation = expectation
    return fn.apply(this, args)
}

export {
    aliasFn, compareNumbers, enhanceError, executeCommand,
    executeCommandBe, numberError, waitUntil, waitUntilResult, wrapExpectedWithArray
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
