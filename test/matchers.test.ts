import { test, expect } from 'vitest'
import Matchers from '../src/matchers.js'

test('matchers', () => {
    expect(Object.keys(Matchers)).toEqual([
        // browser
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
        'toHaveAttribute',
        'toHaveAttr',
        'toHaveAttributeContaining',
        'toHaveAttrContaining',
        'toHaveChildren',
        'toHaveElementClass',
        'toHaveClass',
        'toHaveElementClassContaining',
        'toHaveClassContaining',
        'toHaveHref',
        'toHaveLink',
        'toHaveHrefContaining',
        'toHaveLinkContaining',
        'toHaveId',
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
