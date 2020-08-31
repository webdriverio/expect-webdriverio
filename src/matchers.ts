const matchers = {
    // browser
    ...require('./matchers/browser/toHaveTitle'),
    ...require('./matchers/browser/toHaveTitleContaining'),
    ...require('./matchers/browser/toHaveUrl'),
    ...require('./matchers/browser/toHaveUrlContaining'),

    // ElementArray $$
    ...require('./matchers/elements/toBeElementsArrayOfSize'),

    // Element $ or ElementArray $$
    ...require('./matchers/element/toBeClickable'),
    ...require('./matchers/element/toBeDisabled'),
    ...require('./matchers/element/toBeDisplayed'),
    ...require('./matchers/element/toBeDisplayedInViewport'),
    ...require('./matchers/element/toBeEnabled'),
    ...require('./matchers/element/toBeExisting'),
    ...require('./matchers/element/toBeFocused'),
    ...require('./matchers/element/toBeSelected'),
    ...require('./matchers/element/toHaveAttribute'),
    ...require('./matchers/element/toHaveAttributeContaining'),
    ...require('./matchers/element/toHaveChildren'),
    ...require('./matchers/element/toHaveElementClass'),
    ...require('./matchers/element/toHaveElementClassContaining'),
    ...require('./matchers/element/toHaveHref'),
    ...require('./matchers/element/toHaveHrefContaining'),
    ...require('./matchers/element/toHaveId'),
    ...require('./matchers/element/toHaveElementProperty'),
    ...require('./matchers/element/toHaveText'),
    ...require('./matchers/element/toHaveTextContaining'),
    ...require('./matchers/element/toHaveValue'),
    ...require('./matchers/element/toHaveValueContaining'),

    // Mock
    ...require('./matchers/mock/toBeRequested'),
    ...require('./matchers/mock/toBeRequestedTimes'),
    ...require('./matchers/mock/toBeRequestedWithResponse'),
}

// avoid exporting internal functions
Object.keys(matchers).forEach(key => {
    if (key.endsWith('Fn')) {
        delete matchers[key]
    }
})

export default matchers
