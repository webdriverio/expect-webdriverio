describe('Snapshot Testing', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Object snapshots', () => {
        it('should match arbitrary object snapshot', () => {
            const data = {
                framework: 'WebdriverIO',
                type: 'automation',
                features: ['browser', 'mobile', 'desktop']
            }
            expect(data).toMatchSnapshot()
        })

        it('should match inline snapshot', () => {
            const config = { timeout: 5000, retries: 3 }
            expect(config).toMatchInlineSnapshot(`
{
  "retries": 3,
  "timeout": 5000,
}
`)
        })
    })

    describe('DOM snapshots', () => {
        it('should match element outerHTML snapshot (ChainablePromiseElement)', async () => {
            const link = await $('#githubRepo')
            await expect(link).toMatchSnapshot()
        })

        it('should match element outerHTML snapshot (Element)', async () => {
            const link = await $('#githubRepo').getElement()
            await expect(link).toMatchSnapshot()
        })

        it('should match command result snapshot', async () => {
            const heading = await $$('h1')[1]
            const cssProperty = await heading.getCSSProperty('font-weight')
            expect(cssProperty).toMatchSnapshot()
        })
    })

    describe('Multiple element snapshots', () => {
        it('should snapshot navigation links', async () => {
            const navLinks = await $$('a')
            const hrefs = []
            for (let i = 0; i < Math.min(5, await navLinks.length); i++) {
                hrefs.push(await navLinks[i].getAttribute('href'))
            }
            expect(hrefs).toMatchSnapshot()
        })
    })
})
