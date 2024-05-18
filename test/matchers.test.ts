import { test, expect, vi } from 'vitest'
import { matchers, expect as expectLib } from '../src/index.js'

const ALL_MATCHERS = [
    // browser
    'toHaveClipboardText',
    'toHaveTitle',
    'toHaveUrl',

    // elements
    'toBeElementsArrayOfSize',

    // elements
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
    'toHaveAttrContaining',
    'toHaveAttr',
    'toHaveChildren',
    'toHaveClass',
    'toHaveElementClass',
    'toHaveClassContaining',
    'toHaveHref',
    'toHaveLink',
    'toHaveLinkContaining',
    'toHaveHTML',
    'toHaveHTMLContaining',
    'toHaveId',
    'toHaveSize',
    'toHaveElementProperty',
    'toHaveText',
    'toHaveTextContaining',
    'toHaveValue',
    'toHaveStyle',

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
    const matcher: any = vi.fn((actual: any, expected: any) => ({ pass: actual === expected }))
    expectLib.extend({ toBeCustom: matcher })
    // @ts-expect-error not in types
    expectLib('foo').toBeCustom('foo')
    expect(matchers.keys()).toContain('toBeCustom')
})
