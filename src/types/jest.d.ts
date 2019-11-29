declare namespace NodeJS {
    interface Global {
        expect: jest.Expect
    }
}

declare namespace jest {
    interface Expect {
        _expectWebdriverioOptions: {
            wait?: number
            interval?: number
            message?: string
        }
    }
}
