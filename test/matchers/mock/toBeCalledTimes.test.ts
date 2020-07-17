import { toBeCalledTimes } from '../../../src/matchers/mock/toBeCalledTimes'

class TestMock {
    _calls: any[]

    constructor () {
        this._calls = []
    }
    get calls () {
        return this._calls
    }
    abort () { return Promise.resolve() }
    abortOnce () { return Promise.resolve() }
    respond () { return Promise.resolve() }
    respondOnce () { return Promise.resolve() }
    clear () { return Promise.resolve() }
    restore () { return Promise.resolve() }
}

describe('toBeCalledTimes', () => {
    test('wait for success', async () => {
        const mock: WebdriverIO.Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push('foo')
        }, 10)

        const result = await toBeCalledTimes(mock, 1)
        expect(result.pass).toBe(true)
    })

    test('wait but failure', async () => {
        const mock: WebdriverIO.Mock = new TestMock()
        const result = await toBeCalledTimes(mock, 1)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push('foo')
            mock.calls.push('foo')
        }, 10)

        const result2 = await toBeCalledTimes(mock, 1)
        expect(result2.pass).toBe(false)
        const result3 = await toBeCalledTimes(mock, 2)
        expect(result3.pass).toBe(true)
    })

    test('not to be called', async () => {
        const mock: WebdriverIO.Mock = new TestMock()

        // expect(mock).not.toBeCalledTimes(0) should fail
        const result = await toBeCalledTimes.call({ isNot: true }, mock, 0)
        expect(result.pass).toBe(false)

        // expect(mock).not.toBeCalledTimes(1) should pass
        const result2 = await toBeCalledTimes.call({ isNot: true }, mock, 1)
        expect(result2.pass).toBe(true)

        mock.calls.push('foo')

        // expect(mock).not.toBeCalledTimes(0) should pass
        const result3 = await toBeCalledTimes.call({ isNot: true }, mock, 0)
        expect(result3.pass).toBe(true)

        // expect(mock).not.toBeCalledTimes(1) should fail
        const result4 = await toBeCalledTimes.call({ isNot: true }, mock, 1)
        expect(result4.pass).toBe(false)
    })

    test('message', async () => {
        const mock: WebdriverIO.Mock = new TestMock()

        const result = await toBeCalledTimes(mock, 0)
        expect(result.message()).toContain('Expect mock to be called 0 times')

        const result2 = await toBeCalledTimes(mock, 1)
        expect(result2.message()).toContain('Expect mock to be called 1 time')

        const result3 = await toBeCalledTimes(mock, 2)
        expect(result3.message()).toContain('Expect mock to be called 2 times')
    })
})
