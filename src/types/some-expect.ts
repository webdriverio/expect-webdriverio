/**
 * INTERNAL USAGE ONLY
 */

declare namespace NodeJS {
    interface Global {
        expect?: SomeExpectLib
        jasmine?: SomeExpectLib
        expectAsync?: {}
        expectWdio: SomeExpectLib
    }
}

declare namespace jest {
    interface Expect {
        _expectWebdriverio?: any
    }
}

interface SomeExpectLib {
    extend?: Function

    addMatchers?: Function
    addAsyncMatchers?: Function
    getEnv?: Function

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
