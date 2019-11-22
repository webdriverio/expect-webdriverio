export default {
    ...require('./matchers/toBeDisplayed'),
    ...require('./matchers/toBeExisting'),
    ...require('./matchers/toHaveAttribute'),
    ...require('./matchers/toHaveAttributeContaining'),
    ...require('./matchers/toHaveClass'),
    ...require('./matchers/toHaveClassContaining'),
    ...require('./matchers/toHaveProperty'),
    ...require('./matchers/toHaveValue'),
    ...require('./matchers/toHaveValueContaining'),
}
