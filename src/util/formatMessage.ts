import { printDiffOrStringify, printExpected, printReceived } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { WdioElements } from '../types.js'
import { isArrayOfElement, isElementArray, isElementArrayLike, isElementOrArrayLike } from './elementsUtil.js'
import { numberMatcherTester } from './numberOptionsUtil.js'
import { toJsonString } from './stringUtil.js'

// TODO one day use a real asymmetric matcher for number options instead of this custom equality tester
const CUSTOM_EQUALITY_TESTER = [numberMatcherTester]

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && (el as WebdriverIO.ElementArray).props.length > 0) {
        // todo handle custom$ selector
        result += ', <props>'
    }
    return result
}

export const getSelectors = (el: WebdriverIO.Element | WdioElements): string => {
    if (!el || typeof el !== 'object') {
        return ''
    }

    const selectors = []
    let parent: WebdriverIO.ElementArray['parent'] | undefined

    if (isElementArray(el)) {
        // Type ElementArray
        selectors.push(`${(el).foundWith}(\`${getSelector(el)}\`)`)
        parent = el.parent
    } else if (isArrayOfElement(el)) {
        // Type Element[]
        return `[${el.map(getSelectors).join(',')}]`
    } else {
        // Type Element
        parent = el
    }

    while (!!parent && typeof parent === 'object' && 'selector' in parent) {
        const selector = getSelector(parent as WebdriverIO.Element)
        const index = parent.index ? `[${parent.index}]` : ''
        selectors.push(`${parent.index ? '$' : ''}$(\`${selector}\`)${index}`)

        parent = (parent as WebdriverIO.Element).parent
    }

    return selectors.reverse().join('.')
}

const not = (isNot: boolean): string => `${isNot ? 'not ' : ''}`

export const enhanceError = (
    subject: string | WebdriverIO.Element | WdioElements | unknown,
    expected: unknown,
    actual: unknown,
    context: { isNot: boolean, useNotInLabel?: boolean },
    verb: string,
    expectation: string,
    expectedValueArgument2 = '', {
        message = '',
        containing = false
    } = {}): string => {
    const { isNot, useNotInLabel = true } = context

    let subjectStr = (isElementOrArrayLike(subject) ? getSelectors(subject) : toJsonString(subject))
    if (subjectStr.length > 100) {
        subjectStr = `${subjectStr.substring(0, 100)}...`
    }

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
    const diffString = equals(actual, expected, CUSTOM_EQUALITY_TESTER) ?`\
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
${message}Expect ${subjectStr} ${not(isNot)}to ${verb}${expectation}${expectedValueArgument2}${contain}

${diffString}`

    return msg
}

const toArray = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]

export const enhanceErrorBe = (
    subject: WebdriverIO.Element | WdioElements | unknown,
    results: boolean[] | boolean | undefined,
    context: { isNot: boolean, verb: string, expectation: string },
    options: ExpectWebdriverIO.CommandOptions
) => {
    const { isNot, verb, expectation } = context
    let expected
    let actual

    const expectedValue = `${not(isNot)}${expectation}`
    const actualValue = `${not(!isNot)}${expectation}`

    if (isElementArrayLike(subject)) {
        expected = subject.length === 0? 'at least one result' : subject.map(() => expectedValue)
        actual = toArray(results).map(result => isSuccess(isNot, result) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`)
    } else {
        expected = expectedValue
        actual = actualValue
    }

    return enhanceError(subject, expected, actual, { ...context, useNotInLabel: false }, verb, expectation, '', options)
}

const isSuccess = (isNot: boolean, result: boolean): boolean => {
    return isNot ? !result : result
}
