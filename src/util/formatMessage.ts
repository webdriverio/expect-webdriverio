import { printDiffOrStringify, printExpected, printReceived, RECEIVED_COLOR, EXPECTED_COLOR, INVERTED_COLOR, stringify } from 'jest-matcher-utils'
import { equals } from '../jasmineUtils.js'
import type { MultiRemoteValuesWithArray, WdioElements, WdioMultiRemoteElements } from '../types.js'
import { isArrayOfElement, isElementArrayLike, isElementOrArrayLike, isElementOrArrayOrMultiRemoteElementLike, isMultiRemoteElement, isMultiRemoteElementArray, isMultiRemoteElementLike, isStrictlyElementArray } from './elementsUtil.js'
import { toJsonString } from './stringUtil.js'
import { getLoadedWdioKind } from './wdioKind.js'
import { isJasmineStringAsymmetricMatcher } from './asymmetricMatcherUtil.js'
import { toArray } from './arrayUtil.js'
import { stringOptionsName } from './stringOptionsName.js'
import { isBrowser, isBrowsingContext, isMultiRemoteBrowser } from './multiRemoteUtils.js'

export const isDefined = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElementArray) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && (el as WebdriverIO.ElementArray).props.length > 0) {
        // TODO handle custom$ selector
        result += ', <props>'
    }
    return result
}

