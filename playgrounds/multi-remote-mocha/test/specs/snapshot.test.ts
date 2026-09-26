import { multiRemoteBrowser } from '@wdio/globals'

describe('Multi-remote Snapshot Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    it('should snapshot the outerHTML of every browser', async () => {
        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchInlineSnapshot(`
          {
            "chrome": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>",
            "firefox": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>",
          }
        `)
    })

    it('should snapshot the outerHTML of the selected browsers only', async () => {
        await expect(multiRemoteBrowser.select('firefox').$('#githubRepo')).toMatchInlineSnapshot(`
          {
            "firefox": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>",
          }
        `)
    })
})
