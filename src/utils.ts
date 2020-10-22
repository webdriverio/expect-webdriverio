import { getConfig } from './options'

import { executeCommand } from './util/executeCommand'
import { wrapExpectedWithArray, updateElementsArray } from './util/elementsUtil'
import { enhanceError, enhanceErrorBe, numberError } from './util/formatMessage'
import { getContext } from './util/expectAdapter'

const config = getConfig()
const { options: DEFAULT_OPTIONS } = config

/**
 * wait for expectation to succeed
 * @param condition function
 * @param isNot     https://jestjs.io/docs/en/expect#thisisnot
 * @param options   wait, interval, etc
 */
const waitUntil = async (
    condition: () => Promise<boolean>,
    isNot = false,
    { wait = DEFAULT_OPTIONS.wait, interval = DEFAULT_OPTIONS.interval } = {},
    { isNetworkMock = false } = {}
): Promise<boolean> => {
    // single attempt
    if (wait === 0) {
        return await condition()
    }

    if (isNetworkMock && typeof DEFAULT_OPTIONS.mockWait === 'number' && wait === DEFAULT_OPTIONS.wait) {
        wait = DEFAULT_OPTIONS.mockWait
    }

    // wait for condition to be truthy
    try {
        let error
        await browser.waitUntil(async () => {
            error = undefined
            try {
                return isNot !== await condition()
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

const compareNumbers = (actual: number, gte: number, lte: number, eq?: number): boolean => {
    if (typeof eq === 'number') {
        return actual === eq
    }

    if (lte > 0 && actual > lte) {
        return false
    }

    return actual >= gte
}

export const compareText = (actual: string, expected: string, { ignoreCase = false, trim = false, containing = false }) => {
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
