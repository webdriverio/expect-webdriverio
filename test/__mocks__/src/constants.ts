import { vi } from 'vitest'

/**
 * Mock the default options to have a smaller wait and interval time for tests
 */
vi.mock('../../../src/constants.js', async (importOriginal) => {

    const actual = await importOriginal<typeof import('../../../src/constants.js')>()
    const DEFAULT_OPTIONS = {
        ...actual.DEFAULT_OPTIONS,
        wait: 20,
        interval: 1
    }
    const DEFAULT_OPTIONS_TO_BE_DISPLAYED = {
        ...actual.DEFAULT_OPTIONS_TO_BE_DISPLAYED,
        wait: 20,
        interval: 1
    }
    return {
        ...actual,
        DEFAULT_OPTIONS,
        DEFAULT_OPTIONS_TO_BE_DISPLAYED,
        defaultOptionsList: [
            DEFAULT_OPTIONS,
            DEFAULT_OPTIONS_TO_BE_DISPLAYED
        ]
    }
})
