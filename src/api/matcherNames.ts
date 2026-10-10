/**
 * The names of the matchers and asymmetric matchers of expect-webdriverio, for the packages that must know them before
 * `expect` exists, e.g. `@wdio/globals` or a lint rule. This file imports nothing, so it is cheap to load.
 * `test/api.test.ts` keeps these lists equal to the matchers of `expect`.
 */

/**
 * The names of `wdioCustomMatchers`: the matchers that expect-webdriverio adds with `expect.extend()`, not the ones of the `expect` package.
 * Each one returns a promise, except `toMatchSnapshot` and `toMatchInlineSnapshot` when the received value is not an element, a list of elements or a promise.
 */
export const wdioCustomMatcherNames = [
    'toBeChecked',
    'toBeClickable',
    'toBeDisabled',
    'toBeDisplayed',
    'toBeDisplayedInViewport',
    'toBeElementsArrayOfSize',
    'toBeEnabled',
    'toBeExisting',
    'toBeFocused',
    'toBePresent',
    'toBeRequested',
    'toBeRequestedTimes',
    'toBeRequestedWith',
    'toBeSelected',
    'toBeStable',
    'toExist',
    'toHaveAttribute',
    'toHaveChildren',
    'toHaveClipboardText',
    'toHaveComputedLabel',
    'toHaveComputedRole',
    'toHaveCookie',
    'toHaveElementClass',
    'toHaveElementProperty',
    'toHaveHTML',
    'toHaveHeight',
    'toHaveHref',
    'toHaveId',
    'toHaveLink',
    'toHaveLocalStorageItem',
    'toHaveSize',
    'toHaveStyle',
    'toHaveTagName',
    'toHaveText',
    'toHaveTitle',
    'toHaveUrl',
    'toHaveValue',
    'toHaveWidth',
    'toMatchInlineSnapshot',
    'toMatchSnapshot',
] as const

/**
 * The asymmetric matchers on `expect`: the ones of the `expect` package, and `oneOf` and `multiRemote`.
 * Not the asymmetric form of each matcher that `expect.extend()` adds: it does not work for the matchers of expect-webdriverio (they are async, and the snapshot matchers compare or write a snapshot).
 */
export const asymmetricMatcherNames = [
    'any',
    'anything',
    'arrayContaining',
    'arrayOf',
    'closeTo',
    'objectContaining',
    'stringContaining',
    'stringMatching',
    'oneOf',
    'multiRemote',
] as const

/**
 * The asymmetric matchers on `expect.not`, without the asymmetric form of the matchers that `expect.extend()` adds.
 */
export const inverseAsymmetricMatcherNames = [
    'arrayContaining',
    'arrayOf',
    'closeTo',
    'objectContaining',
    'stringContaining',
    'stringMatching',
] as const
