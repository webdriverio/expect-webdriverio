const options = {
    wait: 2000,
    interval: 100,
}

describe('options', () => {
    describe('getConfig', () => {
        test('expectWdio', () => {
            // @ts-ignore
            global.expectWdio = {}
            const { getConfig } = require('../src/options')

            expect(getConfig()).toEqual({ options, mode: 'jest' })

            delete global.expectWdio
        })
    })

    describe('setDefaultOptions', () => {
        const { getConfig, setDefaultOptions } = require('../src/options')

        test('bar', () => {

        })
    })

    afterEach(() => {
        delete expect._expectWebdriverio
    })
})
