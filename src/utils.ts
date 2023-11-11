import type { ParsedCSSValue } from 'webdriverio'
import isEqual from 'lodash.isequal'

import { executeCommand } from './util/executeCommand.js'
import { wrapExpectedWithArray, updateElementsArray } from './util/elementsUtil.js'
import { enhanceError, enhanceErrorBe, numberError } from './util/formatMessage.js'
import { DEFAULT_OPTIONS } from './constants.js'
import type { WdioElementMaybePromise } from './types.js'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const asymmetricMatcher =
  typeof Symbol === 'function' && Symbol.for
    ? Symbol.for('jest.asymmetricMatcher')
    : 0x13_57_a5

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/en/expect#thisisnot
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

    // wait for condition to be truthy
    try {
        let error
        const start = Date.now()
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (Date.now() - start > wait) {
                throw new Error('timeout')
            }

            error = undefined
            try {
                const result = isNot !== (await condition())
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
    } catch (err) {
        return isNot
    }
}

async function executeCommandBe(
    received: WdioElementMaybePromise,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions
): Promise<{
    pass: boolean
    message: () => string
}> {
    const { isNot, expectation, verb = 'be' } = this

    received = await received
    let el = received
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(
                this,
                el,
                async (element) => ({ result: await command(element) }),
                options
            )
            el = result.el
            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

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
    expected: string | RegExp | ExpectWebdriverIO.PartialMatcher | ExpectWebdriverIO.PartialMatcher,
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
        }
    }

    if (typeof expected === 'object' && '$$typeof' in expected && expected.$$typeof === asymmetricMatcher && expected.asymmetricMatch) {
        const result = expected.asymmetricMatch(actual)
        return {
            value: actual,
            result
        }
    }

    expected = expected as string | RegExp
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

export const compareTextWithArray = (
    actual: string,
    expectedArray: Array<string | RegExp>,
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
        expectedArray = expectedArray.map((item) => (item instanceof RegExp ? item : item.toLowerCase()))
    }

    const textInArray = expectedArray.some((expected) => {
        if (expected instanceof RegExp) {
            return !!actual.match(expected)
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
        result: isEqual(actual, expected),
    }
}

export const compareStyle = async (
    actualEl: WebdriverIO.Element,
    style: { [key: string]: string },
    { ignoreCase = true, trim = false }
) => {
    let result = true
    const actual: any = {}

    for (const key in style) {
        const css: ParsedCSSValue = await actualEl.getCSSProperty(key)

        let actualVal: string = css.value as string
        let expectedVal: string = style[key]

        if (trim) {
            actualVal = actualVal.trim()
            expectedVal = expectedVal.trim()
        }
        if (ignoreCase) {
            actualVal = actualVal.toLowerCase()
            expectedVal = expectedVal.toLowerCase()
        }

        result = result && actualVal === expectedVal
        actual[key] = css.value
    }

    return {
        value: actual,
        result,
    }
}

function aliasFn(
    fn: (...args: any) => void,
    {
        verb,
        expectation,
    }: {
        verb?: string
        expectation?: string
    } = {},
    ...args: any[]
): any {
    this.verb = verb
    this.expectation = expectation
    return fn.apply(this, args)
}

export {
    updateElementsArray,
    wrapExpectedWithArray,
    enhanceError,
    numberError,
    executeCommand,
    executeCommandBe,
    waitUntil,
    compareNumbers,
    aliasFn,
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
