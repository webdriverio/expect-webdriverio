import { getDefaultOptions } from './options'

const defaultOptions = getDefaultOptions()

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';
const NOT_SUFFIX = ' [not]'
const NOT_EXPECTED_LABEL = EXPECTED_LABEL + NOT_SUFFIX

/**
 *
 * @param condition function
 * @param isNot     https://jestjs.io/docs/en/expect#thisisnot
 * @param options   wait, interval, etc
 */
export const waitUntil = async (condition: () => Promise<boolean>, isNot = false, {
    wait = defaultOptions.wait,
    interval = defaultOptions.interval } = {},
) => {
    // single attempt
    if (wait === 0) {
        return await condition()
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
        }, wait, undefined, interval)

        if (error) {
            throw error
        }

        return !isNot
    } catch (err) {
        return isNot
    }
}

export const enhanceError = (
    subject: string | WebdriverIO.Element | WebdriverIO.ElementArray,
    expected: any,
    actual: any,
    context: { isNot: boolean, utils: any },
    verb: string,
    expectation: string,
    arg2 = '', {
        message = '',
        containing = false
    }) => {
    const { isNot, utils } = context
    const { printExpected, printReceived, printDiffOrStringify } = utils

    subject = typeof subject === 'string' ? subject : getSelectors(subject)

    let contain = ''
    if (containing) {
        contain = ' containing'
    }

    if (verb) {
        verb += ' '
    }

    let diffString
    if (isNot && actual === expected) {
        diffString = `${EXPECTED_LABEL}: ${printExpected(expected)}\n` +
            `${RECEIVED_LABEL}: ${printReceived(actual)}`
    } else {
        diffString = printDiffOrStringify(expected, actual, EXPECTED_LABEL, RECEIVED_LABEL, true)
    }
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

    const msg = `${message}Expect ${subject} ${not(isNot)}to ${verb}${expectation}${arg2}${contain}\n\n${diffString}`
    return msg
}

export const enhanceErrorBe = (
    subject: string | WebdriverIO.Element | WebdriverIO.ElementArray,
    pass: boolean,
    context: any,
    verb: string,
    expectation: string,
    options: ExpectWebdriverIO.CommandOptions) => {
    return enhanceError(subject, not(context.isNot) + expectation, not(!pass) + expectation, context, verb, expectation, '', options)
}

export const getSelectors = (el: WebdriverIO.Element | WebdriverIO.ElementArray) => {
    const selectors = []
    let parent: WebdriverIO.Element | WebdriverIO.BrowserObject | undefined

    if (Array.isArray(el)) {
        selectors.push(`${el.foundWith}(\`${getSelector(el)}\`)`)
        parent = el.parent
    } else {
        parent = el
    }

    while (parent && 'selector' in parent) {
        const selector = getSelector(parent)
        const index = parent.index ? `[${parent.index}]` : ''
        selectors.push(`${parent.index ? '$' : ''}$(\`${selector}\`)${index}`)

        parent = parent.parent
    }

    return selectors.reverse().join('.')
}

export const getSelector = (el: WebdriverIO.Element | WebdriverIO.ElementArray) => {
    let result = typeof el.selector === 'string' ? el.selector : '<fn>'
    if (Array.isArray(el) && el.props.length > 0) {
        // todo handle custom$ selector
        result += ', <props>'
    }
    return result
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

/**
 * refetch elements array
 * @param elements WebdriverIO.ElementArray
 */
export const refetchElements = async (elements: WebdriverIO.ElementArray, wait = defaultOptions.wait, full = false) => {
    if (elements) {
        if (wait! > 0 && (elements.length === 0 || full)) {
            // @ts-ignore
            elements = (await elements.parent[elements.foundWith](elements.selector, ...elements.props) as WebdriverIO.ElementArray)
        }
    }
    return elements
}

/**
 * make sure that condition passes for element or every element of elements array
 * @param el element or elements array
 * @param condition
 */
export const executeCommand = async (
    el: WebdriverIO.Element | WebdriverIO.ElementArray,
    condition: (el: WebdriverIO.Element, ...params: any[]) => Promise<{
        result: boolean,
        value?: any
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: any[] = [],
    fullRefetch = false
) => {
    let elements

    if (Array.isArray(el)) {
        elements = await refetchElements(el, options.wait, fullRefetch)
    } else {
        // it doesn't matter if it's WebdriverIO.ElementArray or WebdriverIO.Element[]
        elements = ([el] as WebdriverIO.ElementArray)
    }

    if (elements.length === 0) {
        return {
            el: elements,
            success: false,
        }
    }

    const results: { result: boolean, value?: any }[] = []

    for (const element of elements) {
        results.push(await condition(element, ...params))
    }

    const values = [...new Set(results.filter(result => !result.result).map(result => result.value))]

    return {
        el: Array.isArray(el) ? elements : el,
        success: results.every(result => result.result === true),
        values: values.length > 1 ? values : values[0]
    }
}

export async function executeCommandBe(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions
) {
    const { isNot, expectation, verb = 'be' } = this

    let el = await received
    const pass = await waitUntil(async () => {
        const result = await executeCommand(
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

/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const getExpected = (el: WebdriverIO.Element | WebdriverIO.ElementArray, actual: any, expected: any) => {
    if (Array.isArray(el) && el.length > 1 && Array.isArray(actual)) {
        expected = [expected]
    }
    return expected
}

/**
 * update the received elements array
 * @param success   if `true` - perform update
 * @param received
 * @param el
 * @param full      if `true` - update the received elements array even if it's not empty.
 */
export const updateElementsArray = (
    success: boolean,
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    refetched: WebdriverIO.Element | WebdriverIO.ElementArray,
    full = false) => {
    // do nothing if not success
    if (!success) {
        return
    }

    // only update element array
    if (Array.isArray(received) && Array.isArray(refetched)) {
        // remove every item of original element array
        if (full === true) {
            while (received.length > 0) {
                received.pop()
            }
        }

        // add every refetched item to original element array
        if (received.length === 0) {
            refetched.forEach(el => received.push(el))
        }
    }
}

export const compareNumbers = (actual: number, gte: number, lte: number, eq?: number) => {
    if (typeof eq === 'number') {
        return actual === eq
    }

    if (lte > 0 && actual > lte) {
        return false
    }

    return actual >= gte
}

export const numberError = (gte: number, lte: number, eq?: number) => {
    if (typeof eq === 'number') {
        return eq
    }

    let error = ''
    error = `>= ${gte}`
    error += lte ? ` && <= ${lte}` : ''
    return error
}
