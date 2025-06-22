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

    // snapshot
    'toMatchSnapshot',
    'toMatchInlineSnapshot'
]

test('matchers', () => {
    expect([...matchers.keys()]).toEqual(ALL_MATCHERS)
})

test('allows to add matcher', () => {
    const matcher: any = vi.fn((actual: any, expected: any) => ({ pass: actual === expected }))
    expectLib.extend({ toBeCustom: matcher })

    // TODO dprevost see later if we really the below to expect a ts error since it is not working anymore...
    //// @ts-expect-error not in types
    expectLib('foo').toBeCustom('foo')
    expect(matchers.keys()).toContain('toBeCustom')
})