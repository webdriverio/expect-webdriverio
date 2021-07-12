import { getConfig } from './options'

import { executeCommand } from './util/executeCommand'
import { wrapExpectedWithArray, updateElementsArray } from './util/elementsUtil'
import { enhanceError, enhanceErrorBe, numberError } from './util/formatMessage'
import { getContext } from './util/expectAdapter'
import { ParsedCSSValue } from 'webdriverio'

const config = getConfig()
const { options: DEFAULT_OPTIONS } = config

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/en/expect#thisisnot
 * @param options   wait, interval, etc
 */
const waitUntil = async (condition: () => Promise<boolean>, isNot = false, {
    wait = DEFAULT_OPTIONS.wait,
    interval = DEFAULT_OPTIONS.interval } = {},
): Promise<boolean> => {
    // single attempt
    if (wait === 0) {
        return isNot ? !(await condition()) : await condition()
    }

    // wait for condition to be truthy
    try {
        let error
        await browser.waitUntil(async () => {
            error = undefined
            try {
                return isNot ? !(await condition()) : await condition()
            } catch (err) {
                error = err
                return false
            }
        }, {
            timeout: wait,
            interval
        })

        if (error) {
            throw error
        }

        // condition was fufilled after wait
        return true
    } catch (err) {
        // condition was not fufilled after wait
        return false
    }
}

async function executeCommandBe(
    received: WdioElementMaybePromise,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions
): Promise<{
    pass: boolean,
    message: () => string
}> {
    const { isNot, expectation, verb = 'be' } = this

    received = await received
    let el = received
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this,
            el,
            async element => ({ result: await command(element) }), options)
        el = result.el
        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const message = enhanceErrorBe(el, pass, this, verb, expectation, options)

    return {
        pass,
        message: () => message
    }
}

const compareNumbers = (actual: number, options: ExpectWebdriverIO.NumberOptions = {}): boolean => {
    // Equals case
    if (typeof options.eq == 'number') { 
        return actual == options.eq
    }

    // Greater than or equal AND less than or equal case
    if (typeof options.gte == 'number' && typeof options.lte == 'number' ) { 
        return actual >= options.gte && actual <= options.lte 
    }

    // Greater than or equal case
    if (typeof options.gte == 'number') { 
        return actual >= options.gte 
    }
    
    // Less than or equal case
    if (typeof options.lte == 'number') { 
        return actual <= options.lte 
    }

    return false
}

export const compareText = (actual: string, expected: string, { ignoreCase = false, trim = true, containing = false }) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (ignoreCase) {
        actual = actual.toLowerCase()
        expected = expected.toLowerCase()
    }
    if (containing) {
        return {
            value: actual,
            result: actual.includes(expected)
        }
    }
    return {
        value: actual,
        result: actual === expected
    }
}

export const compareTextWithArray = (actual: string, expectedArray: Array<string>, { ignoreCase = false, trim = false, containing = false }) => {
    if (typeof actual !== 'string') {
        return {
            value: actual,
            result: false
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (ignoreCase) {
        actual = actual.toLowerCase()
        expectedArray = expectedArray.map(item => item.toLowerCase())
    }
    if (containing) {
        const textInArray = expectedArray.some((t) => actual.includes(t))
        return {
            value: actual,
            result: textInArray
        }
    }
    return {
        value: actual,
        result: expectedArray.includes(actual)
    }
}

export const compareStyle = async (actualEl: WebdriverIO.Element, style: { [key: string]: string; }, { ignoreCase = true, trim = false }) => {
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
        result
    }
}

function aliasFn(
    fn: (...args: any) => void,
    { verb, expectation }: {
        verb?: string;
        expectation?: string;
    } = {},
    ...args: any[]
): any {
    const context = getContext(this)
    context.verb = verb
    context.expectation = expectation
    return fn.apply(context, args)
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
