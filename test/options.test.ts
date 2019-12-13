const options = {
    wait: 2000,
    interval: 100,
}

const optionsModule = '../src/options'

describe('options', () => {
    describe('getConfig', () => {
        test('expectWdio', () => {
            // @ts-ignore
            global.expectWdio = {}
            const { getConfig } = require(optionsModule)

            expect(getConfig()).toEqual({ options, mode: 'jest' })

            delete global.expectWdio
        })
    })

    describe('setDefaultOptions', () => {
        test('bar', () => {
            const { getConfig, setDefaultOptions } = require(optionsModule)

        })
    })

    beforeEach(() => {
        delete require.cache[require.resolve(optionsModule)]
        delete expect._expectWebdriverio
    })
})
