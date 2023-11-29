import { test, expect } from 'vitest'
import Matchers from '../src/matchers.js'

test('matchers', () => {
    expect(Object.keys(Matchers)).toEqual([
        // general
        "toMatchSnapshot",
        "toMatchInlineSnapshot",
        // browser
        'toHaveClipboardText',
        'toHaveClipboardTextContaining',
        'toHaveTitle',
        'toHaveTitleContaining',
        'toHaveUrl',
        'toHaveUrlContaining',

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
        'toHaveAttributeContaining',
        'toHaveAttrContaining',
        'toHaveAttr',
        'toHaveChildren',
        'toHaveClass',
        'toHaveElementClass',
        'toHaveElementClassContaining',
        'toHaveClassContaining',
        'toHaveHref',
        'toHaveLink',
        'toHaveHrefContaining',
        'toHaveLinkContaining',
        'toHaveId',
        'toHaveSize',
        'toHaveElementProperty',
        'toHaveText',
        'toHaveTextContaining',
        'toHaveValue',
        'toHaveValueContaining',
        'toHaveStyle',

        // mock
        'toBeRequested',
        'toBeRequestedTimes',
        'toBeRequestedWith',
        'toBeRequestedWithResponse'
    ])
})
