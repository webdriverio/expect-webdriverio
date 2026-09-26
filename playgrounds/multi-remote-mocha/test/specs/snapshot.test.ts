import { multiRemoteBrowser } from '@wdio/globals'

describe('Multi-remote Snapshot Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    it('should snapshot the outerHTML shared by every browser as is', async () => {
        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchInlineSnapshot(`"<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>"`)
    })

    it('should snapshot the outerHTML of every browser when it differs', async () => {
        await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
            document.querySelector('#githubRepo')!.textContent = 'GitHub Repo on Firefox'
        })

        await expect(multiRemoteBrowser.$('#githubRepo')).toMatchInlineSnapshot(`
          {
            "chrome": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>",
            "firefox": "<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo on Firefox</a>",
          }
        `)
    })

    it('should snapshot the outerHTML of the selected browsers only', async () => {
        await expect(multiRemoteBrowser.select('firefox').$('#githubRepo')).toMatchInlineSnapshot(`"<a href="https://github.com" id="githubRepo" class="clearfix" data-foundby="link text">GitHub Repo</a>"`)
    })
})
