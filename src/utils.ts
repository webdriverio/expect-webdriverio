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

export const enhanceError = (defaultMessage: string, {
    message = '',
    suppressDefaultMessage = options.suppressDefaultMessage
}) => {
    let msg = message || defaultMessage
    if (message && !suppressDefaultMessage) {
        msg += '\n' + defaultMessage
    }
    return msg
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

export const isNotText = (pass: boolean, failText: string, passText = '') => {
    return pass ? passText : failText
}
