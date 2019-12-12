import Matchers from '../src/matchers'

test('matchers', () => {
    expect(Object.keys(Matchers)).toEqual([
        // browser
        'toHaveTitle',
        'toHaveUrl',

        // elements
        'toBeElementsArrayOfSize',

        // elements
        'toBeClickable',
        'toBeDisabled',
        'toBeDisplayed',
        'toBeVisible',
        'toBeDisplayedInViewport',
        'toBeVisibleInViewport',
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
        'toHaveClass',
        'toHaveClassContaining',
        'toHaveHref',
        'toHaveLink',
        'toHaveHrefContaining',
        'toHaveLinkContaining',
        'toHaveId',
        'toHaveProperty',
        'toHaveText',
        'toHaveTextContaining',
        'toHaveValue',
        'toHaveValueContaining',
    ])
})