const isAwaitedElementOrList = (value: unknown): value is WebdriverIO.Element | WebdriverIO.ElementArray => {
    const kind = getLoadedWdioKind(value)
    return kind === 'element' || kind === 'element-array'
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
    } else if (isMultiRemoteElementArray(el)) {
        const selector = getSelector(el)
        const subject = formatMultiRemoteInstanceNames(el.parent.instances)

        return `${subject}.${el.foundWith ?? '$$'}(\`${selector}\`)`
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

    // Up to the browser or the browsing context. A parent that is a not-awaited `$()` has no selector to show yet.
    while (isAwaitedElementOrList(parent)) {
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
    context: { isNot?: boolean, useNotInLabel?: boolean, isSome?: boolean, matchingIndexes?: number[], browserTargetType?: 'browser' | 'window', showContextUrl?: boolean },
    verb: string,
    expectation: string,
    expectedValueArgument2 = '',
    options: ExpectWebdriverIO.StringOptions = {}): string => {
    const { message: userMessage = '', containing = false } = options
    let message = userMessage
    const { isNot, useNotInLabel = true } = context

    // Label the per-instance values `Multi-remote values {` instead of `Object {` in the printed diff
    if ((isBrowser(subject) && isMultiRemoteBrowser(subject)) || isMultiRemoteElementLike(subject)) {
        expected = labelMultiRemoteValues(expected)
        actual = labelMultiRemoteValues(actual)
    }

    if (isBrowsingContext(subject)) {
        // The URL tells which tab or frame failed. It is the one of the last navigation, not a new read.
        const prefix = subject.isMobile ? 'mobile' : subject.browser.requestedCapabilities?.browserName ?? 'browser'
        // `url` is '' for a frame found by its element, until WebdriverIO navigates it or reads its URL
        const url = context.showContextUrl === false || !subject.url ? '' : ` (${subject.url})`
        subject = `${prefix}'s ${subject.isFrame ? 'frame' : 'window'}${url}`
    } else if (isBrowser(subject)) {
        if (isMultiRemoteBrowser(subject)) {
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
    // One string value keeps the string diff of Jest, so its non-default string options are named in the label, e.g.
    // `Expected (ignoringCase)`. In a list or per-instance values, each expected value names them (`StringOptionsMatcher`).
    const optionsName = typeof expected === 'string' ? stringOptionsName(options) : ''
    const label =  {
        expected: `${isNotInLabel ? 'Expected [not]' : 'Expected'}${optionsName ? ` (${optionsName})` : ''}`,
        received: isNotInLabel ? 'Received      ' : 'Received'
    }
    // The labels of the 2 lines that this function prints itself, aligned as Jest aligns its own
    const receivedLineLabel = label.received.padEnd(label.expected.length)

    let diffString = ''

    if (isJasmineStringAsymmetricMatcher(expected)) {
        // With Jest's expect asymetric matcher, it uses a pretty-format plugin for asymetric matcher, but Jasmine's asymmetric matcher doesn't have that!
        expected = expected.jasmineToString(stringify)
    } else if (isElementOrArrayLike(subject) && Array.isArray(expected)) {
        expected = expected.map(item => isJasmineStringAsymmetricMatcher(item) ? item.jasmineToString(stringify) : item)
    }

    // Special formatting for .not with arrays to highlight what matched
    if (isNotInLabel && isElementOrArrayLike(subject) && Array.isArray(expected) && Array.isArray(actual) && expected.length === actual.length) {
        // With multiple elements + `.not`, since `printDiffOrStringify` shows only diff and we need to highlight what matched, we do custom formatting
        // Using FORCE_COLOR=1 npx vitest + console.log() can show colors in the test output console
        const { expectedFormatted, receivedFormatted } = printArrayWithMatchingItemInRed(expected, actual, context.matchingIndexes)
        diffString = `\
${label.expected}: ${expectedFormatted}
${receivedLineLabel}: ${receivedFormatted}`
    } else if (equals(actual, expected)) {
        // Using `printDiffOrStringify()` with equals values output `Received: serializes to the same string`, so we need to tweak.
        diffString =
            `\
${label.expected}: ${printExpected(expected)}
${receivedLineLabel}: ${printReceived(actual)}`
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
    matchingIndexes?: number[],
): { expectedFormatted: string, receivedFormatted: string } => {
    // The indexes come from the matcher's own comparison, with its string options. Comparing again here cannot follow
    // it, and would test a sticky or global RegExp a second time: `equals()` is only a fallback.
    const matchingIndices = matchingIndexes ?? expectedArray.flatMap((item, i) => equals(item, actualArray[i]) ? [i] : [])

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
    context: { isNot?: boolean, isSome: boolean, verb: string, expectation: string },
    options: ExpectWebdriverIO.CommandOptions
) => {
    const { isNot = false, verb, expectation } = context
    let expected
    let actual

    const expectedValue = `${not(isNot)}${expectation}`
    const actualValue = `${not(!isNot)}${expectation}`

    if (isMultiRemoteElementLike(subject)) {
        if (isMultiRemoteElement(subject)) {
            const typedActuals = actuals as MultiRemoteValues<boolean>
            actual = subject.instances.reduce((acc, instance) => {
                acc[instance] = isSuccess(isNot, typedActuals[instance]) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`
                return acc
            }, {} as MultiRemoteValues<string>)
            expected = subject.instances.reduce((acc, instance) => {
                acc[instance] = expectedValue
                return acc
            }, {} as MultiRemoteValues<string>)
        } else if (subject.length === 0) {
            // Empty `MultiRemoteElementArray`: no instance names to report per browser
            expected = 'at least one result'
            actual = actualValue
        } else {
            const { instances } = subject.parent
            const typedActuals = actuals as MultiRemoteValues<boolean[]>
            actual = instances.reduce((acc, instance) => {
                acc[instance] = typedActuals[instance].map(actual => isSuccess(isNot, actual) ? `${not(isNot)}${expectation}` : `${not(!isNot)}${expectation}`)
                return acc
            }, {} as MultiRemoteValues<string[]>)
            expected = instances.reduce((acc, instance) => {
                acc[instance] = Array(typedActuals[instance].length).fill(expectedValue)
                return acc
            }, {} as MultiRemoteValues<string[]>)
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

/** Only used for its name, printed by `pretty-format` as the header of the per-instance values */
class MultiRemoteValuesLabel {}
Object.defineProperty(MultiRemoteValuesLabel, 'name', { value: 'Multi-remote values' })

export const labelMultiRemoteValues = (value: unknown): unknown => {
    const isPlainObject = typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
    return isPlainObject ? Object.assign(new MultiRemoteValuesLabel(), value) : value
}

export const formatMultiRemoteInstanceNames = (instances: string[]): string => {
    let instanceNames = instances.join(', ')
    instanceNames = instanceNames.length > 50 ? `${instanceNames.substring(0, 50)}...` : instanceNames
    return `multi-remote<${instanceNames}>`
}
