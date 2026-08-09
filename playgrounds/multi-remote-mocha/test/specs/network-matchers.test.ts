import { multiRemoteBrowser } from '@wdio/globals'

describe('Network Matchers', () => {
    let mocks: WebdriverIO.Mock[]

    before(async function() {
        if(process.env.CI) {
            this.timeout(60000)
        }

        mocks = await multiRemoteBrowser.mock('https://webdriver.io/api/foo', {
            method: 'POST'
        })
        mocks[0].respond({ success: true }, {
            statusCode: 200,
            headers: { Authorization: 'bar' }
        })

        await multiRemoteBrowser.url('https://webdriver.io/')

        await multiRemoteBrowser.execute(async () => {
            await fetch('https://webdriver.io/api/foo', {
                method: 'POST',
                headers: { Authorization: 'foo' },
                body: JSON.stringify({ title: 'foo', description: 'bar' })
            })
        })
    })

    it('should assert on network calls', async () => {
        await expect(mocks[0]).toBeRequestedWith({
            url: 'https://webdriver.io/api/foo',
            method: 'POST'
        })
    })

    it('should work with asymmetric matchers', async () => {
        // Asymmetric matcher as argument
        await expect(mocks[0]).toBeRequestedWith({
            method: 'POST',
            url: expect.stringContaining('/api/foo')
        })

    })

    it('should support inverted wdio expect asymmetric matchers', async () => {
        await expect(
             expect(mocks[0]).toBeRequestedWith({
            method: 'POST',
            url: expect.not.stringContaining('/api/foo'),
        })).rejects.toThrow(
// TODO assert the message one day since the message does not contains the `not`.
//             { message: `\
// Expect mock to be called with

// - Expected  - 1
// + Received  + 1

//   Object {
//     "method": "POST",
// -   "url": "StringContaining \\\"/api/foo\\\"",
// +   "url": "https://webdriver.io/api/foo",
//   }`
//                 }
            )
    })

    it('should assert times called', async () => {
        await expect(mocks[0]).toBeRequestedTimes(1)
    })

    it('should assert times called gte', async () => {
        await expect(mocks[0]).toBeRequestedTimes({ gte: 1 })
    })

    it('should assert times called lte', async () => {
        await expect(mocks[0]).toBeRequestedTimes({ lte: 2 })
    })

    it('should assert times called gte and lte', async () => {
        await expect(mocks[0]).toBeRequestedTimes({ gte: 1, lte: 2 })
    })

    it('should assert times called lte with options', async () => {
        await expect(mocks[0]).toBeRequestedTimes({ lte: 2 }, { wait: 0 })
    })

    it('should assert times called lte with options - deprecated', async () => {
        await expect(mocks[0]).toBeRequestedTimes({ lte: 2, wait: 0 })
    })

    it('should be requested', async () => {
        await expect(mocks[0]).toBeRequested()
    })

    it('should throw an error when asserting not be requested', async () => {
        await expect(expect(mocks[0]).not.toBeRequested()).rejects.toThrow()
    })
})
