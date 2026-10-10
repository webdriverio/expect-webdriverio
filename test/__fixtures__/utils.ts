
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
    subject: WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElementArray,
    instance: string,
    command: 'getText' | 'getAttribute' | 'getProperty' | 'getHTML' | 'getComputedLabel' | 'getComputedRole' | 'getTagName' | 'getSize' | 'isDisplayed' | 'isExisting' | 'isSelected' | 'isClickable' | 'isFocused' | 'isEnabled' | 'isStable',
    value: unknown
) {
    // At runtime, the items of a `MultiRemoteElementArray` are `MultiRemoteElement` too
    const elements = 'getInstance' in subject ? [subject] : Array.from(subject as unknown as ArrayLike<WebdriverIO.MultiRemoteElement>)
    for (const element of elements) {
        (element.getInstance(instance)[command] as any).mockResolvedValue(value)
    }
}

/**
 * Mocks the resolved value of an element command on every element of a multi-remote `$$()`, one value per element
 * and per instance, e.g. `{ chrome: ['a', 'b'], firefox: ['c', 'd'] }`.
 */
export function mockMultiRemoteElementsCommand(
    elements: WebdriverIO.MultiRemoteElementArray,
    command: Parameters<typeof mockMultiRemoteInstanceCommand>[2],
    valuesPerInstance: Record<string, unknown[]>
) {
    // At runtime, the items of a `MultiRemoteElementArray` are `MultiRemoteElement`
    const multiRemoteElements = elements as unknown as WebdriverIO.MultiRemoteElement[]
    for (const [instance, values] of Object.entries(valuesPerInstance)) {
        values.forEach((value, index) => mockMultiRemoteInstanceCommand(multiRemoteElements[index], instance, command, value))
    }
}
