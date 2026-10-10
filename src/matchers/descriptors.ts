/**
 * The matchers made from a getter of WebdriverIO, as data: the factories of `getterMatcher.ts` make each
 * matcher from its descriptor. Only the descriptor of a matcher differs, so these matchers behave the same way.
 */

/**
 * Each getter of a table gives a `Promise<Value>` with no required argument, e.g. `getText` gives a string. Else its entry has the type of the
 * error. A type over all the keys of `WebdriverIO.Element` gives `any`, with no error: TypeScript stops on the size of the
 * type. So the descriptor types the name only (`keyof`), and this type checks the getters of the table, one by one.
 */
type GettersGive<Table extends Record<string, { getter: keyof Target, argument?: unknown }>, Target, Value> = {
    // `() =>`: the getter has no required argument, e.g. not `isEqual(element)`. An optional one is fine: `getHTML(options?)`.
    // With an `argument`, the getter takes one string and can give `null`, e.g. `getAttribute(name)` for a missing attribute
    [Name in keyof Table]: Target[Table[Name]['getter']] extends (Table[Name] extends { argument: unknown } ? (argument: string) => Promise<Value | null> : () => Promise<Value>)
        ? Table[Name]
        : `${Name & string}: ${Table[Name]['getter'] & string} does not give the value type`
}

export type ElementStringGetterDescriptor = {
    /** The command of the element that gives the actual value */
    getter: keyof WebdriverIO.Element
    /** The value in the failure message, e.g. `text` in `Expect $(`sel`) to have text` */
    expectation: string
    /** The getter gets the options of the matcher, e.g. `getHTML({ includeSelectorTag: false })` */
    getterGetsOptions?: true
    /**
     * The argument of the getter: given in the call, before the expected value (`toHaveAttribute(name, value)`, and with no
     * value, the attribute exists), or fixed (`toHaveId` is `getAttribute('id')`)
     */
    argument?: 'fromCall' | { fixed: string }
    /** The failure message names the argument, e.g. `id` in `Expect $(`sel`) to have attribute id` */
    argumentInMessage?: true
    /** A class value: the attribute has classes separated by ASCII whitespace, and the matcher compares each class */
    value?: 'class'
}

export type BrowserStringGetterDescriptor = {
    /** The command of the browser or the browsing context that gives the actual value */
    getter: keyof WebdriverIO.Browser & keyof WebdriverIO.BrowsingContext
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
    toHaveAttribute: { getter: 'getAttribute', expectation: 'attribute', argument: 'fromCall', argumentInMessage: true },
    toHaveId: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'id' }, argumentInMessage: true },
    toHaveHref: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'href' }, argumentInMessage: true },
    toHaveLink: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'href' }, argumentInMessage: true },
    toHaveElementClass: { getter: 'getAttribute', expectation: 'class', argument: { fixed: 'class' }, value: 'class' },
} as const satisfies Record<string, ElementStringGetterDescriptor>
elementStringGetters satisfies GettersGive<typeof elementStringGetters, WebdriverIO.Element, string>

/** The string matchers of the browser, a browsing context and the multi-remote browser */
export const browserStringGetters = {
    toHaveTitle: { getter: 'getTitle', expectation: 'title' },
    toHaveUrl: { getter: 'getUrl', expectation: 'url', showContextUrl: false },
} as const satisfies Record<string, BrowserStringGetterDescriptor>
browserStringGetters satisfies GettersGive<typeof browserStringGetters, WebdriverIO.Browser, string>
browserStringGetters satisfies GettersGive<typeof browserStringGetters, WebdriverIO.BrowsingContext, string>

export type ElementBooleanGetterDescriptor = {
    /** The command of the element that gives the actual value */
    getter: keyof WebdriverIO.Element
    /** The state in the failure message, e.g. `displayed` in `Expect $(`sel`) to be displayed` */
    expectation: string
    /** The verb in the failure message, when it is not `be`, e.g. `Expect $(`sel`) to exist` */
    verb?: string
    /** The matcher checks the opposite of the getter, e.g. `toBeDisabled` with `isEnabled` */
    inverse?: true
    /** The argument of the getter, e.g. `isDisplayed({ withinViewport: true })` */
    getterArgument?: object
    /** The getter gets the display options of the matcher and their defaults, the command options get the rest */
    displayOptions?: true
    /** An empty `$$()` passes with `.not`: no element means it does not exist */
    allowEmptyElements?: true
    /** Another name of a matcher: its state and verb replace the ones of the context */
    aliasOf?: string
}

/** The boolean matchers of `$()`, `$$()` and multi-remote elements */
export const elementBooleanGetters = {
    toBeDisplayed: { getter: 'isDisplayed', expectation: 'displayed', displayOptions: true },
    toBeDisplayedInViewport: { getter: 'isDisplayed', expectation: 'displayed in viewport', getterArgument: { withinViewport: true } },
    toBeClickable: { getter: 'isClickable', expectation: 'clickable' },
    toBeEnabled: { getter: 'isEnabled', expectation: 'enabled' },
    toBeDisabled: { getter: 'isEnabled', expectation: 'disabled', inverse: true },
    toBeFocused: { getter: 'isFocused', expectation: 'focused' },
    toBeSelected: { getter: 'isSelected', expectation: 'selected' },
    toBeChecked: { getter: 'isSelected', expectation: 'checked', aliasOf: 'toBeSelected' },
    toExist: { getter: 'isExisting', expectation: 'exist', verb: '', allowEmptyElements: true },
    toBeExisting: { getter: 'isExisting', expectation: 'existing', verb: 'be', allowEmptyElements: true, aliasOf: 'toExist' },
    toBePresent: { getter: 'isExisting', expectation: 'present', verb: 'be', allowEmptyElements: true, aliasOf: 'toExist' },
} as const satisfies Record<string, ElementBooleanGetterDescriptor>
elementBooleanGetters satisfies GettersGive<typeof elementBooleanGetters, WebdriverIO.Element, boolean>
