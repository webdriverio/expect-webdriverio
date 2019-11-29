// https://github.com/facebook/jest/tree/master/packages/jest-diff
const diff = require('jest-diff')

import { getDefaultOptions } from './options'

const options = getDefaultOptions()

/**
 *
 * @param condition function
 * @param isNot     https://jestjs.io/docs/en/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async (condition: () => Promise<any>, isNot = false, {
    now = false,
    wait = options.wait,
    interval = options.interval } = {},
) => {
    // single attempt
    if (now || wait === 0) {
        return await condition()
    }

    // wait for condition to be truthy
    try {
        await browser.waitUntil(async () => isNot !== await condition(), wait, undefined, interval)

        return !isNot
    } catch (err) {
        return isNot
    }
}

export const enhanceError = (
    subject: string | WebdriverIO.Element,
    expected: any,
    actual: any,
    isNot: boolean,
    verb: string,
    expectation: string,
    arg2 = '', {
        message = '',
        containing = false
    }) => {
    subject = typeof subject === 'string' ? subject : getSelectors(subject)

    let contain = ''
    if (containing) {
        contain = ' containing'
    }

    if (verb) {
        verb += ' '
    }

    const diffString = `\n\n${diff(expected, actual)}`

    if (message) {
        message += '\n'
    }

    if (arg2) {
        arg2 = ` ${arg2}`
    }

    const msg = `${message}Expect ${subject} ${not(isNot)}to ${verb}${expectation}${arg2}${contain}${diffString}`
    return msg
}

export const enhanceErrorBe = (
    subject: string | WebdriverIO.Element,
    pass: boolean,
    isNot: boolean,
    verb: string,
    expectation: string,
    options: ExpectWebdriverIO.CommandOptions) => {
    return enhanceError(subject, not(isNot) + expectation, not(!pass) + expectation, isNot, verb, expectation, '', options)
}

export const getSelectors = (el: WebdriverIO.Element) => {
    const selectors = []
    let parent: WebdriverIO.Element | undefined = el
    while (parent && parent.selector) {
        const selector = typeof parent.selector === 'string' ? parent.selector : '<fn>'
        const index = parent.index ? `[${parent.index}]` : ''
        selectors.push(`${parent.index ? '$' : ''}$(\`${selector}\`)${index}`)

        parent = parent.parent
    }

    return selectors.reverse().join('.')
}

export const not = (isNot: boolean) => {
    return `${isNot ? 'not ' : ''}`
}

export const compareText = (actual: string, expected: string, { ignoreCase = false, trim = false, containing = false }) => {
    if (typeof actual !== 'string') {
        return false
    }

    if (trim) {
        actual = actual.trim()
    }
    if (ignoreCase) {
        actual = actual.toLowerCase()
        expected = expected.toLowerCase()
    }
    if (containing) {
        return actual.includes(expected)
    }
    return actual === expected
}
