import { printDiffOrStringify, printExpected, printReceived } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { WdioElements } from '../types.js'
import { isElementArray } from './elementsUtil.js'
import type { CompareResult } from '../utils.js'

const EXPECTED_LABEL = 'Expected'
const RECEIVED_LABEL = 'Received'
const NOT_SUFFIX = ' [not]'
const NOT_EXPECTED_LABEL = EXPECTED_LABEL + NOT_SUFFIX

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && (el as WebdriverIO.ElementArray).props.length > 0) {
        // todo handle custom$ selector
        result += ', <props>'
    }
    return result
}

export const getSelectors = (el: WebdriverIO.Element | WdioElements) => {
    const selectors = []
    let parent: WebdriverIO.ElementArray['parent'] | undefined

    if (isElementArray(el)) {
        selectors.push(`${(el).foundWith}(\`${getSelector(el)}\`)`)
        parent = el.parent
    } else if (!Array.isArray(el)) {
        parent = el
    }

    while (parent && 'selector' in parent) {
        const selector = getSelector(parent as WebdriverIO.Element)
        const index = parent.index ? `[${parent.index}]` : ''
        selectors.push(`${parent.index ? '$' : ''}$(\`${selector}\`)${index}`)

        parent = (parent as WebdriverIO.Element).parent
    }

    return selectors.reverse().join('.')
}

const not = (isNot: boolean): string => `${isNot ? 'not ' : ''}`

export const enhanceError = (
    subject: string | WebdriverIO.Element | WdioElements,
    expected: unknown,
    actual: unknown,
    context: { isNot?: boolean },
    verb: string,
    expectation: string,
    arg2 = '',
    {
        message = '',
        containing = false
    }): string => {
    const { isNot = false } = context

    subject = typeof subject === 'string' ? subject : getSelectors(subject)

    let contain = ''
    if (containing) {
        contain = ' containing'
    }

    if (verb) {
        verb += ' '
    }

    let diffString = isNot && equals(actual, expected)
        ? `${EXPECTED_LABEL}: ${printExpected(expected)}\n${RECEIVED_LABEL}: ${printReceived(actual)}`
        : printDiffOrStringify(expected, actual, EXPECTED_LABEL, RECEIVED_LABEL, true)

    if (isNot) {
        diffString = diffString
            .replace(EXPECTED_LABEL, NOT_EXPECTED_LABEL)
            .replace(RECEIVED_LABEL, RECEIVED_LABEL + ' '.repeat(NOT_SUFFIX.length))
    }

    if (message) {
        message += '\n'
    }

    if (arg2) {
        arg2 = ` ${arg2}`
    }

    /**
     * Example of below message:
     * Expect window to have title
     *
     * Expected: "some Title text"
     * Received: "some Wrong Title text"
     */
    const msg = `${message}Expect ${subject} ${not(isNot)}to ${verb}${expectation}${arg2}${contain}\n\n${diffString}`
    return msg
}

/**
 * Formats failure message for multiple compare results
 * TODO multi-remote support: Replace enhanceError with this one everywhere
 */
export const formatFailureMessage = (
    subject: string | WebdriverIO.Element | WebdriverIO.ElementArray,
    compareResults: CompareResult<string, string | RegExp | WdioAsymmetricMatcher<string>>[],
    context: ExpectWebdriverIO.MatcherContext & { useNotInLabel?: boolean },
    expectedValueArgument2 = '',
    { message = '', containing = false } = {}): string => {

    const { isNot = false, expectation, useNotInLabel = true } = context
    let { verb } = context

    subject = typeof subject === 'string' ? subject : getSelectors(subject)

    let contain = ''
    if (containing) {
        contain = ' containing'
    }

    if (verb) {
        verb += ' '
    }

    const label =  {
        expected: isNot && useNotInLabel ? 'Expected [not]' : 'Expected',
        received: isNot && useNotInLabel ? 'Received      ' : 'Received'
    }

    const failedResults = compareResults.filter(({ result }) => result === isNot)

    let msg = ''
    for (const failResult of failedResults) {
        const { actual, expected, instance: instanceName } = failResult

        // Using `printDiffOrStringify()` with equals values output `Received: serializes to the same string`, so we need to tweak.
        const diffString = equals(actual, expected) ?`\
${label.expected}: ${printExpected(expected)}
${label.received}: ${printReceived(actual)}`
            : printDiffOrStringify(expected, actual, label.expected, label.received, true)

        if (message) {
            message += '\n'
        }

        if (expectedValueArgument2) {
            expectedValueArgument2 = ` ${expectedValueArgument2}`
        }

        const mulitRemoteContext = context.isMultiRemote  ? ` for remote "${instanceName}"` : ''

        /**
         * Example of below message (multi-remote + isNot case):
         * ```
         * Expect window not to have title for remote "browserA"
         *
         * Expected not: "some Title text"
         * Received: "some Wrong Title text"
         *
         * ```
         */
        msg += `\
${message}Expect ${subject} ${not(isNot)}to ${verb}${expectation}${expectedValueArgument2}${contain}${mulitRemoteContext}

${diffString}

`
    }

    return msg.trim()
}

export const enhanceErrorBe = (
    subject: string | WebdriverIO.Element | WebdriverIO.ElementArray,
    pass: boolean,
    context: { isNot: boolean },
    verb: string,
    expectation: string,
    options: ExpectWebdriverIO.CommandOptions
) => {
    return enhanceError(subject, not(context.isNot) + expectation, not(!pass) + expectation, context, verb, expectation, '', options)
}

export const numberError = (options: ExpectWebdriverIO.NumberOptions = {}): string | number => {
    if (typeof options.eq === 'number') {
        return options.eq
    }

    if (options.gte && options.lte) {
        return `>= ${options.gte} && <= ${options.lte}`
    }

    if (options.gte) {
        return `>= ${options.gte}`
    }

    if (options.lte) {
        return ` <= ${options.lte}`
    }

    return 'no params'
}
