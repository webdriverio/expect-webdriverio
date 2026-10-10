/**
 * The matchers made from a getter of WebdriverIO, as data: the factories of `getterMatcher.ts` make each
 * matcher from its descriptor. Only the descriptor of a matcher differs, so these matchers behave the same way.
 */

/**
 * Each getter of a table gives a `Promise<Value>` with no required argument, e.g. `getText` gives a string. Else its entry has the type of the
 * error. A type over all the keys of `WebdriverIO.Element` gives `any`, with no error: TypeScript stops on the size of the
 * type. So the descriptor types the name only (`keyof`), and this type checks the getters of the table, one by one.
 */
type GettersGive<Table extends Record<string, { getter: keyof Target, argument?: unknown, value?: unknown }>, Target, Value> = {
    // `() =>`: the getter has no required argument, e.g. not `isEqual(element)`. An optional one is fine: `getHTML(options?)`.
    // With an `argument`, the getter takes one string and can give `null`, e.g. `getAttribute(name)` for a missing attribute.
    // A `property` can be any value
    [Name in keyof Table]: Target[Table[Name]['getter']] extends (Table[Name] extends { value: 'localStorageItem' | 'clipboardText' }
        // A page script: `execute(script, ...args)`
        ? (script: never, ...args: never[]) => Promise<unknown>
        : Table[Name] extends { argument: unknown }
            ? Table[Name] extends { value: 'cookie' }
                // A cookie getter takes a filter with the name, and gives the cookies
                ? (filter: { name: string }) => Promise<Array<{ name: string, value: string }>>
                : (argument: string) => Promise<(Table[Name] extends { value: 'property' } ? unknown : Value) | null>
            : () => Promise<Value>)
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
    /**
     * The value type, when it is not a string:
     * - `class`: the attribute has classes separated by ASCII whitespace, and the matcher compares each class;
     * - `property`: a string property is compared as a string, another value (a number, an object, an array) with
     *   `equals()`, or as its text with the `asString` option. A property can be an object or an array, so a plain object
     *   is a value, not per-instance values, and a list matcher on `$()` compares the property.
     */
    value?: 'class' | 'property'
    /** A `property` that is a string (`value`): a plain object is per-instance values, and a list matcher needs `$$()` */
    expectsString?: true
}

export type BrowserStringGetterDescriptor = {
    /** The command of the browser or the browsing context that gives the actual value */
    getter: keyof WebdriverIO.Browser & keyof WebdriverIO.BrowsingContext
    /** The value in the failure message, e.g. `title` in `Expect browser's window to have title` */
    expectation: string
    /** `false`: the failure message does not show the URL of the browsing context, e.g. when the URL is the value */
    showContextUrl?: false
    /** The argument of the getter, given in the call before the expected value: `toHaveCookie(name, value)`; no value: it exists */
    argument?: 'fromCall'
    /** The failure message names the argument, e.g. `lang` in `Expect browser to have cookie lang` */
    argumentInMessage?: true
    /**
     * How the value is read, when it is not the result of the getter:
     * - `cookie`: the getter gives the cookies with the name of the argument, and the value is the one of the cookie;
     * - `localStorageItem`: `execute()` reads the item of `localStorage` with the name of the argument;
     * - `clipboardText`: `execute()` reads the clipboard of the page, after the permission `clipboard-read` of the session.
     */
    value?: 'cookie' | 'localStorageItem' | 'clipboardText'
    /** The text of a value that does not exist, in the failure message, e.g. `Received: no cookie` */
    missing?: string
    /** `browser`: the message names the browser, not its window, e.g. `Expect browser to have cookie lang` */
    target?: 'browser'
}

