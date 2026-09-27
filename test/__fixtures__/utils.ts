import type { WdioMultiRemoteElementArray } from '../../src/types.js'

export function matcherNameLastWords(matcherName: string) {
    return matcherName.replace(/^toHave/, '').replace(/^toBe/, '')
        .replace(/([A-Z])/g, ' $1').trim().toLowerCase()
}

export function lastMatcherWords(matcherName: string) {
    return matcherName.replace(/^(toBe|toHave|to)/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase()
}

/**
 * Mocks the resolved value of an element command on one instance of a multi-remote `$()` or of every element of a
 * multi-remote `$$()`, e.g. to make firefox differ from chrome.
 */
export function mockMultiRemoteInstanceCommand(
    subject: WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    instance: string,
    command: 'getText' | 'getAttribute' | 'getProperty' | 'getHTML' | 'getComputedLabel' | 'getComputedRole' | 'getSize' | 'isDisplayed' | 'isExisting' | 'isSelected' | 'isClickable' | 'isFocused' | 'isEnabled',
    value: unknown
) {
    // At runtime, the items of a `MultiRemoteElementArray` are `MultiRemoteElement` too
    const elements = 'getInstance' in subject ? [subject] : Array.from(subject as ArrayLike<WebdriverIO.MultiRemoteElement>)
    for (const element of elements) {
        (element.getInstance(instance)[command] as any).mockResolvedValue(value)
    }
}

/**
 * Mocks the resolved value of an element command on every element of a multi-remote `$$()`, one value per element
 * and per instance, e.g. `{ chrome: ['a', 'b'], firefox: ['c', 'd'] }`.
 */
export function mockMultiRemoteElementsCommand(
    elements: WebdriverIO.MultiRemoteElement[],
    command: Parameters<typeof mockMultiRemoteInstanceCommand>[2],
    valuesPerInstance: Record<string, unknown[]>
) {
    for (const [instance, values] of Object.entries(valuesPerInstance)) {
        values.forEach((value, index) => mockMultiRemoteInstanceCommand(elements[index], instance, command, value))
    }
}
