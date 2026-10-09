describe('Soft assertions on the Jest expect', () => {
    beforeEach(async () => {
        await standalone.url('https://guinea-pig.webdriver.io/')
        expect.clearSoftFailures()
    })

    afterEach(() => {
        expect.clearSoftFailures()
    })

    it('should record a failure and continue the test', async () => {
        await expect.soft(standalone).toHaveTitle('Wrong title', { wait: 0 })
        await expect.soft(standalone).toHaveTitle('WebdriverJS', { containing: true })

        const failures = expect.getSoftFailures()
        expect(failures).toHaveLength(1)
        expect(failures[0].matcherName).toBe('toHaveTitle')
    })

    it('should throw all the recorded failures with assertSoftFailures()', async () => {
        await expect.soft(standalone).toHaveTitle('Wrong title', { wait: 0 })

        expect(() => expect.assertSoftFailures()).toThrow(/1 soft assertion failure:[\s\S]*toHaveTitle/)
        expect(expect.getSoftFailures()).toHaveLength(0)
    })
})
