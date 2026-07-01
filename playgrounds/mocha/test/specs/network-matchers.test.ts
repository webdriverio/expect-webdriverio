import { browser } from '@wdio/globals'

describe('Network Matchers', () => {
    let mock: WebdriverIO.Mock

    before(async () => {
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
})
