const DEFAULT_OPTIONS = {
    wait: 2000,
    interval: 100,
}

let mode: 'jasmine' | 'jest' = 'jest'

let expectLib: SomeExpectLib
// @ts-ignore
if (global.expectWdio) {
    // @ts-ignore
    expectLib = global.expectWdio
    // @ts-ignore
} else if (global.jasmine && !global.expect?.extend) {
    // @ts-ignore
    expectLib = global.jasmine
    mode = 'jasmine'
} else {
    // @ts-ignore
    expectLib = global.expect as SomeExpectLib
}

if (!expectLib._expectWebdriverio) {
    expectLib._expectWebdriverio = { options: { ...DEFAULT_OPTIONS }, mode }
}

export const getConfig = (): any => expectLib._expectWebdriverio

export const setDefaultOptions = (options = {}): void => {
    Object.entries(options).forEach(([key, value]) => {
        if (key in DEFAULT_OPTIONS) {
            // @ts-ignore
            expectLib._expectWebdriverio.options[key] = value
        }
    })
}
