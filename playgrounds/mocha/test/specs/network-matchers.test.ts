import { browser } from '@wdio/globals'

describe('Network Matchers', () => {
    let mock: WebdriverIO.Mock

    before(async function() {
        if(process.env.CI) {
            this.timeout(60000)
        }

        mock = await browser.mock('https://webdriver.io/api/foo', {
            method: 'POST'
        })
        mock.respond({ success: true }, {
            statusCode: 200,
            headers: { Authorization: 'bar' }
        })

        await browser.url('https://webdriver.io/')

        await browser.execute(async () => {
            await fetch('https://webdriver.io/api/foo', {
                method: 'POST',
                headers: { Authorization: 'foo' },
                body: JSON.stringify({ title: 'foo', description: 'bar' })
            })
        })
    })

    it('should assert on network calls', async () => {
        await expect(mock).toBeRequestedWith({
            url: 'https://webdriver.io/api/foo',
            method: 'POST'
        })
    })

    it('should work with asymmetric matchers', async () => {
        // Asymmetric matcher as argument
        await expect(mock).toBeRequestedWith({
            method: 'POST',
            url: expect.stringContaining('/api/foo')
        })

    })

    it('should support inverted wdio expect asymmetric matchers', async () => {
        await expect(
             expect(mock).toBeRequestedWith({
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
        await expect(mock).toBeRequestedTimes(1)
    })

    it('should assert times called gte', async () => {
        await expect(mock).toBeRequestedTimes({ gte: 1 })
    })

    it('should assert times called lte', async () => {
        await expect(mock).toBeRequestedTimes({ lte: 2 })
    })

    it('should assert times called gte and lte', async () => {
        await expect(mock).toBeRequestedTimes({ gte: 1, lte: 2 })
    })

    it('should assert times called lte with options', async () => {
        await expect(mock).toBeRequestedTimes({ lte: 2 }, { wait: 0 })
    })

    it('should assert times called lte with options - deprecated', async () => {
        await expect(mock).toBeRequestedTimes({ lte: 2, wait: 0 })
    })

    it('should be requested', async () => {
        await expect(mock).toBeRequested()
    })

    it('should throw an error when asserting not be requested', async () => {
        await expect(expect(mock).not.toBeRequested()).rejects.toThrow()
    })

    /**
     * `postData`/`response` were silently ignored before #2184 - any assertion on them passed
     * regardless of the real payload. These cover the restored comparison end-to-end.
     *
     * Note: `mock.calls[n].body` is the *upstream* response, not `mock.respond()`'s override
     * (respond changes what the page receives; the collector still records what the server sent).
     * So `response` is asserted structurally rather than against the mocked value.
     */
    it('should assert on postData', async () => {
        await expect(mock).toBeRequestedWith({
            method: 'POST',
            postData: { title: 'foo', description: 'bar' }
        })
    })

    it('should assert on postData with an asymmetric matcher', async () => {
        await expect(mock).toBeRequestedWith({
            postData: expect.objectContaining({ title: 'foo' })
        })
    })

    it('should assert on postData with a function matcher', async () => {
        await expect(mock).toBeRequestedWith({
            postData: (postData) => typeof postData === 'string' && postData.includes('description')
        })
    })

    it('should FAIL when postData does not match', async () => {
        // the regression guard: this silently passed before the fix
        await expect(
            expect(mock).toBeRequestedWith({ postData: { title: 'WRONG' } })
        ).rejects.toThrow()
    })

    it('should FAIL when postData is expected but the request had none', async () => {
        const getMock = await browser.mock('https://webdriver.io/**', { method: 'GET' })
        await browser.url('https://webdriver.io/')
        await expect(
            expect(getMock).toBeRequestedWith({ postData: { any: 'thing' } })
        ).rejects.toThrow()
    })

    it('should assert that a response body was collected', async () => {
        await expect(mock).toBeRequestedWith({
            response: (response) => typeof response === 'string' && response.length > 0
        })
    })

    it('should FAIL when response does not match', async () => {
        await expect(
            expect(mock).toBeRequestedWith({ response: { definitely: 'not-this' } })
        ).rejects.toThrow()
    })
})
