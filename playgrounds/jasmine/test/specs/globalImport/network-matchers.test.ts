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

    describe('expect assertions (global)', () => {
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
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: expect.stringContaining('/api/foo'),
                requestHeaders: expect.objectContaining({
                    Authorization: 'foo'
                }),
                postData: expect.objectContaining({
                    title: 'foo'
                })
            })
        })

        it('should support string matching asymmetric matchers', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: expect.stringMatching(/\/api\/foo$/),
            })
        })
    })

    describe('jasmine assertions', () => {

        it('should support jasmine stringContaining & objectContaining asymmetric matchers', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: jasmine.stringContaining('/api/foo'),
                requestHeaders: jasmine.objectContaining({
                    Authorization: 'foo'
                }),
                postData: jasmine.objectContaining({
                    title: 'foo'
                })
            })
        })

        it('should support jasmine any & anything asymmetric matchers', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: jasmine.any(String),
                requestHeaders: jasmine.anything(),
            })
        })

        it('should support jasmine stringMatching asymmetric matchers', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: jasmine.stringMatching(/\/api\/foo$/),
            })
        })

        // Cannot be asserted so excluded and run on demand
        xit('should support jasmine asymmetric matchers stringContaining with failures', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: jasmine.stringContaining('/api/foo1'),
            });
        })

        // Cannot be asserted so excluded and run on demand
        xit('should support jasmine asymmetric matchers objectContaining with failures', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                requestHeaders: jasmine.objectContaining({
                    Authorization: 'foo1'
                })
            });
        })

        // Cannot be asserted so excluded and run on demand
        xit('should support jasmine asymmetric matchers stringMatching with failures', async () => {
            await expect(mock).toBeRequestedWith({
                method: 'POST',
                url: jasmine.stringMatching(/\/api\/foo1$/),
            });
        })
    })
})

