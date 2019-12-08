const DEFAULT_OPTIONS = {
    wait: 2000,
    interval: 100,
}

let mode: 'jasmine' | 'jest' = 'jest'

let expectLib: SomeExpectLib
if (global.ExpectWebdriverIO) {
    expectLib = global.ExpectWebdriverIO
} else if (global.jasmine) {
    expectLib = global.jasmine
    mode = 'jasmine'
} else {
    expectLib = global.expect!
}

if (!expectLib._expectWebdriverio) {
    expectLib._expectWebdriverio = { options: { ...DEFAULT_OPTIONS }, mode }
}

export const getConfig = () => expectLib._expectWebdriverio

export const setDefaultOptions = (options = {}) => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            expectLib._expectWebdriverio.options[key] = value
        }
    })
}
