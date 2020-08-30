import { toBeRequested } from '../../../src/matchers/mock/toBeRequested'
import { Matches } from 'webdriverio'

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

const mockMatch: Matches = {
    body: 'foo',
    url: '/foo/bar',
    method: 'POST',
    headers: {},
    initialPriority: 'Low',
    referrerPolicy: 'origin'
}

describe('toBeRequested', () => {
    test('wait for success', async () => {
        const mock: WebdriverIO.Mock = new TestMock()
        const result = await toBeRequested(mock)
        expect(result.pass).toBe(false)

        setTimeout(() => {
            mock.calls.push(mockMatch)
            mock.calls.push(mockMatch)
        }, 10)

        const result2 = await toBeRequested(mock)
        expect(result2.pass).toBe(true)
    })

    // todo fix #169
    test.skip('not to be called', async () => {
        const mock: WebdriverIO.Mock = new TestMock()

        // expect(mock).not.toBeRequested() should pass
        const result = await toBeRequested.call({ isNot: true }, mock)
        expect(result.pass).toBe(true)

        mock.calls.push(mockMatch)

        // expect(mock).not.toBeRequested() should fail
        const result4 = await toBeRequested.call({ isNot: true }, mock)
        expect(result4.pass).toBe(false)
    })

    test('message', async () => {
        const mock: WebdriverIO.Mock = new TestMock()

        const result = await toBeRequested(mock)
        expect(result.message()).toContain('Expect mock to be called')

        const result2 = await toBeRequested.call({ isNot: true }, mock)
        expect(result2.message()).toContain('Expect mock not to be called')
    })
})
