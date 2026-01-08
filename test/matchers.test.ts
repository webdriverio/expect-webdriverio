import { test, expect, vi } from 'vitest'
import { matchers, expect as expectLib } from '../src/index.js'

const ALL_MATCHERS = [
    // browser
    'toHaveClipboardText',
    'toHaveTitle',
    'toHaveUrl',

    // element
    'toBeClickable',
    'toBeDisabled',
    'toBeDisplayed',
    'toBeDisplayedInViewport',
    'toBeEnabled',
    'toExist',
    'toBeExisting',
    'toBePresent',
    'toBeFocused',
    'toBeSelected',
    'toBeChecked',
    'toHaveAttributeAndValue',
    'toHaveAttribute',
    'toHaveAttr',
    'toHaveChildren',
    'toHaveClass',
    'toHaveElementClass',
    'toHaveClassContaining',
    'toHaveComputedLabel',
    'toHaveComputedRole',
    'toHaveElementProperty',
    'toHaveHeight',
    'toHaveHref',
    'toHaveLink',
    'toHaveHTML',
    'toHaveId',
    'toHaveSize',
    'toHaveStyle',
    'toHaveText',
    'toHaveValue',
    'toHaveWidth',

    // elements
    'toBeElementsArrayOfSize',

    // mock
    'toBeRequested',
    'toBeRequestedTimes',
    'toBeRequestedWith',
    'toBeRequestedWithResponse',

    // snapshot
    'toMatchSnapshot',
    'toMatchInlineSnapshot'
]

test('matchers', () => {
    expect([...matchers.keys()]).toEqual(ALL_MATCHERS)
})

test('allows to add matcher', () => {
    const matcher: any = vi.fn((actual, expected) => ({ pass: actual === expected }))
    expectLib.extend({ toBeCustom: matcher })

    // @ts-expect-error not in types
    expectLib('foo').toBeCustom('foo')
    expect(matchers.keys()).toContain('toBeCustom')
})

test('Generic asymmetric matchers from Expect library should work', () => {
    expectLib(1).toEqual(expectLib.closeTo(1.0001, 0.0001))
    expectLib(['apple', 'banana', 'cherry']).toEqual(expectLib.arrayOf(expectLib.any(String)))
})
