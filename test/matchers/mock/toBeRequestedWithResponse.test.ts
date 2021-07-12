import { toBeRequestedWithResponse } from '../../../src/matchers/mock/toBeRequestedWithResponse'
import type { Matches, Mock } from 'webdriverio'

class TestMock {
    _calls: Matches[]

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
    waitForResponse () { return Promise.resolve(true) }
}

const mockMatch: Matches = {
    body: JSON.stringify({
        foo: 'bar'
    }),
    url: '/foo/bar',
    method: 'POST',
    headers: {},
    responseHeaders: {},
    statusCode: 200,
    initialPriority: 'Low',
    referrerPolicy: 'origin'
}

const mockMatch2: Matches = {
    body: JSON.stringify({
        bar: 'foo'
    }),
    url: '/foo/bar',
    method: 'POST',
    headers: {},
    responseHeaders: {},
    statusCode: 200,
    initialPriority: 'Low',
    referrerPolicy: 'origin'
}

describe('toBeRequestedWithResponse', () => {
    const consoleWarn = global.console.warn
    beforeEach(() => {
        global.console.warn = jest.fn()
    })
    afterEach(() => {
        global.console.warn = consoleWarn
    })

    test('wait for success', async () => {
        const mock: Mock = new TestMock()

        setTimeout(() => {
            mock.calls.push(mockMatch)
        }, 10)

        const result = await toBeRequestedWithResponse(mock, { foo: 'bar' })
        expect(result.pass).toBe(true)
    })

    test('wait but failure', async () => {
        const mock: Mock = new TestMock()
        const result = await toBeRequestedWithResponse(mock, { foo: 'bar' })
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch2)
        }, 10)

        const result2 = await toBeRequestedWithResponse(mock, { foo: 'foo' })
        expect(result2.pass).toBe(false)
        const result3 = await toBeRequestedWithResponse(mock, { bar: 'foo' })
        expect(result3.pass).toBe(true)
        const result4 = await toBeRequestedWithResponse(mock, { foo: 'bar' })
        expect(result4.pass).toBe(true)
    })

    test('not to be called', async () => {
        const mock: Mock = new TestMock()

        // expect(mock).not.toBeRequestedWithResponse({ foo: 'bar' }) should pass
        const result = await toBeRequestedWithResponse.call({ isNot: true }, mock, { foo: 'bar' })
        expect(result.pass).toBe(true)

        mock.calls.push(mockMatch) // response { foo: 'bar' }

        // expect(mock).not.toBeRequestedWithResponse({ foo: 'foo' }) should pass
        const result2 = await toBeRequestedWithResponse.call({ isNot: true }, mock, { foo: 'foo' })
        expect(result2.pass).toBe(true)

        // expect(mock).not.toBeRequestedWithResponse({ foo: 'bar' }) should fail
        const result3 = await toBeRequestedWithResponse.call({ isNot: true }, mock, { foo: 'bar' })
        expect(result3.pass).toBe(false)

        // expect(mock).not.toBeRequestedWithResponse({ bar: 'foo' }) should pass
        const result4 = await toBeRequestedWithResponse.call({ isNot: true }, mock, { bar: 'foo' })
        expect(result4.pass).toBe(true)

        mock.calls.push(mockMatch2) // response { bar: 'foo' }

        // expect(mock).not.toBeRequestedWithResponse({ foo: 'bar' }) should fail
        const result5 = await toBeRequestedWithResponse.call({ isNot: true }, mock, { foo: 'bar' })
        expect(result5.pass).toBe(false)

        // expect(mock).not.toBeRequestedWithResponse({ bar: 'foo' }) should fail
        const result6 = await toBeRequestedWithResponse.call({ isNot: true }, mock, { bar: 'foo' })
        expect(result6.pass).toBe(false)
    })

    test('message', async () => {
        const mock: Mock = new TestMock()

        const result = await toBeRequestedWithResponse(mock, { foo: 'foo' })
        expect(result.message()).toContain('Expect mock to be called')
    })
})
