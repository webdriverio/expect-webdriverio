const options = {
    wait: 2000,
    interval: 100,
}

const optionsModule = '../src/options'

describe('options', () => {
    describe('getConfig', () => {
        test('expectWdio', () => {
            jest.isolateModules(() => {
                // @ts-ignore
                global.expectWdio = {}
                const { getConfig } = require(optionsModule)

                expect(getConfig()).toEqual({ options, mode: 'jest' })

                delete global.expectWdio
            })
        })

        test('jasmine', () => {
            jest.isolateModules(() => {
                // @ts-ignore
                global.jasmine = {}
                // @ts-ignore
                global.expect.extend = false
                const { getConfig } = require(optionsModule)

                expect(getConfig()).toEqual({ options, mode: 'jasmine' })

                // @ts-ignore
                delete global.jasmine 
                // @ts-ignore
                delete global.expect.extend
            })
        })
        
        test('global', () => {
            jest.isolateModules(() => {
                const { getConfig } = require(optionsModule)
                expect(getConfig()).toEqual({ options, mode: 'jest' })
            })
        })
    })

    describe('setDefaultOptions', () => {
        test('change if valid type', () => {
            jest.isolateModules(() => {
                const { getConfig, setDefaultOptions } = require(optionsModule)
                expect(getConfig()).toEqual({ options, mode: 'jest' })
                setDefaultOptions({wait: 1234})
                expect(getConfig()).toEqual({ options: { ...options, wait: 1234} , mode: 'jest' })
            })
        })
        
        test('no change if invalid type', () => {
            jest.isolateModules(() => {
                const { getConfig, setDefaultOptions } = require(optionsModule)
                expect(getConfig()).toEqual({ options, mode: 'jest' })
                setDefaultOptions({fake_key: "test"})
                expect(getConfig()).toEqual({ options, mode: 'jest' })
            })
        })
    })

    beforeEach(() => {
        delete require.cache[require.resolve(optionsModule)]
        delete expect._expectWebdriverio
    })
})
