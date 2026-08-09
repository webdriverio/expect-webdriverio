describe('Network Matchers', () => {
    // TODO multie-remote network failure as below, issue entered alreadu in wdio
    // Error: Timeout
    // at listOnTimeout (node:internal/timers:605:17)
    // at process.processTimers (node:internal/timers:541:7)
    it.skip('should assert on network calls', async () => {
        const mock = await standalone.mock('https://webdriver.io/api/foo', {
            method: 'POST'
        })
        mock.respond({ success: true }, {
            statusCode: 200,
            headers: { Authorization: 'bar' }
        })

        await standalone.url('https://webdriver.io/')

        await standalone.execute(async () => {
            await fetch('https://webdriver.io/api/foo', {
                method: 'POST',
                headers: { Authorization: 'foo' },
                body: JSON.stringify({ title: 'foo', description: 'bar' })
            })
        })

        await expect(mock).toBeRequested()
        await expect(mock).toBeRequestedTimes(1)

        // Detailed check (simplified to match available Bidi fields)
        await expect(mock).toBeRequestedWith({
            url: 'https://webdriver.io/api/foo',
            method: 'POST'
        })

        // Asymmetric matcher as argument
        await expect(mock).toBeRequestedWith({
            method: 'POST',
            url: expect.stringContaining('/api/foo')
        })
    })
})
