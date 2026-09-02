import { printDiffOrStringify, printExpected, printReceived, RECEIVED_COLOR, EXPECTED_COLOR, INVERTED_COLOR, stringify } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { MultiRemoteValuesWithArray, WdioElements, WdioMultiRemoteElements } from '../types.js'
import { isArrayOfElement, isElementArrayLike, isElementOrArrayLike, isElementOrArrayOrMultiRemoteElementLike, isMultiRemoteElement, isMultiRemoteElementArray, isMultiRemoteElementLike, isMultiRemoteElements, isMultiRemoteElementsLike, isStrictlyElementArray } from './elementsUtil.js'
import { toJsonString } from './stringUtil.js'
import { isJasmineStringAsymmetricMatcher, toArray } from '../utils.js'
import { isBrowser } from './multiRemoteUtils.js'

export const isDefined = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && (el as WebdriverIO.ElementArray).props.length > 0) {
        // TODO handle custom$ selector
        result += ', <props>'
    }
    return result
}

export const getSelectors = (el: WebdriverIO.Element | WdioElements | WdioMultiRemoteElements): string => {
    if (!el || typeof el !== 'object') {
        return ''
    }

    const selectors = []
    let parent: WebdriverIO.ElementArray['parent'] | undefined

    if (isMultiRemoteElement(el)) {
        const subject = formatMultiRemoteInstanceNames(el.instances)

        return `${subject}.$(\`${getSelector(el)}\`)`
    } else if (isMultiRemoteElementsLike(el)) {
        const instances = isMultiRemoteElementArray(el) ? (el.parent as WebdriverIO.MultiRemoteBrowser).instances : el[0].instances ?? []
        const selector = isMultiRemoteElementArray(el) ? getSelector(el) : el[0] ? getSelector(el[0]) : ''
        const subject = formatMultiRemoteInstanceNames(instances)

        return `${subject}.$$(\`${selector}\`)`
    } else if (isStrictlyElementArray(el)) {
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
        const selector = getSelector(parent)
        const index = isDefined(parent.index) ? `[${parent.index}]` : ''
        selectors.push(`${isDefined(parent.index) ? '$' : ''}$(\`${selector}\`)${index}`)

        parent = parent.parent
    }

    return selectors.reverse().join('.')
}

const not = (isNot: boolean | undefined): string => `${isNot ? 'not ' : ''}`

export const enhanceError = (
    subject: string | WebdriverIO.Element | WdioElements | WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser | unknown,
    expected: unknown,
    actual: unknown,
    context: { isNot: boolean | undefined, useNotInLabel?: boolean, isSome?: boolean, browserTargetType?: 'browser' | 'window' },
    verb: string,
    expectation: string,
    expectedValueArgument2 = '', {
        message = '',
        containing = false
    } = {}): string => {
    const { isNot, useNotInLabel = true } = context

    if (isBrowser(subject)) {
        if (subject.isMultiremote) {
            subject = formatMultiRemoteInstanceNames(subject.instances)
        } else if (subject.isMobile) {
            subject = context.browserTargetType === 'window' ? 'mobile screen' : 'mobile'
        } else {
            const prefix = subject.requestedCapabilities?.browserName ?? 'browser'
            subject = context.browserTargetType === 'window' ? `${prefix}'s window` : prefix
        }
    }

    let subjectStr = (isElementOrArrayOrMultiRemoteElementLike(subject) ? getSelectors(subject) : toJsonString(subject))
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

    const isNotInLabel = useNotInLabel && isNot
    const label =  {
        expected: isNotInLabel ? 'Expected [not]' : 'Expected',
        received: isNotInLabel ? 'Received      ' : 'Received'
    }

    let diffString = ''

    if (isJasmineStringAsymmetricMatcher(expected)) {
        // With Jest's expect asymetric matcher, it uses a pretty-format plugin for asymetric matcher, but Jasmine's asymmetric matcher doesn't have that!
        expected = expected.jasmineToString()
    } else if (isElementOrArrayLike(subject) && Array.isArray(expected)) {
        expected = expected.map(item => isJasmineStringAsymmetricMatcher(item) ? item.jasmineToString() : item)
    }

    // Special formatting for .not with arrays to highlight what matched
    if (isNotInLabel && isElementOrArrayLike(subject) && Array.isArray(expected) && Array.isArray(actual) && expected.length === actual.length) {
        // With multiple elements + `.not`, since `printDiffOrStringify` shows only diff and we need to highlight what matched, we do custom formatting
        // Using FORCE_COLOR=1 npx vitest + console.log() can show colors in the test output console
        const { expectedFormatted, receivedFormatted } = printArrayWithMatchingItemInRed(expected, actual)
        diffString = `\
${label.expected}: ${expectedFormatted}
${label.received}: ${receivedFormatted}`
    } else if (equals(actual, expected)) {
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

    const some = context.isSome ? 'some of ' : ''

    const msg = `\
${message}Expect ${some}${subjectStr} ${not(isNot)}to ${verb}${expectation}${expectedValueArgument2}${contain}

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
        if (equals(expectedArray[i], actualArray[i])) {
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
    actuals: boolean[] | boolean | MultiRemoteValuesWithArray<boolean> | undefined,
    context: { isNot: boolean, isSome: boolean, verb: string, expectation: string },
    options: ExpectWebdriverIO.CommandOptions
) => {
    const { isNot, verb, expectation } = context
    let expected
    let actual

    const expectedValue = `${not(isNot)}${expectation}`
    const actualValue = `${not(!isNot)}${expectation}`

    if (isMultiRemoteElementLike(subject)) {
        if (isMultiRemoteElement(subject)) {
            const typedActuals = actuals as MultiRemoteValues<boolean>
            actual = Object.entries(subject.instances).reduce((acc, [index, instance]) => {
                acc[instance] = isSuccess(isNot, typedActuals[index]) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`
                return acc
            }, {} as MultiRemoteValues<string>)
            expected = subject.instances.reduce((acc, instance) => {
                acc[instance] = expectedValue
                return acc
            }, {} as MultiRemoteValues<string>)
        } else if (isMultiRemoteElements(subject)) {
            const typedActuals = actuals as MultiRemoteValues<boolean[]>
            actual = subject[0].instances.reduce((acc, instance) => {
                acc[instance] = typedActuals[instance].map(actual => isSuccess(isNot, actual) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`)
                return acc
            }, {} as MultiRemoteValues<string[]>)
            expected = subject[0].instances.reduce((acc, instance) => {
                acc[instance] = Array(typedActuals[instance].length).fill(expectedValue)
                return acc
            }, {} as MultiRemoteValues<string[]>)
        } else {
            throw new Error('Unsupported Multi-remote object type for enhanceErrorBe')
        }
    } else if (isElementArrayLike(subject)) {
        expected = subject.length === 0 ? 'at least one result' : Array(subject.length).fill(expectedValue)
        // @ts-expect-error TODO dprevost fix typing
        actual = toArray(actuals).map(actual => isSuccess(isNot, actual) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`)
    } else {
        expected = expectedValue
        actual = actualValue
    }

    return enhanceError(subject, expected, actual, { ...context, useNotInLabel: false }, verb, expectation, '', options)
}

const isSuccess = (isNot: boolean, success: boolean): boolean => {
    return isNot ? !success : success
}

const formatMultiRemoteInstanceNames = (instances: string[]): string => {
    let instanceNames = instances.join(', ')
    instanceNames = instanceNames.length > 50 ? `${instanceNames.substring(0, 50)}...` : instanceNames
    return `multi-remote<${instanceNames}>`
}
