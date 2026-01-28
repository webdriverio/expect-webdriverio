import { printDiffOrStringify, printExpected, printReceived, RECEIVED_COLOR, EXPECTED_COLOR, INVERTED_COLOR, stringify } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { WdioElements } from '../types.js'
import { isElementArrayLike, isElementOrNotEmptyElementArray, isStrictlyElementArray } from './elementsUtil.js'
import { numberMatcherTester } from './numberOptionsUtil.js'
import { toJsonString } from './stringUtil.js'

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
    const selectors = []
    let parent: WebdriverIO.ElementArray['parent'] | undefined

    if (isStrictlyElementArray(el)) {
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
    const { isNot = false, useNotInLabel = true } = context

    const isElementsSubject = isElementArrayLike(subject)

    subject = subject = isElementOrNotEmptyElementArray(subject) ? getSelectors(subject) : toJsonString(subject)

    let contain = ''
    if (containing) {
        contain = ' containing'
    }

    if (verb) {
        verb += ' '
    }

    const isNotInLabel = useNotInLabel && isNot
    const label =  {
        expected: isNotInLabel ? 'Expected [not]' : 'Expected',
        received: isNotInLabel ? 'Received      ' : 'Received'
    }

    let diffString = ''

    // Special formatting for .not with arrays to highlight what matched
    if (isNotInLabel && isElementsSubject && Array.isArray(expected) && Array.isArray(actual) && expected.length === actual.length) {
        // With multiple elements + `.not`, since `printDiffOrStringify` shows only diff and we need to highlight what matched, we do custom formatting
        // Using FORCE_COLOR=1 npx vitest + console.log() can show colors in the test output console
        const { expectedFormatted, receivedFormatted } = printArrayWithMatchingItemInRed(expected, actual)
        diffString = `\
${label.expected}: ${expectedFormatted}
${label.received}: ${receivedFormatted}`
    } else if (equals(actual, expected, CUSTOM_EQUALITY_TESTER)) {
        // Using `printDiffOrStringify()` with equals values output `Received: serializes to the same string`, so we need to tweak.
        diffString =
            `\
${label.expected}: ${printExpected(expected)}
${label.received}: ${printReceived(actual)}`
    } else {
        diffString = printDiffOrStringify(expected, actual, label.expected, label.received, true)
    }

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

// Inspired by Jest's printReceivedArrayContainExpectedItem
// Highlights matching elements when using .not to show what shouldn't have matched
const printArrayWithMatchingItemInRed = (
    expectedArray: unknown[],
    actualArray: unknown[],
): { expectedFormatted: string, receivedFormatted: string } => {
    // Find matching indices
    const matchingIndices: number[] = []
    for (let i = 0; i < expectedArray.length; i++) {
        if (equals(expectedArray[i], actualArray[i], CUSTOM_EQUALITY_TESTER)) {
            matchingIndices.push(i)
        }
    }

    // For .not, matching items are the problem - highlight them in red on both sides
    const expectedFormatted = `[${expectedArray
        .map((item, i) => {
            const stringified = stringify(item)
            // Problematic items (matched) in red, others in green
            return matchingIndices.includes(i)
                ? RECEIVED_COLOR(INVERTED_COLOR(stringified))
                : EXPECTED_COLOR(stringified)
        })
        .join(', ')}]`

    const receivedFormatted = `[${actualArray
        .map((item, i) => {
            const stringified = stringify(item)
            // Problematic items (matched) in red, others in green
            return matchingIndices.includes(i)
                ? RECEIVED_COLOR(INVERTED_COLOR(stringified))
                : EXPECTED_COLOR(stringified)
        })
        .join(', ')}]`

    return { expectedFormatted, receivedFormatted }
}

export const enhanceErrorBe = (
    subject: WebdriverIO.Element | WdioElements | unknown,
    results: boolean[],
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
        actual = results.map(result => isSuccess(isNot, result) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`)
    } else {
        expected = expectedValue
        actual = actualValue
    }

    return enhanceError(subject, expected, actual, { ...context, useNotInLabel: false }, verb, expectation, '', options)
}

const isSuccess = (isNot: boolean, result: boolean): boolean => {
    return isNot ? !result : result
}

