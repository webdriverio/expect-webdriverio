/**
 * The matchers made from a getter of WebdriverIO, as data: the factories of `getterMatcher.ts` make each
 * matcher from its descriptor. Only the descriptor of a matcher differs, so these matchers behave the same way.
 */

/** A command that gives a string, e.g. `getText` */
type StringGetter<Target> = {
    [K in keyof Target]: Target[K] extends (...args: never[]) => Promise<string> ? K : never
}[keyof Target] & string

export type ElementStringGetterDescriptor = {
    /** The command of the element that gives the actual value */
    getter: StringGetter<WebdriverIO.Element>
    /** The value in the failure message, e.g. `text` in `Expect $(`sel`) to have text` */
    expectation: string
    /** The getter gets the options of the matcher, e.g. `getHTML({ includeSelectorTag: false })` */
    getterGetsOptions?: true
}

export type BrowserStringGetterDescriptor = {
    /** The command of the browser or the browsing context that gives the actual value */
    getter: StringGetter<WebdriverIO.Browser> & StringGetter<WebdriverIO.BrowsingContext>
    /** The value in the failure message, e.g. `title` in `Expect browser's window to have title` */
    expectation: string
    /** `false`: the failure message does not show the URL of the browsing context, e.g. when the URL is the value */
    showContextUrl?: false
}

/** The string matchers of `$()`, `$$()` and multi-remote elements */
export const elementStringGetters = {
    toHaveText: { getter: 'getText', expectation: 'text' },
    toHaveHTML: { getter: 'getHTML', expectation: 'HTML', getterGetsOptions: true },
    toHaveComputedLabel: { getter: 'getComputedLabel', expectation: 'computed label' },
    toHaveComputedRole: { getter: 'getComputedRole', expectation: 'computed role' },
} as const satisfies Record<string, ElementStringGetterDescriptor>

/** The string matchers of the browser, a browsing context and the multi-remote browser */
export const browserStringGetters = {
    toHaveTitle: { getter: 'getTitle', expectation: 'title' },
    toHaveUrl: { getter: 'getUrl', expectation: 'url', showContextUrl: false },
} as const satisfies Record<string, BrowserStringGetterDescriptor>
