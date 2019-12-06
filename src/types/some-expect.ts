/**
 * INTERNAL USAGE ONLY
 */

declare namespace NodeJS {
    interface Global {
        expect?: SomeExpectLib
        jasmine?: SomeExpectLib
        expectAsync?: {}
        ExpectWebdriverIO: SomeExpectLib
    }
}

interface SomeExpectLib {
    addMatchers?: Function
    addAsyncMatchers?: Function
    extend?: Function

    _expectWebdriverio: {
        options: {
            wait?: number
            interval?: number
            message?: string
        }
        mode: 'jest' | 'jasmine'
    }
}

interface JestExpectationResult {
    pass: boolean
    message: () => string
}
