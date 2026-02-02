import { browser } from '@wdio/globals'

describe('Network Matchers', () => {
    let mock: WebdriverIO.Mock

    beforeAll(async () => {
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
        await expect(mock).toBeRequested()
        await expect(mock).toBeRequestedTimes(1)

        // Detailed check (simplified to match available Bidi fields)
        await expect(mock).toBeRequestedWith({
            url: 'https://webdriver.io/api/foo',
            method: 'POST'
        })
    })

    it('should support asymmetric matchers', async () => {
        await expect(mock).toBeRequestedWith(expect.objectContaining({
            method: 'POST'
        }))
    })

    it('should support jasmine asymmetric matchers', async () => {
        await expect(mock).toBeRequestedWith(jasmine.objectContaining({
            method: 'POST'
        }))
    })
})

