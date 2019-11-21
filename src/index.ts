let jestExpect = global.expect
let setDefaultOptions = () => {}

const extend = () => {
    if (jestExpect === undefined) {
        try {
            jestExpect = global.expect = require('expect')
        } catch (err) {
            return console.error('Failed to load expect package. Make sure it has been installed: npm i expect')
        }
    }
    if (jestExpect.extend !== undefined) {
        setDefaultOptions = require('./options').setDefaultOptions
        const matchers = require('./matchers').default

        jestExpect.extend({
            ...matchers
        });
    } else {
        return console.error("Unsupported expect library loaded. Only jest's expect is supported.")
    }
}

extend()

export const setOptions = setDefaultOptions
