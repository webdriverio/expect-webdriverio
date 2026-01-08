import { printDiffOrStringify, printExpected, printReceived } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { WdioElements } from '../types.js'
import { isElementArray } from './elementsUtil.js'

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && (el as WebdriverIO.ElementArray).props.length > 0) {
        // todo handle custom$ selector
        result += ', <props>'
    }
    return result
}

export const getSelectors = (el: WebdriverIO.Element | WdioElements): string => {
    const selectors = []
    let parent: WebdriverIO.ElementArray['parent'] | undefined

    if (isElementArray(el)) {
        selectors.push(`${(el).foundWith}(\`${getSelector(el)}\`)`)
        parent = el.parent
    } else if (!Array.isArray(el)) {
        parent = el
    } else if (Array.isArray(el)) {
        for (const element of el) {
            selectors.push(getSelectors(element))
        }
        // When not having more context about the common parent, return joined selectors
        return selectors.join(', ')
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
    subject: string | WebdriverIO.Element | WdioElements | undefined,
    expected: unknown,
    actual: unknown,
    context: { isNot: boolean, useNotInLabel?: boolean },
    verb: string,
    expectation: string,
    expectedValueArgument2 = '', {
        message = '',
        containing = false
    } = {}): string => {
    const { isNot = false, useNotInLabel = true } = context

    subject = typeof subject === 'string' || !subject ? subject : getSelectors(subject)

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

    const msg = `\
${message}Expect ${subject} ${not(isNot)}to ${verb}${expectation}${expectedValueArgument2}${contain}

${diffString}`

    return msg
}

export const enhanceErrorBe = (
    subject: string | WebdriverIO.Element | WdioElements | undefined,
    context: { isNot: boolean, verb: string, expectation: string },
    options: ExpectWebdriverIO.CommandOptions
) => {
    const { isNot, verb, expectation } = context
    const expected = `${not(isNot)}${expectation}`
    const actual = `${not(!isNot)}${expectation}`

    return enhanceError(subject, expected, actual, { ...context, useNotInLabel: false }, verb, expectation, '', options)
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
        return `<= ${options.lte}`
    }

    return `Incorrect number options provided. Received: ${JSON.stringify(options)}`
}
