import { test, expect } from 'vitest'
import { matchers } from '../src/index.js'

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
    'toBeRequestedTimes'
]

test('matchers', () => {
    expect([...matchers.keys()]).toEqual(ALL_MATCHERS)
})