/** The string matchers of `$()`, `$$()` and multi-remote elements */
export const elementStringGetters = {
    toHaveText: { getter: 'getText', expectation: 'text' },
    toHaveHTML: { getter: 'getHTML', expectation: 'HTML', getterGetsOptions: true },
    toHaveComputedLabel: { getter: 'getComputedLabel', expectation: 'computed label' },
    toHaveComputedRole: { getter: 'getComputedRole', expectation: 'computed role' },
    toHaveTagName: { getter: 'getTagName', expectation: 'tag name' },
    toHaveAttribute: { getter: 'getAttribute', expectation: 'attribute', argument: 'fromCall', argumentInMessage: true },
    toHaveId: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'id' }, argumentInMessage: true },
    toHaveHref: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'href' }, argumentInMessage: true },
    toHaveLink: { getter: 'getAttribute', expectation: 'attribute', argument: { fixed: 'href' }, argumentInMessage: true },
    toHaveElementClass: { getter: 'getAttribute', expectation: 'class', argument: { fixed: 'class' }, value: 'class' },
    toHaveElementProperty: { getter: 'getProperty', expectation: 'property', argument: 'fromCall', argumentInMessage: true, value: 'property' },
    toHaveValue: { getter: 'getProperty', expectation: 'property', argument: { fixed: 'value' }, argumentInMessage: true, value: 'property', expectsString: true },
} as const satisfies Record<string, ElementStringGetterDescriptor>
elementStringGetters satisfies GettersGive<typeof elementStringGetters, WebdriverIO.Element, string>

/** The string matchers of the browser, a browsing context and the multi-remote browser */
export const browserStringGetters = {
    toHaveTitle: { getter: 'getTitle', expectation: 'title' },
    toHaveUrl: { getter: 'getUrl', expectation: 'url', showContextUrl: false },
    toHaveCookie: { getter: 'getCookies', expectation: 'cookie', argument: 'fromCall', argumentInMessage: true, value: 'cookie', missing: 'no cookie', target: 'browser' },
    toHaveLocalStorageItem: { getter: 'execute', expectation: 'localStorage item', argument: 'fromCall', argumentInMessage: true, value: 'localStorageItem', missing: 'no item', target: 'browser' },
    toHaveClipboardText: { getter: 'execute', expectation: 'clipboard text', value: 'clipboardText', target: 'browser' },
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
    toBeStable: { getter: 'isStable', expectation: 'stable' },
    toExist: { getter: 'isExisting', expectation: 'exist', verb: '', allowEmptyElements: true },
    toBeExisting: { getter: 'isExisting', expectation: 'existing', verb: 'be', allowEmptyElements: true, aliasOf: 'toExist' },
    toBePresent: { getter: 'isExisting', expectation: 'present', verb: 'be', allowEmptyElements: true, aliasOf: 'toExist' },
} as const satisfies Record<string, ElementBooleanGetterDescriptor>
elementBooleanGetters satisfies GettersGive<typeof elementBooleanGetters, WebdriverIO.Element, boolean>

export type ElementNumberGetterDescriptor = {
    /** The command of the element that gives the actual value */
    getter: keyof WebdriverIO.Element
    /** The value in the failure message, e.g. `width` in `Expect $(`sel`) to have width` */
    expectation: string
    /** A fixed argument of the getter, e.g. `toHaveWidth` is `getSize('width')` */
    argument?: { fixed: string }
    /** A size: an object with a number value type in each field (`width`, `height`), compared with deep equality */
    value?: 'size'
}

/** The number matchers of `$()`, `$$()` and multi-remote elements, made from a getter */
export const elementNumberGetters = {
    toHaveWidth: { getter: 'getSize', expectation: 'width', argument: { fixed: 'width' } },
    toHaveHeight: { getter: 'getSize', expectation: 'height', argument: { fixed: 'height' } },
    toHaveSize: { getter: 'getSize', expectation: 'size', value: 'size' },
} as const satisfies Record<string, ElementNumberGetterDescriptor>

/** Each getter gives a number with its fixed argument (`getSize('width')`), or a size with no argument (`getSize()`) */
type NumberGettersGive<Table extends Record<string, { getter: keyof WebdriverIO.Element, argument?: { fixed: string } }>> = {
    [Name in keyof Table]: WebdriverIO.Element[Table[Name]['getter']] extends (Table[Name] extends { argument: { fixed: infer Argument } }
        ? (argument: Argument) => Promise<number>
        : () => Promise<{ width: number, height: number }>)
        ? Table[Name]
        : `${Name & string}: ${Table[Name]['getter'] & string} does not give the value type`
}
elementNumberGetters satisfies NumberGettersGive<typeof elementNumberGetters>
